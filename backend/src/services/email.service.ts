import { Resend } from "resend";

import { env } from "../config/env.js";

function formatNairaFromKobo(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    style: "currency"
  }).format(amountKobo / 100);
}

const resend =
  env.resendApiKey.startsWith("your-") || env.resendApiKey === "your-resend-api-key"
    ? null
    : new Resend(env.resendApiKey);

export const emailService = {
  async sendPasswordResetEmail(input: {
    email: string;
    name: string;
    resetToken: string;
  }) {
    const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(
      input.resetToken
    )}`;

    if (!resend) {
      console.warn(
        `Resend not configured. Password reset link for ${input.email}: ${resetUrl}`
      );
      return;
    }

    await resend.emails.send({
      from: env.resendFromEmail,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f1d1f;">
          <h2 style="color: #432235;">Reset your Pen A Wish password</h2>
          <p>Hello ${input.name},</p>
          <p>Use the link below to choose a new password for your account:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in ${env.resetPasswordTtlMinutes} minutes.</p>
        </div>
      `,
      subject: "Reset your Pen A Wish password",
      to: input.email
    });
  },

  async sendNewWishNotification(input: {
    celebrantName: string;
    eventType: string;
    ownerEmail: string;
    senderName: string;
  }) {
    if (!resend) {
      console.warn(
        `Resend not configured. New wish notification for ${input.ownerEmail}: ${input.senderName} left a ${input.eventType.toLowerCase()} wish for ${input.celebrantName}.`
      );
      return;
    }

    await resend.emails.send({
      from: env.resendFromEmail,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f1d1f;">
          <h2 style="color: #432235;">You received a new wish</h2>
          <p>${input.senderName} just left a ${input.eventType.toLowerCase()} wish for ${input.celebrantName}.</p>
        </div>
      `,
      subject: "You received a new wish",
      to: input.ownerEmail
    });
  },

  async sendGuestbookEntryNotification(input: {
    celebrantName: string;
    ownerEmail: string;
    senderName: string;
  }) {
    if (!resend) {
      console.warn(
        `Resend not configured. Guestbook notification for ${input.ownerEmail}: ${input.senderName} left a memory for ${input.celebrantName}.`
      );
      return;
    }

    await resend.emails.send({
      from: env.resendFromEmail,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f1d1f;">
          <h2 style="color: #432235;">You received a new guestbook memory</h2>
          <p>${input.senderName} just shared a memory for ${input.celebrantName}.</p>
        </div>
      `,
      subject: "You received a new guestbook memory",
      to: input.ownerEmail
    });
  },

  async sendGiftNotification(input: {
    amountKobo: number;
    celebrantName: string;
    ownerEmail: string;
    senderName: string;
  }) {
    if (!resend) {
      console.warn(
        `Resend not configured. Gift notification for ${input.ownerEmail}: ${input.senderName} sent ${formatNairaFromKobo(input.amountKobo)} to ${input.celebrantName}.`
      );
      return;
    }

    await resend.emails.send({
      from: env.resendFromEmail,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f1d1f;">
          <h2 style="color: #432235;">You received a new gift</h2>
          <p>${input.senderName} just sent ${formatNairaFromKobo(input.amountKobo)} to ${input.celebrantName}.</p>
        </div>
      `,
      subject: "You received a new gift",
      to: input.ownerEmail
    });
  }
};
