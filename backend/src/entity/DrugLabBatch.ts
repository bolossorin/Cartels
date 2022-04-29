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

@Entity()
export class DrugLabBatch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @Column({ nullable: true })
  playerId: number;

  @Column()
  product: string;

  @Column()
  units: number;

  @Column()
  producing: boolean;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  @Column("timestamp", { nullable: true })
  dateStart: Date;

  @Index()
  @Column("timestamp", { nullable: true })
  dateFinish: Date;
}
