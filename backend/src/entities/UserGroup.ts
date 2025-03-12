import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Group } from "./Group";
import { Field, ID, ObjectType } from "type-graphql";
@ObjectType()
@Entity()
@ObjectType()
export class UserGroup {
  @PrimaryColumn()
  @Field(() => ID)
  userId!: number;

  @PrimaryColumn()
  @Field(() => ID)
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
