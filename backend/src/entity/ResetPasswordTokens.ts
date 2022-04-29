import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "./Account";
import { Date as Dates } from "./_Date";

@Entity()
export class ResetPasswordTokens {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Account, { eager: true })
  @JoinColumn()
  account: Account;

  @Column()
  token: string;

  @Column({ default: false })
  used: boolean;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  @Column("timestamp", { nullable: true })
  dateUsed: Date;

  @Column("timestamp")
  dateExpires: Date;
}
