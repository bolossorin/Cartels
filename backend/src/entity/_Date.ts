import { CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

export class Date {
  @Index()
  @CreateDateColumn()
  created: Date;

  @Index()
  @UpdateDateColumn()
  updated: Date;
}
