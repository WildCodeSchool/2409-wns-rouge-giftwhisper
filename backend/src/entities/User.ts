import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @Column({ type: "timestamp", nullable: true })
  @Field()
  last_login: Date = new Date();

  @CreateDateColumn()
  @Field()
  created_at: Date = new Date();

  @UpdateDateColumn()
  @Field()
  updated_at: Date = new Date()
}