import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";

@ObjectType()
@Entity()
export class ChatLastConnection extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field(() => Date)
  lastConnection!: Date;

  @ManyToOne(() => User, user => user.chatLastConnections)
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Chat, chat => chat.chatLastConnections)
  @Field(() => Chat)
  chat!: Chat;
}