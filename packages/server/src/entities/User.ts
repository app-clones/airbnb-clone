import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", { length: 255 })
    email: string;

    // Text not varchar because we're hashing the password
    @Column("text")
    password: string;

    @Column("boolean", { default: false })
    confirmed: boolean;
}
