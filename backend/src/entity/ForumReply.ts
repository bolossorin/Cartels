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
import { ForumThread } from "./ForumThread";
import { Player } from "./Player";

@Entity()
export class ForumReply {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => ForumThread)
  @JoinColumn()
  forumThread: ForumThread;

  @ManyToOne((type) => Player)
  @JoinColumn()
  player: Player;

  @Column()
  content: string;

  @Column({ default: false })
  isHidden: boolean;

  @Index()
  @CreateDateColumn()
  dateCreated: Date;

  @Index()
  @UpdateDateColumn()
  dateUpdated: Date;

  @Column({ nullable: true })
  dateEdited: Date;

  @Column({ nullable: true })
  dateDeleted: Date;
}
