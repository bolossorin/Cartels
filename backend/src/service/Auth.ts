import {
  Transaction,
  TransactionManager,
  EntityManager,
  getRepository,
  MoreThan,
  TransactionRepository,
  Repository,
} from "typeorm";
import { Account } from "../entity/Account";
import { ResetPasswordTokens } from "../entity/ResetPasswordTokens";
import CacheService from "./Cache";
import { createNonce } from "../utils/passwords";
import { UserInputError, AuthenticationError } from "apollo-server-core";
import { validateOrReject } from "class-validator";
import { Item } from "../entity/Item";
import { futureDate } from "../utils/dates";
import { random } from "../utils/random";
import { sendMailTemplate, TEMPLATES } from "../utils/mail";

interface IAccountCredentials {
  email: string;
  password: string;
}

interface IAuthConstructor {
  Cache: CacheService;
}

const AUTH_TOKENS_EXPIRE = 3600 * 24 * 90;

export class AuthService {
  cache: CacheService;

  constructor({ Cache }: IAuthConstructor) {
    this.cache = Cache;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async createAccount(
    @TransactionManager() manager: EntityManager,
    data: IAccountCredentials
  ) {
    let account = await new Account();
    account.email = data.email.trim().toLowerCase();
    account.emailFull = data.email.trim();
    await account.setPassword(data.password);

    await validateOrReject(account);

    return await manager.save(account);
  }

  async emailExists(email: string): Promise<boolean> {
    const account: Account = await getRepository(Account).findOne({
      email: email.trim().toLowerCase(),
    });

    return !!account;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async resetPassword(
    email: string,
    @TransactionRepository(ResetPasswordTokens)
    resetPasswordTokensRepository?: Repository<ResetPasswordTokens>,
    @TransactionRepository(Account) accountRepository?: Repository<Account>
  ): Promise<boolean> {
    const account = await accountRepository.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!account) {
      throw new UserInputError("An account with that email does not exist.");
    }

    // In last hour
    const recentTokensCount = await resetPasswordTokensRepository.count({
      account,
      dateCreated: MoreThan(futureDate(-3600)),
    });
    if (recentTokensCount >= 4) {
      throw new UserInputError(
        "You have reset your password too often recently, please wait to try again."
      );
    }

    const token = new ResetPasswordTokens();
    token.account = account;
    token.dateExpires = futureDate(3600 * 72);
    token.used = false;
    token.token = `R${random(100, 9999999999)}`;

    await resetPasswordTokensRepository.save(token, { reload: true });

    const url = `https://www.cartels.com/reset-password/${token.id}/${token.token}`;

    await sendMailTemplate({
      toEmail: account.email,
      fromEmail: "no-reply@cartels.com",
      subject: "Forgotten your Cartels password?",
      templateId: TEMPLATES.resetPassword,
      variables: {
        resetUrl: url,
      },
    });

    console.log(`Sent mail template for reset password ${url}`);

    return true;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async updatePasswordFromToken(
    id: string,
    token: string,
    newPassword: string,
    @TransactionManager() manager?: EntityManager
  ): Promise<boolean> {
    const resetPasswordToken: ResetPasswordTokens = await getRepository(
      ResetPasswordTokens
    ).findOne({
      id,
      token,
      used: false,
      dateExpires: MoreThan(new Date()),
    });
    if (!resetPasswordToken) {
      throw new UserInputError("That token has expired or is no longer valid!");
    }

    const account = resetPasswordToken.account;

    await account.setPassword(newPassword);
    await manager.save(account);

    resetPasswordToken.used = true;
    resetPasswordToken.dateUsed = new Date();

    await manager.save(resetPasswordToken);

    return true;
  }

  async resetPasswordTokenValid(id: string, token: string): Promise<boolean> {
    const resetPasswordToken: ResetPasswordTokens = await getRepository(
      ResetPasswordTokens
    ).findOne({
      id,
      token,
      used: false,
      dateExpires: MoreThan(new Date()),
    });

    return !!resetPasswordToken;
  }

  async loginAccount(data: IAccountCredentials) {
    const account: Account = await getRepository(Account).findOne({
      email: data.email.trim().toLowerCase(),
    });

    if (!account) {
      throw new AuthenticationError("That account does not exist");
    }
    if (!(await account.isCorrectPassword(data.password))) {
      throw new AuthenticationError(
        "That password is incorrect, please try again."
      );
    }

    return account;
  }

  async createTokenForAccount(account: Account): Promise<string> {
    return await createNonce(account);
  }

  async createNewAuthToken(account: Account): Promise<string> {
    const authToken = await this.createTokenForAccount(account);
    const token = {
      created: new Date().toISOString(),
      accountId: account.id,
      accountSalt: account.salt,
    };

    await this.cache.set(`auth:${authToken}`, token, AUTH_TOKENS_EXPIRE);

    return authToken;
  }

  async getAccountFromAuthToken(authToken: string): Promise<Account> {
    if (!authToken.match("^[a-fA-F0-9]{128}$")) {
      throw new AuthenticationError("Invalid authentication token provided");
    }

    const token = await this.cache.get(`auth:${authToken}`);
    if (!token) {
      throw new AuthenticationError(
        "Your session has expired, please login again"
      );
    }

    const account = await getRepository(Account).findOne(token.accountId);
    if (!account || account.salt !== token.accountSalt) {
      throw new AuthenticationError(
        "Your session has been logged out from another location"
      );
    }

    return account;
  }
}
