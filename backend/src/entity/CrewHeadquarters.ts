import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CrewHeadquarters {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  maxMembers: number;

  @Column()
  image: string;
}
