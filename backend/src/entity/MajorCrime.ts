import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { MajorCrimeTarget } from "./MajorCrimeTarget";
import { Player } from "./Player";
import { MajorCrimePosition } from "./MajorCrimePosition";
import { District } from "./District";

@Entity()
export class MajorCrime {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("json")
  metadata: Record<string, any>;

  @ManyToOne((type) => MajorCrimeTarget)
  @JoinColumn()
  target: MajorCrimeTarget;

  @OneToMany((type) => MajorCrimePosition, (position) => position.majorCrime)
  positions?: MajorCrimePosition[];

  @ManyToOne((type) => District, { eager: true })
  @JoinColumn()
  district: District;

  @Column({ nullable: true })
  districtId: string;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
