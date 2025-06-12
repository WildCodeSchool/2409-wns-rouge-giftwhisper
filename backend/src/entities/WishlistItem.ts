import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";
import { Wishlist } from "./Wishlist";
import { IsUrl } from "class-validator";

@Entity()
@ObjectType()
export class WishlistItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  label!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  link?: string;

  @CreateDateColumn()
  @Field()
  created_at!: Date;

  @UpdateDateColumn()
  @Field()
  updated_at!: Date;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: "CASCADE",
  })
  @Field(() => Wishlist)
  wishlist!: Wishlist;
}

@InputType()
export class WishlistItemCreateInput {
  @Field()
  label!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @IsUrl({}, { message: "Le lien doit être une URL valide." })
  link?: string;
}

@InputType()
export class WishlistItemUpdateInput {
  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @IsUrl({}, { message: "Le lien doit être une URL valide." })
  link?: string;
}
