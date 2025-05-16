import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./User";
import { Field, ID, ObjectType } from "type-graphql";

@Entity()
@ObjectType()
export class PasswordResetToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  token!: string;

  @CreateDateColumn()
  @Field()
  created_at!: Date;

  @Column()
  expiresAt!: Date;

  @ManyToOne(() => User, (user) => user.resetTokens, { onDelete: "CASCADE" })
  @Field(() => User)
  user!: User;
}
