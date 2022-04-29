import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Player } from "./Player";
import { Item } from "./Item";
import { District } from "./District";

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @ManyToOne((type) => Item, { eager: true })
  @JoinColumn()
  item: Item;

  @ManyToOne((type) => District, { eager: true })
  @JoinColumn()
  originDistrict: District;

  @ManyToOne((type) => District, { eager: true })
  @JoinColumn()
  district: District;

  @ManyToOne((type) => District, { eager: true, nullable: true })
  @JoinColumn()
  destinationDistrict: District;

  @Column({ nullable: true })
  itemId: string;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  plate: string;

  @Column({ default: false })
  equipped: boolean;

  @Column()
  heat: number;

  @Column()
  damage: number;

  @Column({ default: false })
  plateChanged: boolean;

  @Column({ default: false })
  originShipped: boolean;

  @Column({ default: false })
  shipping: boolean;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  @Column("timestamp", { nullable: true })
  dateShipped: Date;

  @Column("timestamp", { nullable: true })
  dateArrival: Date;
}
