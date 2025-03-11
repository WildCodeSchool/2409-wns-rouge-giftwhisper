import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Group } from "./Group";
import { Field } from "type-graphql";

@Entity()
export class UserGroup {

  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  groupId!: number;

  @ManyToOne(() => User, (user) => user.userGroups)
  @JoinColumn({ name: "userId" })
  @Field(() => User)
  user!: User;

  @ManyToOne(() => Group, (group) => group.userGroups)
  @JoinColumn({ name: "groupId" })
  @Field(() => Group)
  group!: Group;    

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  join_at!: Date;
}