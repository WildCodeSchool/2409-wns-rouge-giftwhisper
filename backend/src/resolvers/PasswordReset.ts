import Cookies from "cookies";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ContextType } from "../auth";
import { User } from "../entities/User";
import { PasswordResetToken } from "../entities/PasswordResetToken";
import argon2 from "argon2";
import { randomBytes } from "crypto";

@Resolver()
export class PasswordResetResolver {
  //gére la demande de réinitialisation du mdp
  @Mutation(() => Boolean)
  async requestPasswordReset(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOneBy({ email });
    if (!user) {
      console.log("Password reset requested for non-existing user");
      return true;
    }
    // Générer un token sécurisé
    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valide 1h

    const resetToken = PasswordResetToken.create({
      token,
      user,
      expiresAt,
    });
    await resetToken.save();

    // Pour l’instant : afficher dans la console
    console.log(
      `Lien de reset : http://localhost:5173/reset-password?token=${token}`
    );

    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ): Promise<boolean> {
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      relations: ["user"],
    });

    //vérifie si le token existe
    if (!resetToken) {
      throw new Error("Invalid or expired token.");
    }

    //vérifie si le token a expiré et suppression du token si périmé
    if (resetToken.expiresAt < new Date()) {
      await resetToken.remove();
      throw new Error("Token expired.");
    }

    //met à jour le MDP haché
    resetToken.user.hashedPassword = await argon2.hash(newPassword);
    await resetToken.user.save();

    //supprime le token utilisé
    await resetToken.remove();

    console.log(`✅ Password reset for user ${resetToken.user.email}`);

    return true;
  }
}
