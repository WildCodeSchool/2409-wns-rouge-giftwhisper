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
}

@InputType()
export class WishlistUpdateInput {
  @Field({ nullable: true })
  text?: string;
}
