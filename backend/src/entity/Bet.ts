import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
    Generated,
    CreateDateColumn
} from "typeorm";
import {Date} from "./_Date";
import {Player} from "./Player";

@Entity()
export class Bet {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne((type) => Player)
    @JoinColumn()
    player: Player;

    @Column()
    propertyType: string;

    @Column({ type: "bigint" })
    amount: string;

    @Column({ type: "bigint" })
    payout: string;

    @Column("json")
    metadata: Record<string, any>;

    @Index()
    @CreateDateColumn()
    dateCreated: Date;
}
