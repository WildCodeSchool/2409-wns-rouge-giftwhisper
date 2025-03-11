import { Length } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @Column({ type: "date", nullable: true})
  @Field()
  end_date?: Date;

  @Column({ type: "boolean", nullable: false})
  @Field()
  is_secret_santa!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  @Field()
  created_at: Date = new Date();

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  @Field()
  updated_at: Date = new Date();

  @Column({ type: "boolean", default: false })
  @Field()
  is_active!: boolean;
}
