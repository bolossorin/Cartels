import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  Index,
  ManyToOne,
} from "typeorm";
import { District } from "./District";
import { Rank } from "./Rank";
import { Date } from "./_Date";
import { Player } from "./Player";

@Entity()
export class Log {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column("json")
  details: object;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player?: Player;

  @ManyToOne((type) => District)
  @JoinColumn()
  district?: District;

  @ManyToOne((type) => Rank)
  @JoinColumn()
  rank?: Rank;

  @Column((type) => Date)
  date: Date;

  setPlayer = (player: Player): void => {
    this.player = player;
    this.district = player.district;
    this.rank = player.rank;
  };
}
