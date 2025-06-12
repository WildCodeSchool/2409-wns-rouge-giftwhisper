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

  @ManyToOne(() => User, (user) => user.id)
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Poll, (poll) => poll.votes)
  @Field(() => Poll)
  poll!: Poll;

  @ManyToOne(() => PollOption, (option) => option.votes)
  @Field(() => PollOption)
  option!: PollOption;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;
}
