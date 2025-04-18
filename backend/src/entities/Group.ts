import { Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserGroup } from "./UserGroup";
import { Chat } from "./Chat";

@Entity()
@ObjectType()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Length(1, 50, { message: "Name must be under 50 chars" })
  @Field()
  name!: string;

  @Column()
  @Field({ nullable: true })
  end_date?: Date;

  @Column({ nullable: false })
  @Field()
  is_secret_santa!: boolean;

  @CreateDateColumn()
  @Field()
  created_at!: Date;

  @UpdateDateColumn()
  @Field({ nullable: true })
  updated_at!: Date;

  @Column({ default: false })
  @Field()
  is_active!: boolean;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.group)
  @Field(() => [UserGroup])
  userGroups!: UserGroup[];

  @OneToMany(() => Chat, (chat) => chat.group)
  @Field(() => [Chat])
  chats!: Chat[];
}

@InputType()
export class GroupCreateInput {
  @Field()
  @Length(1, 50, { message: "Name must be under 50 chars" })
  name!: string;

  @Field({ nullable: true })
  end_date?: Date;

  @Field()
  is_secret_santa!: boolean;
}

@InputType()
export class GroupUpdateInput {
  @Field({ nullable: true })
  @Length(1, 50, { message: "Name must be under 50 chars" })
  name?: string;

  @Field({ nullable: true })
  end_date?: Date;

  @Field({ nullable: true })
  is_secret_santa?: boolean;

  @Field({ nullable: true })
  is_active?: boolean;

  @Field(() => [ID], { nullable: true })
  userIds?: number[];
}
