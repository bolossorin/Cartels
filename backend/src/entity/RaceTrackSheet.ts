import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { District } from "./District";

@Entity()
export class RaceTrackSheet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => District)
  @JoinColumn()
  district: District;

  @Column("json")
  odds: Record<string, any>;

  @Column((type) => Dates)
  date: Dates;
}
