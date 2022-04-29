import {Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, Generated} from "typeorm";
import { Date as Dates } from "./_Date";
import {Player} from "./Player";
import {District} from "./District";

@Entity()
export class Property {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    propertyType: string;

    @ManyToOne((type) => Player, { nullable: true })
    @JoinColumn()
    player: Player;

    @Column({ nullable: true })
    playerId: number;

    @ManyToOne((type) => District, { eager: true })
    @JoinColumn()
    district: District;

    @Column()
    currentState: string;

    @Column("json")
    metadata: Record<string, any>;

    @Column((type) => Dates)
    date: Dates;
}
