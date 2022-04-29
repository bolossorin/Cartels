import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Player } from "./Player";
import { Date as Dates } from "./_Date";
import { Item } from "./Item";

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @ManyToOne((type) => Item)
  @JoinColumn()
  item: Item;

  @Column({ nullable: true })
  itemId: string;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  quantity: number;

  @Column({ default: false })
  equipped: boolean;

  @Column((type) => Dates)
  date: Dates;
}
