import { Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserGroup } from "./UserGroup";

@Entity()
@ObjectType()
export class Group extends BaseEntity {
  
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Length(1, 50, { message: "Name must be under 50 chars" })
  @Field()
  name!: string;

  @Column({ type: "timestamp", nullable: true})
  @Field({ nullable: true })
  end_date?: Date;

  @Column({ type: "boolean", nullable: false})
  @Field()
  is_secret_santa!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  @Field()
  created_at: Date = new Date();

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  @Field({ nullable: true })
  updated_at?: Date;

  @Column({ type: "boolean", default: false })
  @Field()
  is_active!: boolean;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.group)
  @Field(() => [UserGroup])
  userGroups!: UserGroup[];
}

@InputType()
export class GroupCreateInput {
  @Field()
  @Length(1, 50, { message: "Name must be under 50 chars" })
  name!: string;

  @Field({ nullable: true })
  end_date?: Date;

  @Field()
  is_secret_santa!: boolean;
}

@InputType()
export class GroupUpdateInput {
    @Field()
    @Length(1, 50, { message: "Name must be under 50 chars" })
    name?: string;

    @Field({ nullable: true })
    end_date?: Date;

    @Field({ nullable: true })
    is_secret_santa?: boolean;

    @Field({ nullable: true })
    is_active?: boolean;
}
