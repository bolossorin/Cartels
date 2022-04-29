import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    Generated,
    BaseEntity
} from "typeorm";

@Entity()
export class District {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    @Generated("uuid")
    uuid: string;

    @Index()
    @Column()
    name: string;
}
