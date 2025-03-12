import { Field, ID, InputType, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

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

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  updatedAt!: Date;
  
  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  users!: User[];
}

@InputType()
export class ChatCreateInput {
  @Field()
  name!: string;

  @Field(() => [UserInput])
  users!: UserInput[];
}

@InputType()
export class UserInput {
  @Field(() => ID)
  id!: number;
}

