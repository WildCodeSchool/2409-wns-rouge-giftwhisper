import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";
import { Field, ObjectType } from "type-graphql";

@Entity()
@ObjectType()
export class UserGroup {
  @PrimaryColumn()
  @Field()
  userId!: number;

  @PrimaryColumn()
  @Field()
  groupId!: number;

  @ManyToOne(() => User, (user) => user.userGroups)
  @JoinColumn({ name: "userId" })
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Group, (group) => group.userGroups)
  @JoinColumn({ name: "groupId" })
  @Field(() => Group)
  group!: Group;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  join_at!: Date;
}
