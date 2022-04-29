import {
  EntityManager,
  MoreThanOrEqual,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";
import { Crew } from "../entity/Crew";
import { UserInputError } from "apollo-server-core";
import { Player } from "../entity/Player";
import { MetricService } from "./Metric";
import { EVENT, LogService } from "./Log";
import { CrewApplication } from "../entity/CrewApplication";
import { Configuration } from "../entity/Configuration";
import { CrewHeadquarters } from "../entity/CrewHeadquarters";
import { GameService } from "./Game";

interface Constructor {
  Metric: MetricService;
  Log: LogService;
  Game: GameService;
}

export function determinePlayerTier(playerId, crew) {
  let tier = 4;
  for (let k = 3; k > 0; k--) {
    const currentTier = crew.metadata.hierarchy?.[`tier${k}`];
    if (currentTier === playerId || currentTier?.includes?.(playerId)) {
      tier = k;
    }
  }

  return tier;
}

const MANAGE_APPLICATIONS_MINIMUM_TIER = 3;
const MANAGE_SETTINGS_MINIMUM_TIER = 2;
const WITHDRAW_VAULT_MINIMUM_TIER = 2;
const MANAGE_HEADQUARTERS_MINIMUM_TIER = 2;
const SET_TIER_1_MINIMUM_TIER = 1;
const SET_TIER_2_MINIMUM_TIER = 1;
const SET_TIER_3_MINIMUM_TIER = 2;
export const MANAGE_FORUM_MINIMUM_TIER = 3;

export class CrewService {
  metric: MetricService;
  log: LogService;
  game: GameService;

  constructor({ Metric, Log, Game }: Constructor) {
    this.metric = Metric;
    this.log = Log;
    this.game = Game;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getCrews(
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew[]> {
    return await crewRepo.find({
      relations: ["members"],
    });
  }
  @Transaction({ isolation: "READ COMMITTED" })
  async getCrew(
    id: string,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const crew = await crewRepo.findOne({
      where: {
        id: id,
      },
      relations: ["members"],
    });

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async selfApplicationCheck(
    player: Player,
    crewId: string,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>,
    @TransactionRepository(Crew) crewRepo?: Repository<Crew>
  ): Promise<boolean> {
    const existingApplication = await crewApplicationRepo?.findOne({
      where: {
        player: player,
        crewId: crewId,
      },
    });

    return !!existingApplication;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async postApplication(
    player: Player,
    answers: [object],
    crewId: string,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>,
    @TransactionRepository(Crew) crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const existingApplication = await crewApplicationRepo?.findOne({
      where: {
        player: player,
        crewId: crewId,
      },
    });
    if (!!existingApplication) {
      throw new UserInputError("You have already applied to this crew");
    }

    const playerInCrew = player?.crew;
    if (!!playerInCrew) {
      throw new UserInputError("You already are in a crew");
    }

    const crew = await crewRepo.findOne({
      where: {
        id: crewId,
      },
    });

    const membersAmount = crew?.members?.length;
    const maxMembers = crew?.headquarters?.maxMembers;

    if (membersAmount >= maxMembers) {
      throw new UserInputError("The crew reached its maximum capacity!");
    }

    const crewApplication = new CrewApplication();
    crewApplication.player = player;
    crewApplication.crewId = crewId;
    crewApplication.answers = answers;
    crewApplication.votes = {
      no: [],
      yes: [],
    };

    await this.log.event(EVENT.CrewApply, {
      crewId,
      answers,
    });

    await Promise.all([
      this.metric.addMetric(player, `crew-applications-posted`, 1),
      this.metric.addCrewMetric(crew, `crew-applications-received`, 1),
    ]);

    await crewApplicationRepo.save(crewApplication);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async crewCreate(
    player: Player,
    name: string,
    crewType: string,
    headquartersId: number,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew) crewRepo?: Repository<Crew>,
    @TransactionRepository(CrewHeadquarters)
    crewHQRepo?: Repository<CrewHeadquarters>,
    @TransactionRepository(Configuration)
    configRepo?: Repository<Configuration>,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>
  ): Promise<Crew> {
    const playerInCrew = player?.crew;
    if (!!playerInCrew) {
      throw new UserInputError(
        "You already are in a crew. Leave it before creating your own"
      );
    }

    const [_, count] = await crewRepo.findAndCount({
      where: { limitExcluded: false },
    });
    const maxCrews = await this.game.getConfig("crew_create_enabled");

    if (parseInt(maxCrews) <= count) {
      throw new UserInputError("The crews limit has been reached.");
    }

    const existingCrewWithName = await crewRepo?.findOne({
      where: {
        name: name,
      },
    });

    if (!!existingCrewWithName) {
      throw new UserInputError(
        "There is already a crew with this name. Please pick another one"
      );
    }

    const headquarters = await crewHQRepo?.findOne({
      where: {
        id: headquartersId,
      },
    });

    if (!headquarters) {
      throw new UserInputError("There is no selected headquarters");
    }

    if (headquarters.price > player.cash) {
      throw new UserInputError(
        "You don't have enough money to buy the crew's headquarters!"
      );
    }

    const allApplicationsFromPlayer = await crewApplicationRepo?.find({
      where: {
        player: player,
      },
      relations: ["player"],
    });

    await crewApplicationRepo.remove(allApplicationsFromPlayer);

    const newCrew = new Crew();
    newCrew.name = name;
    newCrew.crewType = crewType;
    newCrew.metadata = {
      hierarchy: {
        tier1: player.id,
        tier2: null,
        tier3: [null, null, null],
      },
      influence: 0,
      bio: null,
      applications: false,
      applicationQuestions: [],
    };
    newCrew.limitExcluded = false;
    newCrew.headquarters = headquarters;

    await crewRepo.save(newCrew, { reload: true });

    const amount = headquarters.price;
    player.crew = newCrew;
    player.cash = player.cash - amount;

    await playerRepo.save(player);

    await this.log.event(EVENT.CrewCreate, {
      newCrew,
    });

    await Promise.all([this.metric.addMetric(player, `crew-created`, 1)]);

    return newCrew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getMyCrew(
    player: Player,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew) crewRepo?: Repository<Crew>
  ): Promise<object> {
    const crew = await crewRepo?.findOne({
      where: {
        id: player.crew.id,
      },
      relations: [
        "members",
        "applications",
        "applications.player",
        "headquarters",
      ],
    });

    const myTier = determinePlayerTier(player.id, crew);

    const canManageApplications = myTier <= MANAGE_APPLICATIONS_MINIMUM_TIER;
    const canManageSettings = myTier <= MANAGE_SETTINGS_MINIMUM_TIER;
    const canWithdrawVault = myTier <= WITHDRAW_VAULT_MINIMUM_TIER;
    const canManageHeadquarters = myTier <= MANAGE_HEADQUARTERS_MINIMUM_TIER;
    const canSetTier1 = myTier === SET_TIER_1_MINIMUM_TIER;
    const canSetTier2 = myTier === SET_TIER_2_MINIMUM_TIER;
    const canSetTier3 = myTier <= SET_TIER_3_MINIMUM_TIER;
    const applications = crew.applications;
    const membersAmount = crew?.members?.length;
    const maxMembers = crew?.headquarters?.maxMembers;
    const isFull = membersAmount >= maxMembers;
    const canLeave = myTier > 1;
    const vault = crew.vault;

    return {
      crew,
      canManageApplications,
      canManageSettings,
      canWithdrawVault,
      canManageHeadquarters,
      members: crew.members,
      canSetTier1,
      canSetTier2,
      canSetTier3,
      applications,
      isFull,
      canLeave,
      vault,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async canBeKickedCheck(
    viewer: Player,
    target: Player,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew) crewRepo?: Repository<Crew>
  ): Promise<boolean> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    const viewerTier = determinePlayerTier(viewer.id, crew);
    const targetTier = determinePlayerTier(target.id, crew);

    return viewerTier < targetTier;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async hierarchyTier(
    viewer: Player,
    player: Player,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew) crewRepo?: Repository<Crew>
  ): Promise<number> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    return determinePlayerTier(player.id, crew);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getApplicationVotes(
    viewer: Player,
    application: CrewApplication,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>
  ): Promise<object> {
    async function getVoter(vote) {
      const voter = await playerRepo?.findOne({
        where: {
          id: vote,
        },
      });
      return voter;
    }

    const yesVotes = application?.votes?.yes?.map((vote) => getVoter(vote));
    const noVotes = application?.votes?.no?.map((vote) => getVoter(vote));

    const hasVotedYes = application?.votes?.yes?.includes(viewer.id);
    const hasVotedNo = application?.votes?.no?.includes(viewer.id);

    return {
      yes: yesVotes,
      no: noVotes,
      hasVotedYes,
      hasVotedNo,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async applicationVote(
    viewer: Player,
    applicationId: string,
    vote: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>
  ): Promise<CrewApplication> {
    const application = await crewApplicationRepo?.findOne({
      where: {
        id: applicationId,
      },
    });

    const hasVotedYes = application?.votes?.yes?.includes(viewer.id);
    const hasVotedNo = application?.votes?.no?.includes(viewer.id);
    const oldVote = hasVotedYes ? "yes" : hasVotedNo ? "no" : null;
    let newVote = vote;

    if (vote === "yes") {
      if (hasVotedYes) {
        for (let k = 0; k < application?.votes?.yes?.length; k++) {
          if (application.votes.yes[k] === viewer.id) {
            application.votes.yes.splice(k, 1);
          }
        }
        newVote = null;
        await crewApplicationRepo.save(application);
      }
      if (hasVotedNo) {
        for (let k = 0; k < application?.votes?.no?.length; k++) {
          if (application.votes.no[k] === viewer.id) {
            application.votes.no.splice(k, 1);
          }
        }
        application.votes.yes.push(viewer.id);
        await crewApplicationRepo.save(application);
      }

      if (!hasVotedYes && !hasVotedNo) {
        await application.votes.yes.push(viewer.id);
        await crewApplicationRepo.save(application);
      }
    }

    if (vote === "no") {
      if (hasVotedNo) {
        for (let k = 0; k < application?.votes?.no?.length; k++) {
          if (application.votes.no[k] === viewer.id) {
            application.votes.no.splice(k, 1);
          }
        }
        newVote = null;
        await crewApplicationRepo.save(application);
      }
      if (hasVotedYes) {
        for (let k = 0; k < application?.votes?.yes?.length; k++) {
          if (application.votes.yes[k] === viewer.id) {
            application.votes.yes.splice(k, 1);
          }
        }
        application.votes.no.push(viewer.id);
        await crewApplicationRepo.save(application);
      }

      if (!hasVotedNo && !hasVotedYes) {
        application.votes.no.push(viewer.id);
        await crewApplicationRepo.save(application);
      }

      await this.log.event(EVENT.CrewApplicationVote, {
        applicationId,
        oldVote,
        newVote,
      });

      return application;
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async applicationAccept(
    viewer: Player,
    applicationId: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>
  ): Promise<Crew> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["headquarters", "members"],
    });
    const application = await crewApplicationRepo?.findOne({
      where: {
        id: applicationId,
      },
      relations: ["player"],
    });

    const viewerTier = determinePlayerTier(viewer.id, viewer.crew);

    if (viewerTier > MANAGE_APPLICATIONS_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to manage applications!"
      );
    }

    const membersAmount = crew.members.length;
    const maxMembers = crew.headquarters.maxMembers;

    if (membersAmount >= maxMembers) {
      throw new UserInputError("The crew reached its maximum capacity!");
    }

    const applicant = application.player;

    const applicantIsAlreadyInACrew = !!applicant.crew;

    if (applicantIsAlreadyInACrew) {
      throw new UserInputError("This player is already in a crew!");
    }

    const allApplicationsFromPlayer = await crewApplicationRepo?.find({
      where: {
        player: application.player,
      },
      relations: ["player"],
    });

    applicant.crew = crew;

    await crewApplicationRepo.remove(allApplicationsFromPlayer);
    await playerRepo.save(applicant);

    await this.log.event(EVENT.CrewApplicationAccept, {
      applicationId,
      applicantId: applicant.id,
      crewId: crew.id,
      applicationVotes: application.votes,
    });

    await Promise.all([
      this.metric.addMetric(viewer, `crew-applications-accepted`, 1),
      this.metric.addMetric(
        applicant,
        `crew-applications-accepted-received`,
        1
      ),
      this.metric.addCrewMetric(crew, `crew-applications-accepted`, 1),
    ]);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async applicationDecline(
    viewer: Player,
    applicationId: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>,
    @TransactionRepository(CrewApplication)
    crewApplicationRepo?: Repository<CrewApplication>
  ): Promise<Crew> {
    const application = await crewApplicationRepo?.findOne({
      where: {
        id: applicationId,
      },
      relations: ["player"],
    });

    const viewerTier = determinePlayerTier(viewer.id, viewer.crew);

    if (viewerTier > MANAGE_APPLICATIONS_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to manage applications!"
      );
    }

    await crewApplicationRepo.remove(application);
    const applicant = application.player;
    const crew = viewer.crew;

    await this.log.event(EVENT.CrewApplicationDecline, {
      applicationId,
      applicantId: applicant.id,
      crewId: crew.id,
      applicationVotes: application.votes,
    });

    await Promise.all([
      this.metric.addMetric(viewer, `crew-applications-declined`, 1),
      this.metric.addMetric(
        applicant,
        `crew-applications-declined-received`,
        1
      ),
      this.metric.addCrewMetric(crew, `crew-applications-declined`, 1),
    ]);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async bioEdit(
    viewer: Player,
    bio: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const crew = viewer?.crew;

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier > MANAGE_SETTINGS_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to write this crew's bio!"
      );
    }

    crew.metadata.bio = bio;

    await this.log.event(EVENT.CrewEditBio, {
      crewId: crew.id,
      bio,
    });

    await crewRepo.save(crew);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async questionsEdit(
    viewer: Player,
    questions: [string],
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const crew = viewer?.crew;

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier > MANAGE_SETTINGS_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to edit this crew's application questions!"
      );
    }

    if (questions.length > 5) {
      throw new UserInputError("You submitted too many questions!");
    }

    crew.metadata.applicationQuestions = questions.filter(Boolean);

    await this.log.event(EVENT.CrewEditQuestions, {
      crewId: crew.id,
      questions,
    });

    await crewRepo.save(crew);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async applicationsSwitch(
    viewer: Player,
    applicationsSwitch: boolean,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>,
    @TransactionRepository(CrewHeadquarters)
    crewHQRepo?: Repository<CrewHeadquarters>
  ): Promise<Crew> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members", "headquarters"],
    });

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier > MANAGE_SETTINGS_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to edit this crew's application settings!"
      );
    }

    const membersAmount = crew.members.length;
    const maxMembers = crew.headquarters.maxMembers;

    if (membersAmount >= maxMembers) {
      throw new UserInputError("The crew reached its maximum capacity!");
    }

    crew.metadata.applications = applicationsSwitch;

    await this.log.event(EVENT.CrewApplicationsSwitch, {
      crewId: crew.id,
      applicationsSwitch,
    });

    await crewRepo.save(crew);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getHeadquarters(
    headquartersId: number,
    @TransactionRepository(CrewHeadquarters)
    crewHQRepo?: Repository<CrewHeadquarters>
  ): Promise<CrewHeadquarters> {
    const headquarters = await crewHQRepo?.findOne({
      where: {
        id: headquartersId,
      },
    });

    return headquarters;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async limitCount(
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<number> {
    const crews = await crewRepo.find();

    return crews.filter((crew) => crew.limitExcluded === false).length;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async setTier1(
    viewer: Player,
    playerId: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    const player = await playerRepo?.findOne({
      where: {
        uuid: playerId,
      },
    });

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier > SET_TIER_1_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to set a new leader!"
      );
    }

    if (player.crewId !== viewer.crew.id) {
      throw new UserInputError("This player is not in the crew!");
    }

    const playerTier = determinePlayerTier(player.id, crew);

    if (playerTier === 2) {
      crew.metadata.hierarchy.tier2 = viewer.id;

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 2,
        oldLeaders: player.id,
        newLeaders: viewer.id,
      });
    }

    if (playerTier === 3) {
      const index = crew.metadata.hierarchy.tier3.indexOf(player.id);
      if (index > -1) {
        crew.metadata.hierarchy.tier3[index] = viewer.id;
      }

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 3,
        oldLeaders: player.id,
        newLeaders: viewer.id,
      });
    }

    crew.metadata.hierarchy.tier1 = player.id;

    await this.log.event(EVENT.CrewLeadershipChange, {
      crewId: crew.id,
      tier: 1,
      oldLeaders: viewer.id,
      newLeaders: player.id,
    });

    await crewRepo.save(crew);

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async setTier2(
    viewer: Player,
    playerId: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    const oldLeaders = crew.metadata.hierarchy.tier2;

    const player = await playerRepo?.findOne({
      where: {
        uuid: playerId,
      },
    });

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier > SET_TIER_2_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to set this position!"
      );
    }

    if (playerId === null) {
      crew.metadata.hierarchy.tier2 = null;
      await crewRepo.save(crew);

      return crew;
    }

    if (player.crewId !== viewer.crew.id) {
      throw new UserInputError("This player is not in the crew!");
    }

    const playerTier = determinePlayerTier(player.id, crew);

    if (playerTier < viewerTier) {
      throw new UserInputError("You cannot demote this player!");
    }

    if (playerTier === 3) {
      const index = crew.metadata.hierarchy.tier3.indexOf(player.id);
      if (index > -1) {
        crew.metadata.hierarchy.tier3[index] = null;
      }

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 3,
        oldLeaders: player.id,
        newLeaders: null,
      });
    }

    crew.metadata.hierarchy.tier2 = player.id;

    await crewRepo.save(crew);

    await this.log.event(EVENT.CrewLeadershipChange, {
      crewId: crew.id,
      tier: 2,
      oldLeaders,
      newLeaders: player.id,
    });

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async setTier3(
    viewer: Player,
    playersId: [string, string, string],
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<Crew> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    const oldLeaders = crew.metadata.hierarchy.tier3;

    const player1 = await playerRepo?.findOne({
      where: {
        uuid: playersId[0],
      },
    });
    const player2 = await playerRepo?.findOne({
      where: {
        uuid: playersId[1],
      },
    });
    const player3 = await playerRepo?.findOne({
      where: {
        uuid: playersId[2],
      },
    });

    const players = [player1, player2, player3].filter(Boolean);

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier > SET_TIER_3_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the required permission to set this position!"
      );
    }

    crew.metadata.hierarchy.tier3 = [];

    if (players.length > 3) {
      throw new UserInputError("Too many players selected!");
    }

    for (let i = 0; i < players.length; i++) {
      if (players[i].crewId !== crew.id) {
        throw new UserInputError("This player is not in the crew!");
      }

      const playerTier = determinePlayerTier(players[i].id, crew);

      if (playerTier < viewerTier) {
        throw new UserInputError("You cannot demote this player!");
      }

      if (playerTier === 2) {
        crew.metadata.hierarchy.tier2 = null;
      }

      crew.metadata.hierarchy.tier3.push(players[i].id);
    }

    if (players.length < 3) {
      for (let i = 0; i < 3; i++) {
        if (!players[i]) {
          crew.metadata.hierarchy.tier3.push(null);
        }
      }
    }

    await crewRepo.save(crew);

    await this.log.event(EVENT.CrewLeadershipChange, {
      crewId: crew.id,
      tier: 3,
      oldLeaders,
      newLeaders: players.map((player) => player.id),
    });

    return crew;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async depositVault(
    viewer: Player,
    amount: number,
    @TransactionManager() manager?: EntityManager
  ): Promise<object> {
    const crew = await manager.getRepository(Crew).findOne(viewer.crew.id);

    if (amount > viewer.cash) {
      throw new UserInputError("You don't have enough money");
    }

    if (amount <= 0) {
      throw new UserInputError("You can only deposit positive amounts!");
    }

    const varName = await manager
      .createQueryBuilder()
      .update(Player)
      .set({ cash: () => `cash - ${amount}` })
      .where({ id: viewer.id, cash: MoreThanOrEqual(amount) })
      .execute();

    if (varName.affected === 0) {
      throw new UserInputError("You don't have enough money");
    }

    await manager
      .createQueryBuilder()
      .update(Crew)
      .set({ vault: () => `vault + ${amount}` })
      .where({ id: viewer.crew.id })
      .execute();

    await Promise.all([
      this.metric.addMetric(viewer, `crew-vault-deposits`, 1),
      this.metric.addMetric(viewer, `crew-vault-deposits-amount`, amount),
      this.metric.addCrewMetric(crew, `crew-vault-deposits`, 1),
      this.metric.addCrewMetric(crew, `crew-vault-deposits-amount`, amount),
      this.metric.addCrewMetric(
        crew,
        `crew-vault-deposits-player-${viewer.id}`,
        1
      ),
      this.metric.addCrewMetric(
        crew,
        `crew-vault-deposits-amount-player-${viewer.id}`,
        amount
      ),
    ]);

    await this.log.event(EVENT.CrewVaultDeposit, {
      crewId: crew.id,
      amount,
    });

    return {
      message: `You successfully deposited $${amount.toLocaleString()} in the Crew's vault.`,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async withdrawVault(
    viewer: Player,
    amount: number,
    @TransactionManager() manager?: EntityManager
  ): Promise<object> {
    const crew = await manager.getRepository(Crew).findOne(viewer.crew.id);

    const playerTier = determinePlayerTier(viewer.id, crew);

    if (amount <= 0) {
      throw new UserInputError("You can only withdraw positive amounts!");
    }

    if (playerTier > WITHDRAW_VAULT_MINIMUM_TIER) {
      throw new UserInputError(
        "You don't have the permissions to withdraw the crew's money!"
      );
    }

    if (amount > crew.vault) {
      throw new UserInputError(
        "The Crew's vault doesn't contain enough money!"
      );
    }
    const varName = await manager
      .createQueryBuilder()
      .update(Crew)
      .set({ vault: () => `vault - ${amount}` })
      .where({ id: viewer.crew.id, vault: MoreThanOrEqual(amount) })
      .execute();

    if (varName.affected === 0) {
      throw new UserInputError(
        "The Crew's vault doesn't contain enough money!"
      );
    }

    await manager
      .createQueryBuilder()
      .update(Player)
      .set({ cash: () => `cash + ${amount}` })
      .where({ id: viewer.id })
      .execute();

    await Promise.all([
      this.metric.addMetric(viewer, `crew-vault-withdrawals`, 1),
      this.metric.addMetric(viewer, `crew-vault-withdrawals-amount`, amount),
      this.metric.addCrewMetric(crew, `crew-vault-withdrawals`, 1),
      this.metric.addCrewMetric(crew, `crew-vault-withdrawals-amount`, amount),
      this.metric.addCrewMetric(
        crew,
        `crew-vault-withdrawals-player-${viewer.id}`,
        1
      ),
      this.metric.addCrewMetric(
        crew,
        `crew-vault-withdrawals-amount-player-${viewer.id}`,
        amount
      ),
    ]);

    await this.log.event(EVENT.CrewVaultWithdraw, {
      crewId: crew.id,
      amount,
    });

    return {
      message: `You successfully withdrew $${amount.toLocaleString()} from the Crew's vault.`,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async kickMember(
    viewer: Player,
    playerId: string,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<object> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    const player = await playerRepo?.findOne({
      where: {
        uuid: playerId,
      },
    });

    const viewerTier = determinePlayerTier(viewer.id, crew);
    const playerTier = determinePlayerTier(player.id, crew);

    if (playerTier <= viewerTier) {
      throw new UserInputError("You cannot kick this player!");
    }

    if (playerTier === 3) {
      const index = crew.metadata.hierarchy.tier3.indexOf(player.id);
      if (index > -1) {
        crew.metadata.hierarchy.tier3[index] = null;
      }

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 3,
        oldLeaders: player.id,
        newLeaders: null,
      });
    }

    if (playerTier === 2) {
      crew.metadata.hierarchy.tier2 = null;

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 2,
        oldLeaders: player.id,
        newLeaders: null,
      });
    }

    player.crew = null;

    await crewRepo.save(crew);
    await playerRepo.save(player);

    await this.log.event(EVENT.CrewKick, {
      crewId: crew.id,
      kickedPlayer: player.id,
    });

    return {
      playerName: player.name,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async leaveCrew(
    viewer: Player,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>,
    @TransactionRepository(Crew)
    crewRepo?: Repository<Crew>
  ): Promise<object> {
    const crew = await crewRepo?.findOne({
      where: {
        id: viewer.crew.id,
      },
      relations: ["members"],
    });

    const viewerTier = determinePlayerTier(viewer.id, crew);

    if (viewerTier === 1) {
      throw new UserInputError("You cannot leave the Crew as its leader!");
    }

    if (viewerTier === 3) {
      const index = crew.metadata.hierarchy.tier3.indexOf(viewer.id);
      if (index > -1) {
        crew.metadata.hierarchy.tier3[index] = null;
      }

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 3,
        oldLeaders: viewer.id,
        newLeaders: null,
      });
    }

    if (viewerTier === 2) {
      crew.metadata.hierarchy.tier2 = null;

      await this.log.event(EVENT.CrewLeadershipChange, {
        crewId: crew.id,
        tier: 2,
        oldLeaders: viewer.id,
        newLeaders: null,
      });
    }

    viewer.crew = null;

    await crewRepo.save(crew);
    await playerRepo.save(viewer);

    await this.log.event(EVENT.CrewLeave, {
      crewId: crew.id,
      kickedPlayer: viewer.id,
    });

    return {
      crewName: crew.name,
      crewType: crew.crewType,
    };
  }
}
