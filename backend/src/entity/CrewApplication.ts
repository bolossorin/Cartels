import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { Player } from "./Player";
import { Crew } from "./Crew";

@Entity()
export class CrewApplication {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  crewId: string;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @ManyToOne((type) => Crew)
  @JoinColumn()
  crew: Crew;

  @Column("json")
  answers: Record<string, any>;

  @Column("json", { nullable: true })
  votes: Record<string, any>;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
