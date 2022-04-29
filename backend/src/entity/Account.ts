import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  Index,
  OneToMany,
  OneToOne,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { IsEmail } from "class-validator";
import { Date } from "./_Date";
import * as pw from "../utils/passwords";
import { Player } from "./Player";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  @Generated("uuid")
  uuid: string;

  @Index()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  emailFull: string;

  @Column()
  public salt?: string;

  @Column()
  private password?: string;

  @Column()
  private comparableKey?: string;

  @OneToOne((type) => Player, { eager: true })
  @JoinColumn()
  player?: Player;

  @OneToMany((type) => Player, (player) => player.account)
  players?: Player[];

  @Column((type) => Date)
  date: Date;

  setPassword = async (password: string): Promise<void> => {
    const {
      salt,
      passwordHash,
      comparablePasswordHash,
    } = await pw.processPassword(password, this);

    this.password = passwordHash;
    this.salt = salt;
    this.comparableKey = comparablePasswordHash;
  };

  isCorrectPassword = async (password: string): Promise<boolean> => {
    const hash = await pw.hash(password, this.salt);

    return pw.safeEqual(this.password, hash);
  };
}
