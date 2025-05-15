import { ID, InputType, ObjectType } from "type-graphql";
import { Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Group } from "./Group";

@Entity()
@ObjectType()
export class Invitation extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  token!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  updated_at!: Date;

  @ManyToOne(() => Group, (group) => group.invitations)
  @Field(() => Group)
  group!: Group;
}

@InputType()
export class InvitationCreateInput {
  @Field()
  groupId!: number;

  @Field()
  email!: string;
}
