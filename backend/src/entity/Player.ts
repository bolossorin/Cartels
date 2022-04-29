import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  Index,
  OneToOne,
  JoinColumn,
  JoinTable,
  BaseEntity,
  ManyToOne,
  Unique,
  AfterLoad,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { District } from "./District";
import { Character } from "./Character";
import { Rank } from "./Rank";
import { Account } from "./Account";
import { Crew } from "./Crew";
import { MajorCrimePosition } from "./MajorCrimePosition";

const STAFF_ROLES = ["2", "3"];

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  @Generated("uuid")
  uuid: string;

  @Index()
  @Column({ unique: true })
  name: string;

  @Column({ default: 0, type: "bigint" })
  cash: number;

  @Column({ default: 0, type: "bigint" })
  crypto: number;

  @Column({ default: 0, type: "bigint" })
  gold: number;

  @Column({ default: 0, type: "bigint" })
  xp: number;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  bio: string;

  @ManyToOne((type) => Account, (account) => account.players)
  account: Account;

  @ManyToOne((type) => District, { eager: true })
  @JoinColumn()
  district: District;

  @ManyToOne((type) => Character, { eager: true })
  @JoinColumn()
  character: Character;

  @ManyToOne((type) => Rank, { eager: true })
  @JoinColumn()
  rank: Rank;

  @ManyToOne((type) => Crew, { eager: true, nullable: true })
  @JoinColumn()
  crew: Crew;

  @OneToMany((type) => MajorCrimePosition, (position) => position.player)
  majorCrimePosition?: MajorCrimePosition[];

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  districtId: number;

  @Column({ nullable: true })
  characterId: string;

  @Column({ nullable: true })
  rankId: string;

  @Column({ nullable: true })
  crewId: string;

  @Column({ nullable: true, type: "timestamp" })
  dateActive: Date;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  isStaff: boolean;

  @AfterLoad()
  generateIsStaff() {
    this.isStaff = STAFF_ROLES.includes(this.role);
  }
}
