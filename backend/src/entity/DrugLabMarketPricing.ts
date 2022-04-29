import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { Item } from "./Item";
import { District } from "./District";

@Entity()
export class DrugLabMarketPricing {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => District)
  @JoinColumn()
  district: District;

  @ManyToOne((type) => Item)
  @JoinColumn()
  item: Item;

  @Column({ nullable: true })
  itemId: string;

  @Column({ nullable: true })
  districtId: number;

  @Column()
  price: number;

  @Index()
  @Column({ default: true })
  active: boolean;

  @Column((type) => Dates)
  date: Dates;
}
