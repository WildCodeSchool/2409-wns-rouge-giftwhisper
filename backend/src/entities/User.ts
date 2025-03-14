import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Chat } from "./Chat";
import { UserGroup } from "./UserGroup";
import { IsEmail, IsStrongPassword } from "class-validator";

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

  @Column()
  hashedPassword!: string;

  @Column({ type: "date" })
  @Field()
  date_of_birth!: Date;

  @Column({ default: false })
  @Field()
  is_verified!: boolean;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  last_login!: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  updated_at!: Date;

  @ManyToMany(() => Chat, (chat) => chat.users)
  @Field(() => [Chat])
  chats!: Chat[];

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user, )
  @Field(() => [UserGroup])
  userGroups!: UserGroup[];
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

  @Field()
  is_verified!: boolean;
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
  is_verified?: boolean;

  @Field({ nullable: true })
  last_login?: Date;
}
