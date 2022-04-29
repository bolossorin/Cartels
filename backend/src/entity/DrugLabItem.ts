import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Player } from "./Player";
import { Date as Dates } from "./_Date";

@Entity()
export class DrugLabItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Player, { eager: true })
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  variant: string;

  @Index()
  @Column()
  itemId: string;

  @Column()
  equipped: boolean;

  @Column((type) => Dates)
  date: Dates;
}
