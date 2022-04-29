import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { Player } from "./Player";
import { MajorCrimeTarget } from "./MajorCrimeTarget";
import { MajorCrime } from "./MajorCrime";

@Entity()
export class MajorCrimePosition {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  position: string;

  @OneToOne((type) => Player, { nullable: true })
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @Column("json")
  metadata: Record<string, any>;

  @ManyToOne((type) => MajorCrime)
  @JoinColumn()
  majorCrime: MajorCrime;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
