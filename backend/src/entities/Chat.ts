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

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  @Field()
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

  @Field(() => String, { nullable: true })
  lastMessageDate?: string;
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
