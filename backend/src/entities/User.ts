import { Field, ID, InputType, MiddlewareFn, ObjectType, UseMiddleware } from "type-graphql";
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
import { ContextType, EntityEnum, getUserFromContext } from "../auth";
import type { AuthorisationType } from "../auth";
import { checkAuthorisation } from "../auth";



const checkEntityAuthorisation = async (entities: EntityEnum[], method: AuthorisationType, requestingUserId: number) => {
  const authorisationList = [];
  for (const entity of entities) {
    const authInfo = { method, entity, requestingUserId };
    const isAuthorized = await checkAuthorisation(authInfo);
    authorisationList.push(isAuthorized);
  }
  return authorisationList;
}

function isAuthorized(
  authorisations?: AuthorisationType | AuthorisationType[]
): MiddlewareFn<ContextType> {
  return async ({ context, root }, next) => {
    const user = await getUserFromContext(context);
    const { data } = context;
    const isUser = user?.id === root.id;
    if (
      isUser 
      || data?.resolverMethod === "login" 
      || data?.resolverMethod === "requestPasswordReset"
      || data?.resolverMethod === "cancelPasswordResetRequests"
    ) {
      return next();
    } else if (data && data.entities && authorisations && user) {
      const { entities } = data;
      if (typeof authorisations === 'string') {
        const userAuthorisations = await checkEntityAuthorisation(entities, authorisations, user.id);
        return userAuthorisations.includes(false) ? null : next();
      } else {
        const authorisationChecks = [];
        for (const authorisation of authorisations) {
          const userAuthorisations = await checkEntityAuthorisation(entities, authorisation, user.id);
          userAuthorisations.includes(false) ? authorisationChecks.push(false) : authorisationChecks.push(true);
        }
        return authorisationChecks.some((a) => a === true) ? next() : null;
      }
    }
    return null;
  };
}

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column()
  @Field()
  @UseMiddleware(isAuthorized(['isPartOfGroup', 'isPartOfChat']))
  first_name!: string;

  @Column()
  @Field()
  @UseMiddleware(isAuthorized(['isPartOfGroup', 'isPartOfChat']))
  last_name!: string;

  @Column({ unique: true })
  @Field({ nullable: true })
  @UseMiddleware(isAuthorized('isGroupAdmin'))
  email!: string;

  // {select: false} prevents typeorm from querying the column hashedPassword from the DB
  // so we can safely use relations {user: true} without the password being sent back
  @Column({ select: false })
  hashedPassword!: string;

  @Column()
  @Field()
  @UseMiddleware(isAuthorized())
  date_of_birth!: Date;

  //TODO: set default at false, set at true for testing purposes
  @Column({ default: true })
  @Field()
  @UseMiddleware(isAuthorized())
  is_verified!: boolean;

  @UpdateDateColumn()
  @Field()
  @UseMiddleware(isAuthorized())
  last_login!: Date;

  @CreateDateColumn()
  @Field()
  @UseMiddleware(isAuthorized())
  created_at!: Date;

  @UpdateDateColumn()
  @Field()
  @UseMiddleware(isAuthorized())
  updated_at!: Date;

  @ManyToMany(() => Chat, (chat) => chat.users)
  @Field(() => [Chat])
  chats!: Chat[];

  @ManyToMany(() => Group, (group) => group.users)
  @JoinTable()
  groups!: Group[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  @Field(() => [PasswordResetToken], { nullable: true })
  @UseMiddleware(isAuthorized())
  resetTokens?: PasswordResetToken[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  @Field(() => [Wishlist], { nullable: true })
  wishlists?: Wishlist[];

  @OneToMany(() => ChatLastConnection, chatLastConnection => chatLastConnection.user)
  @UseMiddleware(isAuthorized())
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
