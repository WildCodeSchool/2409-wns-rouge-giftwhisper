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

@Entity()
@ObjectType()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  content!: string;

  @ManyToOne(() => User, (user) => user.id)
  @Field(() => User)
  createdBy!: User;

  @CreateDateColumn()
  @Field()
  createdAt!: string;

  @Column({ type: "enum", enum: ["text", "poll"], default: "text" })
  @Field()
  messageType!: string;

  @ManyToOne(() => Poll, { nullable: true })
  @Field(() => Poll, { nullable: true })
  poll?: Poll;
}

@InputType()
export class CreateMessageInput {
  @Field()
  content!: string;
}
