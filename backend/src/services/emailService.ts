import nodemailer from "nodemailer";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT as string),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Désactive la vérification des certificats
      },
    });
  }

  async sendInvitationEmail(
    to: string,
    groupName: string,
    token: string
  ): Promise<void> {
    const invitationUrl = `${process.env.FRONTEND_URL}/invitation/${token}`;

    await this.transporter.sendMail({
      from: `"GiftWhisper - No Reply" <${process.env.SMTP_USER}>`,
      to,
      subject: `Invitation à rejoindre le groupe ${groupName}`,
      html: `
        <h1>Vous avez été invité à rejoindre le groupe ${groupName} !</h1>
        <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
        <a href="${invitationUrl}">Rejoindre le groupe</a>
      `,
    });
  }
}

// Singleton instance
export const emailService = new EmailService();
