import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { Date as Dates } from "./_Date";

@Entity()
export class Item {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  itemCode: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  variant: string;

  @Column()
  image: string;

  @Column()
  rarity: number;

  @Column()
  stackable: boolean;

  @Column()
  tradable: boolean;

  @Column("json")
  usage: Record<string, any>;

  @Column("json")
  metadata: Record<string, any>;

  @Column((type) => Dates)
  date: Dates;
}
