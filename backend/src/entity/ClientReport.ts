import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Date } from "./_Date";

@Entity()
export class ClientReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  clid: string;

  @Column()
  build: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column("json")
  stats: object;

  @Column((type) => Date)
  date: Date;
}
