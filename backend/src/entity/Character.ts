import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    BaseEntity
} from "typeorm";

@Entity()
export class Character {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    name: string;
}
