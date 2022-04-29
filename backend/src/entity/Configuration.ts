import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  BaseEntity,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class Configuration {
  @PrimaryColumn()
  name: string;

  @Column()
  value: string;
}
