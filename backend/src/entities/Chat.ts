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

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  @Field()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  @Field({ nullable: true })
  updatedAt!: Date;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  users!: User[];

  @Field(() => Group)
  @ManyToOne(() => Group, (group) => group.chats)
  group!: Group;
}

@InputType()
export class ChatCreateInput {
  @Field()
  name!: string;

  @Field(() => [ID])
  users!: number[];

  @Field(() => ID)
  groupId!: number;
}
