import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";
import { Field, ID, ObjectType, InputType } from "type-graphql";

@Entity()
@ObjectType()
export class UserGroup extends BaseEntity {
  @PrimaryColumn({ name: 'userId', type: 'number' })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  @Field(() => User)
  user!: User;

  @PrimaryColumn({ name: 'groupId', type: 'number' })
  @ManyToOne(() => Group, (group) => group.id)
  @JoinColumn({ name: "groupId" })
  @Field(() => Group)
  group!: Group;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  join_at!: Date;
}

