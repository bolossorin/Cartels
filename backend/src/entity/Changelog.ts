import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";

@Entity()
export class Changelog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  imageSrc: string;

  @Column({ nullable: false })
  variant: string;

  @Column({ nullable: false })
  variantColor: string;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
