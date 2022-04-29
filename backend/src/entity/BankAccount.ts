import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Player } from "./Player";

@Entity()
export class BankAccount {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne((type) => Player)
    @JoinColumn()
    player: Player;

    @Column()
    playerId: number;

    @Column()
    accountType: string;

    @Column({ nullable: true })
    riskiness: string;

    @Column()
    amount: number;

    @Column({ nullable: true })
    result: number;

    @Column()
    status: string;

    @Column("timestamp")
    dateExpires: Date;

    @Index()
    @CreateDateColumn()
    dateCreated: Date;

    @Index()
    @UpdateDateColumn()
    dateUpdated: Date;
}
