import {
  EntityManager,
  getRepository,
  LessThan,
  MoreThan,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";

import { Changelog } from "../entity/Changelog";
import { MoreThanDate, pastDate } from "../utils/dates";

export class ChangelogService {
  @Transaction({ isolation: "READ COMMITTED" })
  async getChangelogs(
    @TransactionRepository(Changelog)
    changelogRepository?: Repository<Changelog>
  ): Promise<Changelog[]> {
    return await changelogRepository.find({
      order: {
        dateCreated: "DESC",
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getChangelogsCountAfterDate(
    date: Date,
    @TransactionRepository(Changelog)
    changelogRepository?: Repository<Changelog>
  ): Promise<number> {
    return await changelogRepository.count({
      where: {
        dateCreated: MoreThanDate(date ?? pastDate(3600 * 24 * 365 * 10)),
      },
    });
  }
}
