import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Date as Dates } from "./_Date";
import { ForumCategory } from "./ForumCategory";
import { Player } from "./Player";
import { Crew } from "./Crew";

@Entity()
export class ForumThread {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => ForumCategory)
  @JoinColumn()
  forumCategory: ForumCategory;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @ManyToOne((type) => Crew, { nullable: true })
  @JoinColumn()
  crew: Crew;

  @Column()
  name: string;

  @Column()
  content: string;

  @Column()
  locked: boolean;

  @Column()
  announcement: boolean;

  @Column()
  pinned: boolean;

  @Column()
  hidden: boolean;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  @Index()
  @Column({ nullable: true })
  dateReplied: Date;

  @Column({ nullable: true })
  dateEdited: Date;

  @Column({ nullable: true })
  dateDeleted: Date;
}
