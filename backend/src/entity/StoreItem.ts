import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { Date as Dates } from "./_Date";

@Entity()
export class StoreItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  price: number;

  @Column()
  goldAmount: number;

  @Column({ nullable: true })
  goldBonus: number;

  @Column()
  image: string;

  @Column({ nullable: true })
  labelCode: string;

  @Column({ nullable: true })
  labelText: string;

  @Column((type) => Dates)
  date: Dates;
}
