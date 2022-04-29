import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { Crew } from "../entity/Crew";
import { Player } from "../entity/Player";
import { CrewApplication } from "../entity/CrewApplication";
import { formatDate } from "../utils/dates";

export const typeDefs = gql`
  extend type Query {
    crews: Crews!
    crew(input: CrewInput!): Crew! @auth(requires: LOGGEDIN)
    myCrew: MyCrew! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    postApplication(input: PostApplicationInput!): Crew
      @auth(requires: LOGGEDIN)
    crewCreate(input: CrewCreateInput!): Crew @auth(requires: LOGGEDIN)
    applicationVote(input: ApplicationVoteInput!): CrewApplication
      @auth(requires: LOGGEDIN)
    applicationDecline(input: ApplicationDeclineInput!): Crew
      @auth(requires: LOGGEDIN)
    applicationAccept(input: ApplicationAcceptInput!): Crew
      @auth(requires: LOGGEDIN)
    crewBioEdit(input: CrewBioEditInput!): Crew @auth(requires: LOGGEDIN)
    crewQuestionsEdit(input: CrewQuestionsEditInput!): Crew
      @auth(requires: LOGGEDIN)
    crewApplicationsSwitch(input: CrewApplicationsSwitchInput!): Crew
      @auth(requires: LOGGEDIN)
    crewEditTier1(input: CrewEditTier1Input!): Crew @auth(requires: LOGGEDIN)
    crewEditTier2(input: CrewEditTier2Input!): Crew @auth(requires: LOGGEDIN)
    crewEditTier3(input: CrewEditTier3Input!): Crew @auth(requires: LOGGEDIN)
    crewVaultDeposit(input: CrewVaultDepositInput!): VaultDepositResult
      @auth(requires: LOGGEDIN)
    crewVaultWithdraw(input: CrewVaultWithdrawInput!): VaultWithdrawResult
      @auth(requires: LOGGEDIN)
    crewLeave: CrewLeaveResult @auth(requires: LOGGEDIN)
    crewKick(input: CrewKickInput): CrewKickResult @auth(requires: LOGGEDIN)
  }

  type Crews {
    crews: [Crew!]!
    createAvailability: Boolean
    maximumCrews: Int
    crewsLimitCount: Int
    initialHeadquarters: Headquarters
  }

  type MyCrew {
    crew: Crew!
    members: [CrewMember!]!
    canManageApplications: Boolean!
    canManageSettings: Boolean!
    canWithdrawVault: Boolean!
    canManageHeadquarters: Boolean!
    canSetTier1: Boolean!
    canSetTier2: Boolean!
    canSetTier3: Boolean!
    applications: [CrewApplication]
    isFull: Boolean!
    canLeave: Boolean!
    vault: Value!
  }

  type CrewMember {
    member: Player!
    canBeKicked: Boolean!
    hierarchyTier: Int!
  }

  type Headquarters {
    id: Int!
    image: String!
    name: String!
    maxMembers: Int!
    price: Int!
  }

  type Crew {
    name: String!
    id: String!
    image: String
    crewType: String!
    members: [Player!]
    hierarchy: CrewHierarchy!
    influence: Int!
    bio: String
    applications: Boolean!
    applicationQuestions: [String]
    selfApplication: Boolean
  }

  type CrewApplicationAnswer {
    question: String!
    answer: String!
  }

  type CrewApplicationVotes {
    yes: [Player]
    no: [Player]
    hasVotedYes: Boolean
    hasVotedNo: Boolean
  }

  type CrewApplication {
    id: String!
    applicant: Player!
    answers: [CrewApplicationAnswer!]
    votes: CrewApplicationVotes
    dateCreated: String!
  }

  type CrewHierarchy {
    tier1: Player!
    tier2: Player
    tier3: [Player]
  }

  type VaultDepositResult {
    message: String!
    player: Player!
  }

  type VaultWithdrawResult {
    message: String!
    player: Player!
  }

  type CrewLeaveResult {
    crewName: String!
    crewType: String!
    player: Player!
  }

  type CrewKickResult {
    playerName: String!
    crew: Crew!
  }

  input ApplicationDeclineInput {
    applicationId: String!
  }

  input ApplicationAcceptInput {
    applicationId: String!
  }

  input CrewApplicationAnswerInput {
    question: String!
    answer: String!
  }

  input CrewCreateInput {
    name: String!
    crewType: String!
    headquartersId: Int!
  }

  input ApplicationVoteInput {
    applicationId: String!
    vote: String!
  }

  input CrewInput {
    id: String!
  }

  input PostApplicationInput {
    crewId: String!
    answers: [CrewApplicationAnswerInput!]
  }

  input CrewBioEditInput {
    bio: String!
  }

  input CrewEditTier1Input {
    playerId: String!
  }

  input CrewEditTier2Input {
    playerId: String
  }

  input CrewEditTier3Input {
    playersId: [String]
  }

  input CrewQuestionsEditInput {
    questions: [String]!
  }

  input CrewApplicationsSwitchInput {
    applicationsSwitch: Boolean!
  }

  input CrewVaultDepositInput {
    amount: Int!
  }

  input CrewVaultWithdrawInput {
    amount: Int!
  }

  input CrewKickInput {
    playerId: String!
  }
`;

