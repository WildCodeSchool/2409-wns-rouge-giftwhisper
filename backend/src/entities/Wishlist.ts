import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";
import { User } from "./User";
import { WishlistItem } from "./WishlistItem";

@Entity()
@ObjectType()
export class Wishlist extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  description!: string;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: "CASCADE" })
  @Field(() => User)
  user!: User;

  @CreateDateColumn()
  @Field()
  created_at!: Date;

  @UpdateDateColumn()
  @Field()
  updated_at!: Date;

  @OneToMany(() => WishlistItem, (item) => item.wishlist, { cascade: true })
  @Field(() => [WishlistItem])
  items!: WishlistItem[];
}

@InputType()
export class WishlistCreateInput {
  @Field()
  description!: string;

  @Field(() => ID)
  userId!: number;
}

@InputType()
export class WishlistUpdateInput {
  @Field({ nullable: true })
  description?: string;
}
