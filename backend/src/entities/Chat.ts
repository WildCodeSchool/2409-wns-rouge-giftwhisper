import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";
import { Message } from "./Message";
import { ChatLastConnection } from "./ChatLastConnection";

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt!: Date;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  users!: User[];

  @Field(() => Group)
  @ManyToOne(() => Group, (group) => group.chats)
  group!: Group;

  @OneToMany(() => Message, (message) => message.chat)
  @Field(() => [Message])
  messages!: Message[];

  @Field(() => Date, { nullable: true })
  lastMessageDate?: Date;

  @OneToMany(() => ChatLastConnection, chatLastConnection => chatLastConnection.chat)
  @Field(() => [ChatLastConnection], { nullable: true })
  chatLastConnections!: ChatLastConnection[];

  @Field(() => Number, { nullable: true })
  unreadMessageCount!: number;
}

@InputType()
export class ChatCreateInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => [ID])
  users!: number[];

  @Field(() => ID)
  groupId!: number;
}
