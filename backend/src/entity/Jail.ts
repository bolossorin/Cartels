import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { Player } from "./Player";
import { District } from "./District";
import { Rank } from "./Rank";

@Entity()
export class Jail {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  crime: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  special: string;

  @Column()
  cellBlock: string;

  @Column((type) => Dates)
  date: Dates;

  @Column("timestamp")
  dateRelease: Date;
}
