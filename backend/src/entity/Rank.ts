import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  BaseEntity,
} from "typeorm";

@Entity()
export class Rank {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ nullable: false })
  exp: number;

  @Column({ nullable: false, default: 0 })
  maxExp: number;
}
