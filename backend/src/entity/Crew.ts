import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { Player } from "./Player";
import { CrewHeadquarters } from "./CrewHeadquarters";
import { CrewApplication } from "./CrewApplication";

@Entity()
export class Crew {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  crewType: string;

  @Column()
  name: string;

  @Column({ default: 0, type: "bigint" })
  vault: number;

  @ManyToOne((type) => CrewHeadquarters)
  @JoinColumn()
  headquarters: CrewHeadquarters;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  limitExcluded: boolean;

  @OneToMany((type) => Player, (player) => player.crew)
  members?: Player[];

  @Column("json")
  metadata: Record<string, any>;

  @OneToMany(
    (type) => CrewApplication,
    (crewApplication) => crewApplication.crew
  )
  applications?: CrewApplication[];

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
