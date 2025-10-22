import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Poll } from "./Poll";
import { PollOption } from "./PollOptions";

@Entity()
@ObjectType()
@Unique(["user", "poll", "option"])
export class PollVote extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  user?: User;

  @ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: "CASCADE" })
  @Field(() => Poll)
  poll!: Poll;

  @ManyToOne(() => PollOption, (option) => option.votes, {
    onDelete: "CASCADE",
  })
  @Field(() => PollOption)
  option!: PollOption;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;
}
