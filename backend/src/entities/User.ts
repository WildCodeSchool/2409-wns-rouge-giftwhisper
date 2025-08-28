import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Chat } from "./Chat";
import { IsEmail, IsStrongPassword } from "class-validator";
import { Group } from "./Group";
import { PasswordResetToken } from "./PasswordResetToken";
import { Wishlist } from "./Wishlist";
import { ChatLastConnection } from "./ChatLastConnection";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  first_name!: string;

  @Column()
  @Field()
  last_name!: string;

  @Column({ unique: true })
  @Field()
  email!: string;

  // {select: false} prevents typeorm from querying the column hashedPassword from the DB
  // so we can safely use relations {user: true} without the password being sent back
  @Column({ select: false })
  hashedPassword!: string;

  @Column()
  @Field()
  date_of_birth!: Date;

  //TODO: set default at false, set at true for testing purposes
  @Column({ default: true })
  @Field()
  is_verified!: boolean;

  @UpdateDateColumn()
  @Field()
  last_login!: Date;

  @CreateDateColumn()
  @Field()
  created_at!: Date;

  @UpdateDateColumn()
  @Field()
  updated_at!: Date;

  @ManyToMany(() => Chat, (chat) => chat.users)
  @Field(() => [Chat])
  chats!: Chat[];

  @ManyToMany(() => Group, (group) => group.users)
  @JoinTable()
  groups!: Group[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  @Field(() => [PasswordResetToken], { nullable: true })
  resetTokens?: PasswordResetToken[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  @Field(() => [Wishlist], { nullable: true })
  wishlists?: Wishlist[];

  @OneToMany(() => ChatLastConnection, chatLastConnection => chatLastConnection.user)
  chatLastConnections!: ChatLastConnection[];
}

@InputType()
export class UserCreateInput {
  @IsEmail()
  @Field()
  email!: string;

  @Field()
  @IsStrongPassword()
  password!: string;

  @Field()
  first_name!: string;

  @Field()
  last_name!: string;

  @Field()
  date_of_birth!: Date;
}

@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  first_name?: string;

  @Field({ nullable: true })
  last_name?: string;

  @Field({ nullable: true })
  date_of_birth?: Date;

  @Field({ nullable: true })
  last_login?: Date;
}

@InputType()
export class UserLoginInput {
  @Field()
  email?: string;

  @Field()
  password?: string;
}
