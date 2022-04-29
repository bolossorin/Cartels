import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Player } from "./Player";
import { IpIntelligence } from "./IpIntelligence";

@Entity()
export class IpAccessLog {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne((type) => Player, { nullable: true })
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @ManyToOne((type) => IpIntelligence, { nullable: true })
  @JoinColumn()
  ip: IpIntelligence;

  @Column({ nullable: true })
  ipId: number;

  @Index()
  @Column()
  dateLastSeen: Date;
}
