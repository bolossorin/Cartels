import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  AfterLoad,
  BeforeInsert,
} from "typeorm";
import { Date } from "./_Date";
import { checksum } from "../utils/passwords";

@Entity()
export class Statistic {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  target: string;

  @Index()
  @Column()
  metricName: string;

  @Column("json")
  data: Record<string, any>;

  @Column({ nullable: true })
  checksum: string;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @BeforeInsert()
  async generateChecksum() {
    this.checksum = await checksum(this.data);
  }
}
