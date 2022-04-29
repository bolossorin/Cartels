import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class EmailSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  @Generated("uuid")
  uuid: string;

  @Column()
  email: string;

  @Column()
  source: string;

  @Column()
  campaign: string;

  @Column()
  ipAddress: string;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;
}
