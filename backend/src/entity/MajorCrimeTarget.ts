import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { Date as Dates } from "./_Date";

@Entity()
export class MajorCrimeTarget {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column("json")
  metadata: Record<string, any>;

  @Column((type) => Dates)
  date: Dates;
}
