import { Field, ID, ObjectType, InputType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";
import { PollOption } from "./PollOptions";
import { PollVote } from "./PollVote";

@Entity()
@ObjectType()
export class Poll extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  question!: string;

  @Column({ default: false })
  @Field()
  allowMultipleVotes!: boolean;

  @Column({ default: true })
  @Field()
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  @Field({ nullable: true })
  endDate?: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  createdBy?: User;

  @ManyToOne(() => Chat, (chat) => chat.id, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Field(() => Chat, { nullable: true })
  chat?: Chat;

  @OneToMany(() => PollOption, (option) => option.poll)
  @Field(() => [PollOption])
  options!: PollOption[];

  @OneToMany(() => PollVote, (vote) => vote.poll)
  @Field(() => [PollVote])
  votes!: PollVote[];

  @CreateDateColumn()
  @Field()
  createdAt!: Date;
}

@InputType()
export class CreatePollInput {
  @Field()
  question!: string;

  @Field(() => [String])
  options!: string[];

  @Field({ defaultValue: false })
  allowMultipleVotes!: boolean;

  @Field(() => ID)
  chatId!: number;

  @Field({ nullable: true })
  endDate?: Date;
}
