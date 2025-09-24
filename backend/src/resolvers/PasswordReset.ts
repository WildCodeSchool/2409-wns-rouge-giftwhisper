import Cookies from "cookies";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ContextType } from "../auth";
import { User } from "../entities/User";
import { PasswordResetToken } from "../entities/PasswordResetToken";
import argon2 from "argon2";
import { randomBytes } from "crypto";
import { MoreThan } from "typeorm";
import { emailService } from "../services/Email";

@Resolver()
export class PasswordResetResolver {
  //Processes the password reset request
  @Mutation(() => Boolean)
  async requestPasswordReset(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOneBy({ email });
    if (!user) {
      console.log("Password reset requested for non-existing user");
      return true;
    }

    //Delete all non-expired tokens for this user
    await PasswordResetToken.delete({
      user: { id: user.id },
      expiresAt: MoreThan(new Date()),
    });

    // Generate a secure token
    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    const resetToken = PasswordResetToken.create({
      token,
      user,
      expiresAt,
    });
    await resetToken.save();

    await emailService.sendResetPasswordEmail(user.email, token);

    //Link displayed in console to simplify development (useful with fake emails)
    console.log(
      `Lien de reset : http://localhost:8000/reset-password?token=${token}`
    );

    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ): Promise<boolean> {
    console.log("🔧 resetPassword called with", { token, newPassword });
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      relations: ["user"],
    });

    //Checks if the token exists
    if (!resetToken) {
      throw new Error("Invalid or expired token.");
    }

    const user = resetToken.user;
    if (!user) {
      throw new Error("No user associated with this reset token.");
    }

    //Checks for token expiration and deletes it if expired
    if (resetToken.expiresAt < new Date()) {
      await resetToken.remove();
      throw new Error("Token expired.");
    }

    //Updates the hashed password
    user.hashedPassword = await argon2.hash(newPassword);
    await user.save();

    //Deletes the used token
    await resetToken.remove();

    console.log(`✅ Password reset for user ${user.email}`);

    return true;
  }

  @Mutation(() => Boolean)
  async cancelPasswordResetRequests(
    @Arg("email") email: string
  ): Promise<boolean> {
    const user = await User.findOneBy({ email });
    if (!user) {
      console.log("Tentative d'annulation pour un utilisateur inexistant");
      return true;
    }

    const result = await PasswordResetToken.delete({ user: { id: user.id } });

    console.log(
      `🗑️ ${result.affected} demande(s) de reset supprimée(s) pour ${email}`
    );
    return true;
  }
}
