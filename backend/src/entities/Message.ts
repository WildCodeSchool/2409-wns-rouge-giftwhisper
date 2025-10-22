import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Poll } from "./Poll";
import { Chat } from "./Chat";

@Entity()
@ObjectType()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  content!: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  createdBy?: User;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;

  @Column({ type: "enum", enum: ["text", "poll"], default: "text" })
  @Field()
  messageType!: string;

  @ManyToOne(() => Poll, { nullable: true, onDelete: "SET NULL" })
  @Field(() => Poll, { nullable: true })
  poll?: Poll;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: "CASCADE" })
  @Field(() => Chat)
  chat!: Chat;
}

@InputType()
export class CreateMessageInput {
  @Field()
  content!: string;
}
