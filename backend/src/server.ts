import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import helmet from "helmet";
import { merge } from "lodash";
import * as crypto from "crypto";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { createServer } from "http";
import { createConnection, getRepository } from "typeorm";
import { AuthService } from "./service/Auth";

import * as Accounts from "./modules/Accounts";
import * as Player from "./modules/Player";
import * as Jail from "./modules/Jail";
import * as Crimes from "./modules/Crimes";
import * as Gamble from "./modules/Gamble";
import * as ClickStream from "./modules/ClickStream";
import * as Lab from "./modules/Lab";
import * as Market from "./modules/Market";
import * as Changelog from "./modules/Changelog";
import * as Forums from "./modules/Forums";
import * as CarTheft from "./modules/CarTheft";
import * as Perk from "./modules/Perk";
import * as Property from "./modules/Property";
import * as Bank from "./modules/Bank";
import * as Store from "./modules/Store";
import * as Crew from "./modules/Crew";
import * as Roulette from "./modules/Roulette";
import * as RaceTrack from "./modules/RaceTrack";
import * as MajorCrimes from "./modules/MajorCrimes";
import * as Event from "./modules/Event";

import CacheService from "./service/Cache";
import { LogService } from "./service/Log";
import AuthDirective from "./directives/Auth";
import { GameService } from "./service/Game";
import { PlayerService } from "./service/Player";
import { JailService } from "./service/Jail";
import { MetricService } from "./service/Metric";
import { QueueService } from "./service/Queue";
import { CrimeService } from "./service/Crime";
import { CarTheftService } from "./service/CarTheft";
import { LabService } from "./service/Lab";
import { MarketService } from "./service/Market";
import { PerkService } from "./service/Perk";
import { ChangelogService } from "./service/Changelog";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { PubSub } from "./globalServices/PubSub";
import { ClientReport } from "./entity/ClientReport";
import bodyParser from "body-parser";
import { ForumService } from "./service/Forum";
import { EmailSubscription } from "./entity/EmailSubscription";
import { PropertyService } from "./service/Property";
import { BankService } from "./service/Bank";
import { StoreService } from "./service/Store";
import { CrewService } from "./service/Crew";
import { RouletteService } from "./service/Roulette";
import { RaceTrackService } from "./service/RaceTrack";
import { MajorCrimesService } from "./service/MajorCrimes";
import { EventService } from "./service/Event";

const PARAGON_AUTH_TOKEN = "paragon-sig-a";

export interface RequestContext {
  account?: any;
  player?: any;
  metadata?: any;
  data: {
    PubSub: RedisPubSub;
  };
  service: {
    Game: GameService;
    Auth: AuthService;
    Cache: CacheService;
    Log: LogService;
    Player: PlayerService;
    Jail: JailService;
    Metric: MetricService;
    Crime: CrimeService;
    CarTheft: CarTheftService;
    Lab: LabService;
    Market: MarketService;
    Changelog: ChangelogService;
    Forum: ForumService;
    Perk: PerkService;
    Property: PropertyService;
    Bank: BankService;
    Store: StoreService;
    Crew: CrewService;
    Roulette: RouletteService;
    RaceTrack: RaceTrackService;
    MajorCrime: MajorCrimesService;
    Event: EventService;
  };
  security: any;
  gameStatus: {
    isLoginEligible: boolean;
    isRegisterEligible: boolean;
  };
}

const baseTypeDefs = `
    type Query {
        _empty: String
    }
    type Mutation {
        _empty: String
    }
    type Subscription {
        _empty: String
    }
`;

const getHeader = (req, key) => {
  if (req && req.headers && key in req.headers) {
    return req.headers[key];
  }
  return null;
};

