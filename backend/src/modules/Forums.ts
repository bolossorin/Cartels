import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { ForumCategory } from "../entity/ForumCategory";
import { ForumThread } from "../entity/ForumThread";

export const typeDefs = gql`
  extend type Query {
    forumCategories: [ForumCategory!]!
    getForumCategory(input: GetForumCategoryInput!): ForumCategory
    forumThreads(input: ForumThreadsInput!): PagedThreadsResponse
    forumThread(input: ForumThreadInput!): ForumThread
    forumReplies(input: ForumRepliesInput!): PagedRepliesResponse
  }

  extend type Mutation {
    createForumReply(input: CreateForumReplyInput!): PagedRepliesResponse
    createForumThread(input: CreateForumThreadInput!): PagedThreadsResponse
    editForumThread(input: EditForumThreadInput!): ForumThread
    editForumReply(input: EditForumReplyInput!): ForumReply
    hideForumReply(input: HideForumReplyInput!): ForumReply
    lockForumThread(input: LockForumThreadInput!): ForumThread
    stickyForumThread(input: StickyForumThreadInput!): ForumThread
    announcementForumThread(input: AnnouncementForumThreadInput!): ForumThread
    hideForumThread(input: HideForumThreadInput!): ForumThread
    deleteForumThread(input: DeleteForumThreadInput!): PagedThreadsResponse
    deleteForumReply(input: DeleteForumReplyInput!): PagedRepliesResponse
  }

  input CreateForumReplyInput {
    threadId: ID!
    content: String!
  }

  input CreateForumThreadInput {
    categorySlug: String!
    title: String!
    content: String!
  }

  input DeleteForumThreadInput {
    threadId: String!
  }

  input DeleteForumReplyInput {
    replyId: String!
    page: Int!
  }

  input EditForumThreadInput {
    threadId: String!
    title: String!
    content: String!
  }

  input EditForumReplyInput {
    replyId: String!
    threadId: String!
    content: String!
    page: Int!
  }

  input LockForumThreadInput {
    threadId: String!
    lockSwitch: Boolean!
  }

  input StickyForumThreadInput {
    threadId: String!
    stickySwitch: Boolean!
  }

  input AnnouncementForumThreadInput {
    threadId: String!
    announcementSwitch: Boolean!
  }

  input HideForumThreadInput {
    threadId: String!
    hideSwitch: Boolean!
  }

  input HideForumReplyInput {
    replyId: String!
    hideSwitch: Boolean!
  }

  type ForumCategory {
    id: ID!
    name: String!
    slug: String!
    description: String
    isStaffRestricted: Boolean!
    dateCreated: String!
    dateUpdated: String!
    threadsCount: Int!
  }

  type ForumThread {
    id: ID!
    name: String!
    dateCreated: String!
    dateUpdated: String!
    dateReplied: String
    dateEdited: String
    player: Player!
    content: String!
    isLocked: Boolean!
    isAnnouncement: Boolean!
    isPinned: Boolean!
    isHidden: Boolean!
    repliesCount: Int!
    permissions: ThreadPermissions!
  }

  type ThreadPermissions {
    canDelete: Boolean!
    canHide: Boolean!
    canLock: Boolean!
    canEdit: Boolean!
    canPin: Boolean!
    canMakeAnnouncement: Boolean!
  }

  type ForumReply {
    id: ID!
    player: Player!
    content: String!
    dateCreated: String!
    dateUpdated: String!
    dateEdited: String
    permissions: ReplyPermissions!
    isHidden: Boolean!
  }

  type ReplyPermissions {
    canDelete: Boolean!
    canHide: Boolean!
    canEdit: Boolean!
  }

  type PagedThreadsResponse {
    threads: [ForumThread]!
    pages: Int!
    selectedPage: Int!
  }

  type PagedRepliesResponse {
    replies: [ForumReply]!
    pages: Int!
    selectedPage: Int!
  }

  input ForumThreadsInput {
    categoryName: String!
    page: Int
  }

  input ForumThreadInput {
    threadId: ID!
  }

  input ForumRepliesInput {
    threadId: ID!
    page: Int
  }

  input GetForumCategoryInput {
    categorySlug: String!
  }
`;

