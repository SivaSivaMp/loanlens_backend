import { IEmailService } from "@/application/interfaces/IEmailService";
import { logger } from "@/config/logger";
import { env } from "node:process";
import nodemailer from "nodemailer";

export class NodemailerEmailService implements IEmailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false, // TLS
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      logger.debug(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    name = "there",
  ): Promise<void> {
    const url = `${env.FRONTEND_URL}/auth/verify-email/${token}`;
    await this.send(
      to,
      "Verify your LoanLens account",
      `
      <h2>Hi ${name},</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create a LoanLens account, ignore this email.</p>
      `,
    );
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    name = "there",
  ): Promise<void> {
    const url = `${env.FRONTEND_URL}/auth/reset-password/${token}`;
    await this.send(
      to,
      "Reset your LoanLens password",
      `
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password. Click below to set a new password:</p>
      <a href="${url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request a password reset, ignore this email.</p>
      `,
    );
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.send(
      to,
      "Welcome to LoanLens!",
      `<h2>Welcome, ${name}!</h2><p>Your account is now active. Log in to get started.</p>`,
    );
  }

  async sendProposalNotification(
    to: string,
    customerName: string,
  ): Promise<void> {
    const url = `${env.FRONTEND_URL}/portal/proposals`;
    await this.send(
      to,
      "Your loan proposal is ready",
      `
      <h2>Hi ${customerName},</h2>
      <p>A certified advisor has reviewed your request and sent you a personalised loan proposal.</p>
      <a href="${url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
        View My Proposal
      </a>
      <p>Log in to the portal to review and confirm your proposal.</p>
      `,
    );
  }

  async sendRateChangeNotification(
    to: string,
    productName: string,
    oldRate: number,
    newRate: number,
  ): Promise<void> {
    const direction = newRate < oldRate ? "⬇ Decreased" : "⬆ Increased";
    await this.send(
      to,
      `Rate ${direction}: ${productName}`,
      `
      <h2>Interest Rate Update</h2>
      <p><strong>${productName}</strong> rate has changed:</p>
      <p>Old rate: ${oldRate}% → New rate: <strong>${newRate}%</strong></p>
      `,
    );
  }
}
