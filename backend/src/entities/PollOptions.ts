import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Poll } from "./Poll";
import { PollVote } from "./PollVote";

@Entity()
@ObjectType()
export class PollOption extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  text!: string;

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: "CASCADE" })
  @Field(() => Poll)
  poll!: Poll;

  @OneToMany(() => PollVote, (vote) => vote.option)
  @Field(() => [PollVote])
  votes!: PollVote[];
}
