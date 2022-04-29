import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Date } from "./_Date";

@Entity()
@Unique(["ipAddress"])
export class IpIntelligence {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Index()
  @Column()
  ipAddress: string;

  @Column("json", { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  riskTag: string;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
