import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { Date as Dates } from "./_Date";

@Entity()
export class RaceTrackHorse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  tier: number;

  @Column((type) => Dates)
  date: Dates;
}
