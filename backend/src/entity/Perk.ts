import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Player } from "./Player";

@Entity()
export class Perk {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Player, { nullable: true })
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column("json")
  effects: Record<string, any>;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  @Column("timestamp", { nullable: true })
  dateStart: Date;

  @Column("timestamp", { nullable: true })
  dateEnd: Date;
}
