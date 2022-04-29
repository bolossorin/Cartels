import { Repository, Transaction, TransactionRepository } from "typeorm";
import { ForumCategory } from "../entity/ForumCategory";
import { ForumThread } from "../entity/ForumThread";
import { ForumReply } from "../entity/ForumReply";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { JailService } from "./Jail";
import { EVENT, LogService } from "./Log";
import { Player } from "../entity/Player";
import { Crew } from "../entity/Crew";
import { determinePlayerTier, MANAGE_FORUM_MINIMUM_TIER } from "./Crew";
import { diffFromNow } from "../utils/dates";

const THREADS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 10;

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Log: LogService;
}

interface DeleteReplyResult {
  threadId: string;
}

interface WhereClause {
  crew?: Crew;
  forumCategory: ForumCategory;
  hidden?: Boolean;
  dateDeleted?: Date;
}

interface WhereRepliesClause {
  isHidden?: Boolean;
  forumThread: ForumThread;
  dateDeleted?: Date;
}

export class ForumService {
  game: GameService;
  metric: MetricService;
  log: LogService;

  constructor({ Game, Metric, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.log = Log;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getForumCategories(
    viewer: Player,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<ForumCategory[]> {
    const categories = await forumCategoryRepository.find({
      order: {
        dateCreated: "ASC",
      },
    });

    if (!viewer.crew) {
      return categories.filter((category) => category.slug !== "crew");
    }

    return categories;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getForumCategoryBySlug(
    viewer: Player,
    slug: string,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<ForumCategory> {
    console.log({ slug });
    return await forumCategoryRepository.findOne({
      where: {
        slug,
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getForumReplies(
    player: Player,
    threadId: string,
    page?: number,
    logImpression?: boolean,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>
  ) {
    const forumThread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
    });
    if (!forumThread) {
      throw new Error("Thread could not be found" + threadId);
    }

    if (!!forumThread.crew && forumThread.crew !== player.crew) {
      throw new Error("You can't see these replies");
    }

    if (forumThread.hidden) {
      if (!player.isStaff) {
        throw new Error("You can't see these replies");
      }
    }

    const whereClause: WhereRepliesClause = { forumThread };
    if (!player.isStaff) {
      whereClause.isHidden = false;
    }
    whereClause.dateDeleted = null;

    const [replies, totalReplies] = await forumReplyRepository.findAndCount({
      where: whereClause,
      order: {
        dateCreated: "ASC",
      },
      take: REPLIES_PER_PAGE,
      skip: ((page ?? 0) - 1) * REPLIES_PER_PAGE,
      relations: ["player"],
    });

    const lastReply = replies?.[replies?.length]?.dateCreated ?? 0;
    const date = new Date();
    const lastReplyDate = date.setTime(parseInt(`${lastReply}`));

    if (logImpression === true) {
      await this.log.event(EVENT.ForumThreadImpression, {
        threadId,
        totalReplies,
        page,
      });

      await this.metric.setMetric(
        player,
        `thread-${threadId}-last-seen`,
        lastReplyDate
      );
    }

    return {
      replies,
      pages: Math.ceil(totalReplies / REPLIES_PER_PAGE),
      selectedPage: page,
      totalReplies,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async createForumThread(
    player: Player,
    categorySlug: string,
    title: string,
    content: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const category = await this.getForumCategoryBySlug(player, categorySlug);
    if (!category) {
      throw new Error("That category does not exist!");
    }
    if (category.staffRestricted && !["2", "3"].includes(player.role)) {
      throw new Error("You do not have permission to post in that category!");
    }
    if (title.length > 70 || content.length > 5000) {
      throw new Error(
        "Your title or content exceeds maximum length constraints!"
      );
    }

    if (categorySlug === "crew") {
      if (!player.crew) {
        throw new Error("You're not in a crew!");
      }
    }

    const thread = new ForumThread();

    if (categorySlug === "crew") {
      if (!player.crew) {
        throw new Error("You're not in a crew!");
      }
      thread.crew = player.crew;
    }
    thread.forumCategory = category;
    thread.content = content;
    thread.name = title;
    thread.player = player;
    thread.locked = false;
    thread.announcement = false;
    thread.pinned = false;
    thread.hidden = false;
    thread.dateReplied = new Date();

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadCreate, {
      title,
      content,
      categorySlug,
    });
    await this.metric.addMetric(player, `forum-posts`, 1);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async createForumReply(
    player: Player,
    threadId: string,
    content: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const thread = await this.getForumThread(player, threadId, 1);
    if (!thread) {
      throw new Error("That thread does not exist!");
    }

    const reply = new ForumReply();
    reply.player = player;
    reply.forumThread = thread;
    reply.content = content;

    await forumReplyRepository.insert(reply);

    thread.dateReplied = new Date();
    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadReply, {
      threadId,
      content,
    });
    await this.metric.addMetric(player, `forum-replies`, 1);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getForumThreads(
    viewer: Player,
    categoryName: string,
    page?: number,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ) {
    const forumCategory = await forumCategoryRepository.findOne({
      where: {
        slug: categoryName,
      },
    });
    if (!forumCategory) {
      throw new Error("Category could not be found");
    }

    const whereClause: WhereClause = { forumCategory };
    if (categoryName === "crew") {
      whereClause.crew = viewer.crew;
    }
    if (!viewer.isStaff) {
      whereClause.hidden = false;
    }
    whereClause.dateDeleted = null;

    const [threads, totalThreads] = await forumThreadRepository.findAndCount({
      where: whereClause,
      order: {
        announcement: "DESC",
        pinned: "DESC",
        dateReplied: "DESC",
      },
      take: THREADS_PER_PAGE,
      skip: ((page ?? 0) - 1) * THREADS_PER_PAGE,
    });

    await this.log.event(EVENT.ForumCategoryImpression, {
      categoryId: forumCategory.id,
      page,
      totalThreads,
    });

    return {
      threads,
      pages: Math.ceil(totalThreads / THREADS_PER_PAGE),
      selectedPage: page,
      totalThreads,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getForumThread(
    viewer: Player,
    threadId: string,
    page?: number,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<ForumThread> {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory", "crew"],
    });

    if (thread.forumCategory.slug === "crew") {
      if (thread.crew.id !== viewer.crew.id) {
        throw new Error("This thread is not available");
      }
    }

    if (!viewer.isStaff) {
      if (thread.hidden) {
        throw new Error("This thread is not available");
      }
    }

    return thread;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async checkThreadPermissions(
    viewer: Player,
    threadId: string,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<object> {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const category = thread.forumCategory;

    let canDelete = viewer.isStaff;
    let canHide = viewer.isStaff;
    let canLock = viewer.isStaff;
    let canEdit = viewer.isStaff;
    let canPin = viewer.isStaff;
    let canMakeAnnouncement = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canDelete = true;
        canLock = true;
        canEdit = true;
        canPin = true;
      }
    }

    if (thread.player.id === viewer.id) {
      canEdit = true;
    }

    return {
      canDelete,
      canHide,
      canLock,
      canEdit,
      canPin,
      canMakeAnnouncement,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async checkReplyPermissions(
    viewer: Player,
    replyId: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<object> {
    const reply = await forumReplyRepository.findOne({
      where: {
        id: replyId,
      },
      relations: ["player", "forumThread", "forumThread.forumCategory"],
    });

    const category = reply.forumThread.forumCategory;

    let canDelete = viewer.isStaff;
    let canHide = viewer.isStaff;
    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canDelete = true;
        canEdit = true;
      }
    }

    if (!canEdit) {
      if (reply.player.id === viewer.id) {
        canEdit = diffFromNow(reply.dateCreated) > -600;
      }
    }

    return {
      canDelete,
      canHide,
      canEdit,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async editThreadOP(
    viewer: Player,
    threadId: string,
    title: string,
    content: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const category = thread.forumCategory;

    const categorySlug = category.slug;

    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      if (thread.player.id === viewer.id) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to edit this thread!"
      );
    }

    if (title.length > 70 || content.length > 5000) {
      throw new Error(
        "Your new title or content exceeds maximum length constraints!"
      );
    }

    thread.content = content;
    thread.name = title;
    thread.dateEdited = new Date();

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadEdit, {
      title,
      content,
      categorySlug,
      threadId,
      originalPoster: thread.player.id,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async editReply(
    viewer: Player,
    replyId: string,
    content: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<ForumReply> {
    const reply = await forumReplyRepository.findOne({
      where: {
        id: replyId,
      },
      relations: ["player", "forumThread", "forumThread.forumCategory"],
    });

    const category = reply.forumThread.forumCategory;

    const categorySlug = category.slug;

    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      if (reply.player.id === viewer.id) {
        canEdit = diffFromNow(reply.dateCreated) > -700;
      }
    }

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to edit this reply!"
      );
    }

    if (content.length > 5000) {
      throw new Error("Your new content exceeds maximum length constraints!");
    }

    reply.content = content;
    reply.dateEdited = new Date();

    await forumReplyRepository.save(reply);

    await this.log.event(EVENT.ForumReplyEdit, {
      content,
      categorySlug,
      replyId,
      originalPoster: reply.player.id,
    });

    return reply;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async lockThread(
    viewer: Player,
    threadId: string,
    lockSwitch: boolean,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const category = thread.forumCategory;

    const categorySlug = category.slug;

    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to lock this thread!"
      );
    }

    thread.locked = lockSwitch;

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadLock, {
      categorySlug,
      threadId,
      locked: lockSwitch,
      originalPoster: thread.player.id,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async stickyThread(
    viewer: Player,
    threadId: string,
    stickySwitch: boolean,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const category = thread.forumCategory;

    const categorySlug = category.slug;

    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to pin this thread!"
      );
    }

    thread.pinned = stickySwitch;

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadSticky, {
      categorySlug,
      threadId,
      sticky: stickySwitch,
      originalPoster: thread.player.id,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async announcementThread(
    viewer: Player,
    threadId: string,
    announcementSwitch: boolean,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const category = thread.forumCategory;

    const categorySlug = category.slug;

    const canEdit = viewer.isStaff;

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to make an announcement from this thread!"
      );
    }

    thread.announcement = announcementSwitch;

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadAnnouncement, {
      categorySlug,
      threadId,
      announcement: announcementSwitch,
      originalPoster: thread.player.id,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async hideThread(
    viewer: Player,
    threadId: string,
    hiddenSwitch: boolean,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ) {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const category = thread.forumCategory;

    const categorySlug = category.slug;

    const canEdit = viewer.isStaff;

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to hide this thread!"
      );
    }

    thread.hidden = hiddenSwitch;

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadHide, {
      categorySlug,
      threadId,
      hidden: hiddenSwitch,
      originalPoster: thread.player.id,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async hideReply(
    viewer: Player,
    replyId: string,
    hideSwitch: boolean,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<ForumReply> {
    const reply = await forumReplyRepository.findOne({
      where: {
        id: replyId,
      },
      relations: ["player", "forumThread", "forumThread.forumCategory"],
    });

    const category = reply.forumThread.forumCategory;

    const categorySlug = category.slug;

    const canEdit = viewer.isStaff;

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to hide this reply!"
      );
    }

    reply.isHidden = hideSwitch;

    await forumReplyRepository.save(reply);

    await this.log.event(EVENT.ForumReplyHide, {
      categorySlug,
      replyId,
      poster: reply.player.id,
    });

    return reply;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async deleteReply(
    viewer: Player,
    replyId: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>
  ): Promise<DeleteReplyResult> {
    const reply = await forumReplyRepository.findOne({
      where: {
        id: replyId,
      },
      relations: ["player", "forumThread", "forumThread.forumCategory"],
    });

    const replies = await forumReplyRepository.find({
      where: {
        forumThread: reply.forumThread,
      },
    });

    const content = reply.content;
    const poster = reply.player.id;
    const threadId: string = reply.forumThread.id;

    const category = reply.forumThread.forumCategory;

    const categorySlug = category.slug;

    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to delete this reply!"
      );
    }

    reply.dateDeleted = new Date();

    await forumReplyRepository.save(reply);

    await this.log.event(EVENT.ForumReplyDelete, {
      categorySlug,
      replyId,
      content,
      poster,
    });

    return {
      threadId,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async deletePost(
    viewer: Player,
    threadId: string,
    @TransactionRepository(ForumReply)
    forumReplyRepository?: Repository<ForumReply>,
    @TransactionRepository(ForumCategory)
    forumCategoryRepository?: Repository<ForumCategory>,
    @TransactionRepository(ForumThread)
    forumThreadRepository?: Repository<ForumThread>
  ): Promise<string> {
    const thread = await forumThreadRepository.findOne({
      where: {
        id: threadId,
      },
      relations: ["player", "forumCategory"],
    });

    const content = thread.content;
    const title = thread.name;
    const poster = thread.player.id;

    const category = thread.forumCategory;

    const categorySlug = category.slug;

    let canEdit = viewer.isStaff;

    if (category.slug === "crew") {
      const tier = determinePlayerTier(viewer.id, viewer.crew);

      if (tier < MANAGE_FORUM_MINIMUM_TIER) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      throw new Error(
        "You don't have the permissions required to delete this thread!"
      );
    }

    thread.dateDeleted = new Date();

    await forumThreadRepository.save(thread);

    await this.log.event(EVENT.ForumThreadDelete, {
      categorySlug,
      threadId,
      title,
      content,
      poster,
    });

    return categorySlug;
  }
}
