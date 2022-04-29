import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Player } from "./Player";
import { Date as Dates } from "./_Date";

@Entity()
export class Promotions {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  title: string;

  @Column()
  levelName: string;

  @Column()
  startPoints: number;

  @Column()
  endPoints: number;

  @Column()
  showRewards: boolean;

  @Column()
  actionText: string;

  @Column({ default: false })
  consumed: boolean;

  @Column()
  tier: number;

  @Column((type) => Dates)
  date: Dates;

  @Column("timestamp", { nullable: true })
  dateConsumed: Date;
}