export const resolvers = {
  Query: {
    crew: (_, { input }, context: RequestContext) => {
      return context.service.Crew.getCrew(input.id);
    },
    crews: (_, __, context: RequestContext) => {
      return {};
    },
    myCrew: (_, __, context: RequestContext) => {
      return context.service.Crew.getMyCrew(context.player);
    },
  },

  Mutation: {
    postApplication: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.postApplication(
        context.player,
        input.answers,
        input.crewId
      );

      return context.service.Crew.getCrew(input.crewId);
    },

    applicationVote: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.applicationVote(
        context.player,
        input.applicationId,
        input.vote
      );

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    applicationDecline: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.applicationDecline(
        context.player,
        input.applicationId
      );

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    applicationAccept: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.applicationAccept(
        context.player,
        input.applicationId
      );

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewBioEdit: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.bioEdit(context.player, input.bio);

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewQuestionsEdit: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.questionsEdit(context.player, input.questions);

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewApplicationsSwitch: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.applicationsSwitch(
        context.player,
        input.applicationsSwitch
      );

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewCreate: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.crewCreate(
        context.player,
        input.name,
        input.crewType,
        input.headquartersId
      );

      return await context.service.Crew.getCrew(context.player.crewId);
    },

    crewEditTier1: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.setTier1(context.player, input.playerId);

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewEditTier2: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.setTier2(context.player, input.playerId);

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewEditTier3: async (_, { input }, context: RequestContext) => {
      await context.service.Crew.setTier3(context.player, input.playersId);

      return context.service.Crew.getCrew(context.player.crew.id);
    },

    crewVaultDeposit: async (_, { input }, context: RequestContext) => {
      const result = await context.service.Crew.depositVault(
        context.player,
        input.amount
      );

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },

    crewVaultWithdraw: async (_, { input }, context: RequestContext) => {
      const result = await context.service.Crew.withdrawVault(
        context.player,
        input.amount
      );

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },

    crewKick: async (_, { input }, context: RequestContext) => {
      const result = await context.service.Crew.kickMember(
        context.player,
        input.playerId
      );

      return {
        ...result,
        crew: context.service.Crew.getCrew(context.player.crew.id),
      };
    },

    crewLeave: async (_, __, context: RequestContext) => {
      const result = await context.service.Crew.leaveCrew(context.player);

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },
  },

  Crews: {
    crews: (_, __, context: RequestContext) => {
      return context.service.Crew.getCrews();
    },
    createAvailability: async (_, __, context: RequestContext) => {
      return (
        (await context.service.Game.getConfig("crew_create_enabled")) === "true"
      );
    },
    maximumCrews: async (_, __, context: RequestContext) => {
      return parseInt(await context.service.Game.getConfig("MAXIMUM_CREWS"));
    },
    crewsLimitCount: async (_, __, context: RequestContext) => {
      return context.service.Crew.limitCount();
    },
    initialHeadquarters: async (_, __, context: RequestContext) => {
      return context.service.Crew.getHeadquarters(1);
    },
  },

  CrewMember: {
    member: (parent: Player, __, context: RequestContext) => {
      return parent;
    },
    canBeKicked: (parent, __, context: RequestContext) => {
      return context.service.Crew.canBeKickedCheck(context.player, parent);
    },
    hierarchyTier: (parent, __, context: RequestContext) => {
      return context.service.Crew.hierarchyTier(context.player, parent);
    },
  },

  Crew: {
    hierarchy: (parent: Crew, __, context: RequestContext) => {
      return parent.metadata.hierarchy;
    },
    influence: (parent, __, context: RequestContext) => {
      return parent.metadata.influence;
    },
    bio: (parent, __, context: RequestContext) => {
      return parent.metadata.bio;
    },
    applications: (parent, __, context: RequestContext) => {
      return parent.metadata.applications;
    },
    applicationQuestions: (parent, __, context: RequestContext) => {
      return parent.metadata.applicationQuestions;
    },
    selfApplication: (parent, __, context: RequestContext) => {
      return context.service.Crew.selfApplicationCheck(
        context.player,
        parent.id
      );
    },
  },

  CrewApplication: {
    id: (parent: CrewApplication, __, context: RequestContext) => {
      return parent.id;
    },
    applicant: (parent: CrewApplication, __, context: RequestContext) => {
      return parent.player;
    },
    answers: (parent: CrewApplication, __, context: RequestContext) => {
      return parent.answers;
    },
    votes: (parent: CrewApplication, __, context: RequestContext) => {
      return context.service.Crew.getApplicationVotes(context.player, parent);
    },
    dateCreated: async (
      parent: CrewApplication,
      __,
      context: RequestContext
    ) => {
      return formatDate(parent.dateCreated);
    },
  },

  CrewHierarchy: {
    tier1: (parent, __, context: RequestContext) => {
      return context.service.Player.getPlayerById(parent.tier1);
    },
    tier2: (parent, __, context: RequestContext) => {
      return parent.tier2
        ? context.service.Player.getPlayerById(parent.tier2)
        : null;
    },
    tier3: (parent, __, context: RequestContext) => {
      return parent.tier3.map((tier3LeaderId) =>
        tier3LeaderId
          ? context.service.Player.getPlayerById(tier3LeaderId)
          : null
      );
    },
  },
};
