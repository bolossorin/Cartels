import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    Index,
    ManyToOne,
  } from "typeorm";
  import { Date } from "./_Date";
  import { Player } from "./Player";
  
  @Entity()
  export class ClickStream {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Index()
    @Column()
    eventName: string;

    @Column({ nullable: true })
    ipAddress?: string;
  
    @Column({ nullable: true })
    userAgent?: string;
  
    @Column("json")
    details: object;
  
    @ManyToOne((type) => Player)
    @JoinColumn()
    player?: Player;
  
    @Column((type) => Date)
    date: Date;
  }
  