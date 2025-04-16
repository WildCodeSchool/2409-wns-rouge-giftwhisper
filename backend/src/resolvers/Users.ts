import { Resolver, Query, Mutation, Arg, Ctx, ID } from "type-graphql";
import { User, UserCreateInput, UserLoginInput, UserUpdateInput } from "../entities/User";
import { validate } from "class-validator";
import { sign } from "jsonwebtoken";
import Cookies from "cookies";
import * as argon2 from "argon2";
import { getUserFromContext } from "../auth";

@Resolver()
export class UsersResolver {
  //Create
  @Mutation(() => User)
  async createUser(@Arg("data") data: UserCreateInput): Promise<User> {
    const newUser = new User();
    newUser.email = data.email;
    newUser.first_name = data.first_name;
    newUser.last_name = data.last_name;
    newUser.date_of_birth = data.date_of_birth;

    // Hachage du mot de passe
    newUser.hashedPassword = await argon2.hash(data.password);

    const errors = await validate(newUser);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    await newUser.save();
    return newUser;
  }

  //Read an user
  @Query(() => User, { nullable: true })
  async getUserById(@Arg("id", () => ID) id: number): Promise<User | null> {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new Error(`Utilisateur avec l'ID ${id} non trouvé.`);
    return user;
  }

  //Read all users
  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    return await User.find();
  }

  //Update an user
  @Mutation(() => User)
  async updateUser(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => UserUpdateInput) data: UserUpdateInput
  ): Promise<User> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    // 🔹 Mise à jour des champs optionnels
    if (data.email !== undefined) user.email = data.email;
    if (data.password) user.hashedPassword = await argon2.hash(data.password);
    if (data.first_name !== undefined) user.first_name = data.first_name;
    if (data.last_name !== undefined) user.last_name = data.last_name;
    if (data.date_of_birth !== undefined)
      user.date_of_birth = data.date_of_birth;
    if (data.last_login !== undefined) user.last_login = data.last_login;

    await user.save();
    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg("id", () => ID) id: number): Promise<boolean> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    await user.remove();
    return true;
  }

  // Login 
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("data") data: UserLoginInput,
    @Ctx() context: any,
  ) {
    const { req, res } = context;
    const { email, password } = data;
    const user = await User.findOne({
      where: { email }
    });
    if (!user || !email || !password) return null;
    const isVerified = await argon2.verify(user.hashedPassword, password);
    if (isVerified) {
      const jwtPrivateKey = process.env.JWT_SECRET_KEY;
      if (!jwtPrivateKey) throw new Error('JWT private key is missing from env variables');
      const token = sign({
        id: user.id
      }, jwtPrivateKey);
      const cookie = new Cookies(req, res);
      cookie.set('giftwhisper', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 72,
      });
      return user;
    } else {
      return null;
    }
  }

  // Logout
  @Mutation(() => Boolean)
  async logout(
    @Ctx() context: any
  ) {
    const { req, res } = context;
    const cookies = new Cookies(req, res);
    cookies.set('giftwhisper', "", { maxAge: 0 });
    return true;
  }

  // Get user from jwt
  @Query(() => User, { nullable: true })
  async whoami(@Ctx() context: any) {
    const user = await getUserFromContext(context);
    return user;
  }

}