export const resolvers = {
  Query: {
    getForumCategory: async (_, { input }, context: RequestContext) =>
      await context.service.Forum.getForumCategoryBySlug(
        context.player,
        input.categorySlug
      ),

    forumCategories: async (_, __, context: RequestContext) =>
      await context.service.Forum.getForumCategories(context.player),

    forumThreads: async (_, { input }, context: RequestContext) => {
      return await context.service.Forum.getForumThreads(
        context.player,
        input.categoryName,
        input?.page ?? 1
      );
    },

    forumThread: async (_, { input }, context: RequestContext) => {
      return await context.service.Forum.getForumThread(
        context.player,
        input.threadId,
        1
      );
    },

    forumReplies: async (_, { input }, context: RequestContext) => {
      return await context.service.Forum.getForumReplies(
        context.player,
        input.threadId,
        input?.page ?? 1,
        true
      );
    },
  },

  Mutation: {
    createForumReply: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.createForumReply(
        context.player,
        input.threadId,
        input.content
      );

      const { pages } = await context.service.Forum.getForumReplies(
        context.player,
        input.threadId,
        1,
        false
      );

      return context.service.Forum.getForumReplies(
        context.player,
        input.threadId,
        pages,
        false
      );
    },

    createForumThread: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.createForumThread(
        context.player,
        input.categorySlug,
        input.title,
        input.content
      );

      const { pages } = await context.service.Forum.getForumThreads(
        context.player,
        input.categorySlug,
        1
      );

      return context.service.Forum.getForumThreads(
        context.player,
        input.categorySlug,
        1
      );
    },

    editForumThread: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.editThreadOP(
        context.player,
        input.threadId,
        input.title,
        input.content
      );

      return context.service.Forum.getForumThread(
        context.player,
        input.threadId,
        1
      );
    },

    editForumReply: async (_, { input }, context: RequestContext) => {
      return await context.service.Forum.editReply(
        context.player,
        input.replyId,
        input.content
      );
    },

    hideForumReply: async (_, { input }, context: RequestContext) => {
      return await context.service.Forum.hideReply(
        context.player,
        input.replyId,
        input.hideSwitch
      );
    },

    lockForumThread: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.lockThread(
        context.player,
        input.threadId,
        input.lockSwitch
      );

      return context.service.Forum.getForumThread(
        context.player,
        input.threadId,
        1
      );
    },

    announcementForumThread: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.announcementThread(
        context.player,
        input.threadId,
        input.announcementSwitch
      );

      return context.service.Forum.getForumThread(
        context.player,
        input.threadId,
        1
      );
    },

    stickyForumThread: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.stickyThread(
        context.player,
        input.threadId,
        input.stickySwitch
      );

      return context.service.Forum.getForumThread(
        context.player,
        input.threadId,
        1
      );
    },

    hideForumThread: async (_, { input }, context: RequestContext) => {
      await context.service.Forum.hideThread(
        context.player,
        input.threadId,
        input.hideSwitch
      );

      return context.service.Forum.getForumThread(
        context.player,
        input.threadId,
        1
      );
    },

    deleteForumThread: async (_, { input }, context: RequestContext) => {
      const categoryName = await context.service.Forum.deletePost(
        context.player,
        input.threadId
      );

      return await context.service.Forum.getForumThreads(
        context.player,
        categoryName,
        1
      );
    },

    deleteForumReply: async (_, { input }, context: RequestContext) => {
      const { threadId } = await context.service.Forum.deleteReply(
        context.player,
        input.replyId
      );

      return await context.service.Forum.getForumReplies(
        context.player,
        threadId,
        input.page,
        false
      );
    },
  },

  ForumCategory: {
    threadsCount: async (parent, _, context) => {
      return (
        await context.service.Forum.getForumThreads(
          context.player,
          parent.slug,
          1
        )
      ).totalThreads;
    },
    isStaffRestricted: async (parent, _, __) =>
      parent?.staffRestricted ?? false,
  },

  ForumThread: {
    isLocked: async (parent, _, __) => parent.locked,
    isAnnouncement: async (parent, _, __) => parent.announcement,
    isPinned: async (parent, _, __) => parent.pinned,
    isHidden: async (parent, _, __) => parent.hidden,
    dateReplied: async (parent, _, __) => parent?.dateReplied,
    dateEdited: async (parent, _, __) => parent?.dateEdited,
    repliesCount: async (parent, _, context) => {
      const replies = await context.service.Forum.getForumReplies(
        context.player,
        parent.id,
        1,
        false
      );

      return replies.totalReplies;
    },
    permissions: async (parent, _, context: RequestContext) => {
      return await context.service.Forum.checkThreadPermissions(
        context.player,
        parent.id
      );
    },
  },

  ForumReply: {
    permissions: async (parent, _, context: RequestContext) => {
      return await context.service.Forum.checkReplyPermissions(
        context.player,
        parent.id
      );
    },
    isHidden: async (parent, _, __) => parent.isHidden,
    dateEdited: async (parent, _, __) => parent?.dateEdited,
  },
};
