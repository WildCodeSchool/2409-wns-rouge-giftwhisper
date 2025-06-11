import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";
import { User } from "./User";
import { Group } from "./Group";

@Entity()
@ObjectType()
export class Wishlist extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column("text")
  @Field()
  text!: string;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: "CASCADE" })
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Group, (group) => group.wishlists, { onDelete: "CASCADE" })
  @Field(() => Group)
  group!: Group;

  @CreateDateColumn()
  @Field()
  created_at!: Date;

  @UpdateDateColumn()
  @Field()
  updated_at!: Date;
}

@InputType()
export class WishlistCreateInput {
  @Field()
  text!: string;

  @Field(() => ID)
  userId!: number;

  @Field(() => ID)
  groupId!: number;
}

@InputType()
export class WishlistUpdateInput {
  @Field({ nullable: true })
  text?: string;
}