(async () => {
  const Cache = new CacheService();
  await Cache.connect();

  await createConnection({
    type: "postgres",
    host: process.env.POSTGRES_HOSTNAME,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    entities: [`${__dirname}/entity/*`],
    subscribers: [`${__dirname}/subscriber/*`],
    synchronize: true,
    logging: false,
  })
    .then((connection) => {
      console.log("📂 Postgres has been connected successfully.");
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });

  const perkService = new PerkService();
  const Game = new GameService({ Perk: perkService });
  await Game.warmGameState();

  const Metric = new MetricService({ Cache, PubSub, Perk: perkService });

  const Queue = new QueueService({ redis: Cache.redis, Game, Metric });
  await Queue.createQueues();
  const isProduction = process?.env?.NODE_ENV === "production";

  const contextBuilder = async (
    authToken?: string,
    userAgent?: string,
    ip?: string,
    build?: string,
    clid?: string
  ): Promise<RequestContext> => {
    const Auth = new AuthService({ Cache });
    let account = null;
    let player = null;
    const metadata: any = {
      clid,
      build,
      ip,
    };

    if (authToken) {
      account = await Auth.getAccountFromAuthToken(authToken);
      player = await account.player;

      if (player) {
        Game.setActive({ player });
        Game.recordIp(player, ip);

        metadata.selfInmate = await Game.getPlayerInJail(player);
      }
    }

    const Log = new LogService({ Cache, player, userAgent, ip, build, clid });

    const Jail = new JailService({ Game, Metric, Log, Perk: perkService });

    let isLoginEligible = true;
    let isRegisterEligible = true;
    if (
      [
        "77.59.138.29",
        "121.200.7.47",
        "5.130.157.35",
        "99.128.197.207",
      ].includes(ip ?? "") ||
      process?.env?.NODE_ENV === "development"
    ) {
      isLoginEligible = true;
      isRegisterEligible = true;
    }

    return {
      account,
      player,
      metadata,
      data: {
        PubSub,
      },
      service: {
        Game,
        Auth,
        Cache,
        Log: new LogService({ Cache, player, userAgent, ip, build, clid }),
        Player: new PlayerService({ Cache, Game, account, Metric, Log }),
        Jail,
        Crime: new CrimeService({ Game, Metric, Jail, Perk: perkService, Log }),
        CarTheft: new CarTheftService({
          Game,
          Metric,
          Jail,
          Log,
          Perk: perkService,
        }),
        Metric,
        Lab: new LabService({ Game, Metric, Log, Jail }),
        Market: new MarketService({ Game, Metric, Log, Jail }),
        Changelog: new ChangelogService(),
        Forum: new ForumService({ Game, Metric, Log }),
        Perk: new PerkService(),
        Property: new PropertyService(),
        Bank: new BankService({ Game, Metric, Log }),
        Store: new StoreService({ Game, Metric, Log }),
        Crew: new CrewService({ Metric, Log, Game }),
        Roulette: new RouletteService({ Cache, Game, Metric }),
        RaceTrack: new RaceTrackService({ Cache, Game, Metric }),
        MajorCrime: new MajorCrimesService({ Game, Metric, Log }),
        Event: new EventService({ Game, Log, Metric }),
      },
      security: {
        tag: Buffer.from(
          JSON.stringify({
            hostname: process.env.HOSTNAME,
            player: player ? player.id : null,
          })
        ).toString("hex"),
        debug: {
          account: account ? account.id : null,
          player: account && account.player ? account.player.id : null,
        },
      },
      gameStatus: {
        isLoginEligible,
        isRegisterEligible,
      },
    };
  };

  const APPROVED_SUB_CLIENTS = ["frontend:v1.3"];

  // Express
  const server = new ApolloServer({
    debug: !isProduction,
    tracing: !isProduction,
    introspection: !isProduction,
    typeDefs: [
      gql(baseTypeDefs),
      Accounts.typeDefs,
      Player.typeDefs,
      Jail.typeDefs,
      Crimes.typeDefs,
      Gamble.typeDefs,
      ClickStream.typeDefs,
      Lab.typeDefs,
      Market.typeDefs,
      Changelog.typeDefs,
      Forums.typeDefs,
      CarTheft.typeDefs,
      Property.typeDefs,
      Perk.typeDefs,
      Bank.typeDefs,
      Store.typeDefs,
      Crew.typeDefs,
      Roulette.typeDefs,
      RaceTrack.typeDefs,
      MajorCrimes.typeDefs,
      Event.typeDefs,
    ],
    resolvers: merge(
      Accounts.resolvers,
      Player.resolvers,
      Jail.resolvers,
      Crimes.resolvers,
      Gamble.resolvers,
      ClickStream.resolvers,
      Lab.resolvers,
      Market.resolvers,
      Changelog.resolvers,
      Forums.resolvers,
      CarTheft.resolvers,
      Property.resolvers,
      Perk.resolvers,
      Bank.resolvers,
      Store.resolvers,
      Crew.resolvers,
      Roulette.resolvers,
      RaceTrack.resolvers,
      MajorCrimes.resolvers,
      Event.resolvers,
    ),
    schemaDirectives: {
      auth: AuthDirective,
    },
    subscriptions: {
      path: "/api/graphql/pubsub",
      keepAlive: 5000,
      onConnect: async (params: Record<string, any>, _, ctx) => {
        if (!APPROVED_SUB_CLIENTS.includes(params?.subClientId)) {
          console.log(`Subscriber rejected with client: `, params?.subClientId);

          throw new Error("Unknown subClientId");
        }

        const subscriber = {
          authToken: params?.subAuthToken,
          userAgent: ctx?.request?.headers?.["user-agent"] ?? "unknown",
          ip: ctx?.request?.headers?.["cf-connecting-ip"] ?? "127.0.0.1",
          build: params?.subBuild ?? "unknown",
          clid: params?.subClid,
        };

        console.log(`Subscriber connected`, subscriber);

        return subscriber;
      },
    },
    context: async (ctx: any): Promise<RequestContext> => {
      if (ctx?.connection) {
        const {
          authToken,
          userAgent,
          ip,
          build,
          clid,
        } = ctx?.connection?.context;

        return await contextBuilder(authToken, userAgent, ip, build, clid);
      }

      const userAgent = getHeader(ctx.req, "user-agent");
      const authToken = getHeader(ctx.req, PARAGON_AUTH_TOKEN);
      const ip = isProduction
        ? getHeader(ctx.req, "cf-connecting-ip")
        : "127.0.0.1";

      return await contextBuilder(
        authToken,
        userAgent,
        ip,
        getHeader(ctx.req, "paragon-c-b"),
        getHeader(ctx.req, "paragon-c-a")
      );
    },
    formatResponse: (response, options) => {
      response = {
        ...response,
        extensions: {
          ...response.extensions,
          e: process?.env?.NODE_ENV ?? "unk",
        },
      };
      return response;
    },
    formatError: isProduction
      ? (error) => {
          const correlationId = "12345";

          console.log({
            correlationId,
            code: error?.extensions?.code,
            message: error?.message,
            locations: error?.locations,
            path: error?.path,
            nodes: error?.nodes,
            source: error?.source,
          });

          return {
            code: error?.extensions?.code ?? "SERVER_ERROR",
            message: error.message,
            correlationId,
          };
        }
      : undefined,
  });

  const app = express();
  app.use(helmet());
  app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
  app.use((req, res, next) => {
    res.header(
      "accept-ch",
      "device-memory, dpr, width, viewport-width, rtt, downlink, ect"
    );
    res.header("accept-ch-lifetime", "86400");
    res.header("Access-Control-Max-Age", "86400");
    res.header("check-yourself", "BeforeYouWreckYourself");

    next();
  });
  server.applyMiddleware({
    app,
    path: "/api/graphql",
    cors: {
      origin: isProduction
        ? [
            /\.cartels\.com$/,
            /www\.cartels\.com$/,
            /staging\.cartels\.com$/,
            /\.staging\.cartels\.com$/,
            /\.codeorder\.com$/,
            /\.brinkofwar\.codeorder\.com$/,
            /\.staging\.brinkofwar\.codeorder\.com$/,
          ]
        : "*",
    },
    disableHealthCheck: false,
    onHealthCheck: async () => {
      await Cache.pingTest();
    },
  });
  app.get("/api/v1/clockSync", (req, res) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Access-Control-Allow-Methods", "GET");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    return res.send(JSON.stringify({ clock: new Date() }));
  });
  app.post("/api/v1/collectEmail", bodyParser.text(), (req, res) => {
    const body = JSON.parse(req?.body ?? "{}");
    const cfIp = req.header("cf-connecting-ip") ?? "unk";
    const localIp = req.header("x-real-ip") ?? "unk";
    const ipAddress = body?.ip ?? "n/a";

    if (body?.dryRun) {
      return res.send(`dry_ok`);
    }

    const emailRepo = getRepository(EmailSubscription);
    const emailSub = new EmailSubscription();
    emailSub.email = body?.email ?? "n/a";
    emailSub.campaign = body?.campaign ?? "n/a";
    emailSub.source = body?.source ?? "n/a";
    emailSub.ipAddress = ipAddress;

    emailRepo.save(emailSub);

    return res.send(`email_ok`);
  });

  const nodeServer = createServer(app);

  server.installSubscriptionHandlers(nodeServer);

  nodeServer.listen(8080, () => {
    console.log(
      `🚀 Server ready at http://localhost:8080${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:8080${server.subscriptionsPath}`
    );
  });
})();
