import { Resend } from "resend";

import { env } from "../config/env.js";

function formatNairaFromKobo(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    style: "currency"
  }).format(amountKobo / 100);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailTemplate(input: {
  badge: string;
  body: string;
  buttonLabel?: string;
  buttonUrl?: string;
  eyebrow: string;
  footerNote?: string;
  greeting?: string;
  title: string;
}) {
  const buttonHtml = input.buttonLabel && input.buttonUrl
    ? `
      <tr>
        <td align="center" style="padding: 10px 0 4px;">
          <a
            href="${input.buttonUrl}"
            style="display:inline-block;background:linear-gradient(135deg,#5f324a 0%,#8b5a7a 55%,#d48b8d 100%);color:#fff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:16px 28px;border-radius:999px;box-shadow:0 10px 24px rgba(95,50,74,0.22),inset 0 1px 0 rgba(255,255,255,0.22);"
          >
            ${escapeHtml(input.buttonLabel)}
          </a>
        </td>
      </tr>
    `
    : "";

  return `
    <div style="margin:0;background:linear-gradient(180deg,#f8f1ea 0%,#f3e4d5 100%);padding:32px 0;font-family:Inter,Arial,sans-serif;color:#31202b;">
      <div style="max-width:640px;margin:0 auto;padding:0 18px;">
        <div style="border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#fffaf4 0%,#fff5ea 100%);border:1px solid rgba(95,50,74,0.08);box-shadow:0 24px 70px rgba(67,34,53,0.12);">
          <div style="background:linear-gradient(135deg,#5f324a 0%,#8b5a7a 45%,#d58d8d 100%);padding:30px 28px;text-align:center;">
            <div style="display:inline-block;border-radius:999px;background:rgba(255,255,255,0.16);padding:7px 14px;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
              ${escapeHtml(input.badge)}
            </div>
            <h1 style="margin:18px 0 0;font-size:30px;line-height:1.15;color:#fff;font-family:Georgia,'Times New Roman',serif;font-weight:700;">
              ${escapeHtml(input.title)}
            </h1>
          </div>
          <div style="padding:30px 28px 28px;">
            <p style="margin:0 0 14px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9b6f5b;font-weight:700;">
              ${escapeHtml(input.eyebrow)}
            </p>
            ${input.greeting ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#432235;">${escapeHtml(input.greeting)}</p>` : ""}
            <div style="margin:0 0 22px;padding:20px 20px 18px;border-radius:22px;background:#fff;border:1px solid rgba(95,50,74,0.08);box-shadow:0 12px 30px rgba(67,34,53,0.06);">
              <div style="font-size:16px;line-height:1.9;color:#3d3138;">${input.body}</div>
            </div>
            ${buttonHtml}
            ${input.footerNote ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#7a6770;text-align:center;">${escapeHtml(input.footerNote)}</p>` : ""}
          </div>
        </div>
        <p style="margin:18px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#8d7d85;">
          Pen A Wish · Warm celebration pages for wishes, memories, and gifts.
        </p>
      </div>
    </div>
  `;
}

const resend =
  env.resendApiKey.startsWith("your-") || env.resendApiKey === "your-resend-api-key"
    ? null
    : new Resend(env.resendApiKey);

async function sendEmailWithDebug(input: {
  from: string;
  html: string;
  subject: string;
  to: string | string[];
}) {
  if (!resend) {
    return;
  }

  try {
    await resend.emails.send(input);
  } catch (error) {
    console.error("Resend email send failed", {
      error,
      from: input.from,
      subject: input.subject,
      to: input.to
    });
    throw error;
  }
}

export const emailService = {
  async sendLoginAlertEmail(input: {
    email: string;
    name: string;
  }) {
    if (!resend) {
      console.warn(`Resend not configured. Login alert for ${input.email}.`);
      return;
    }

    await sendEmailWithDebug({
      from: env.resendFromEmail,
      html: renderEmailTemplate({
        badge: "Security alert",
        body: `
          <p style="margin:0 0 12px;">We noticed a new sign-in to your Pen A Wish account.</p>
          <p style="margin:0;color:#6f5d67;">If this was you, you can safely ignore this message. If not, please reset your password right away.</p>
        `,
        buttonLabel: "Reset password",
        buttonUrl: `${env.frontendUrl}/forgot-password`,
        eyebrow: "Account activity",
        footerNote: "For your safety, never share your password or one-time codes.",
        greeting: `Hello ${input.name},`,
        title: "New login to your account"
      }),
      subject: "New login to your Pen A Wish account",
      to: input.email
    });
  },

  async sendWithdrawalAlertEmail(input: {
    accountName: string;
    accountNumber: string;
    amountKobo: number;
    bankName: string;
    email: string;
    name: string;
    requestId: string;
  }) {
    if (!resend) {
      console.warn(`Resend not configured. Withdrawal alert for ${input.email}.`);
      return;
    }

    await sendEmailWithDebug({
      from: env.resendFromEmail,
      html: renderEmailTemplate({
        badge: "Withdrawal alert",
        body: `
          <p style="margin:0 0 14px;">Your withdrawal request has been received and is now being processed.</p>
          <div style="margin:0 0 14px;padding:16px;border-radius:18px;background:#faf4ee;border:1px solid rgba(95,50,74,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;line-height:1.7;color:#3d3138;">
              <tr><td style="padding:4px 0;color:#9b6f5b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Request ID</td><td align="right" style="padding:4px 0;font-weight:600;">${escapeHtml(input.requestId)}</td></tr>
              <tr><td style="padding:4px 0;color:#9b6f5b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Amount</td><td align="right" style="padding:4px 0;font-weight:600;">${escapeHtml(formatNairaFromKobo(input.amountKobo))}</td></tr>
              <tr><td style="padding:4px 0;color:#9b6f5b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Bank</td><td align="right" style="padding:4px 0;font-weight:600;">${escapeHtml(input.bankName)}</td></tr>
              <tr><td style="padding:4px 0;color:#9b6f5b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Account Name</td><td align="right" style="padding:4px 0;font-weight:600;">${escapeHtml(input.accountName)}</td></tr>
              <tr><td style="padding:4px 0;color:#9b6f5b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Account Number</td><td align="right" style="padding:4px 0;font-weight:600;">${escapeHtml(input.accountNumber)}</td></tr>
              <tr><td style="padding:4px 0;color:#9b6f5b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Status</td><td align="right" style="padding:4px 0;font-weight:700;color:#5f324a;">Pending review</td></tr>
            </table>
          </div>
          <p style="margin:0;color:#6f5d67;">We’ll notify you again once the withdrawal has been reviewed and processed.</p>
        `,
        buttonLabel: "Open wallet",
        buttonUrl: `${env.frontendUrl}/wallet`,
        eyebrow: "Payout details",
        footerNote: "Keep this email for your records until the transfer is completed.",
        greeting: `Hello ${input.name},`,
        title: "Your withdrawal request is on the way"
      }),
      subject: "Your withdrawal request has been received",
      to: input.email
    });
  },

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

    await sendEmailWithDebug({
      from: env.resendFromEmail,
      html: renderEmailTemplate({
        badge: "Pen A Wish",
        body: `
          <p style="margin:0 0 12px;">Use the button below to choose a new password for your account.</p>
          <p style="margin:0;color:#6f5d67;">This link expires in ${env.resetPasswordTtlMinutes} minutes.</p>
        `,
        buttonLabel: "Reset password",
        buttonUrl: resetUrl,
        eyebrow: "Secure account access",
        footerNote: "If you did not request this email, you can ignore it safely.",
        greeting: `Hello ${input.name},`,
        title: "Reset your Pen A Wish password"
      }),
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

    await sendEmailWithDebug({
      from: env.resendFromEmail,
      html: renderEmailTemplate({
        badge: "Wish received",
        body: `
          <p style="margin:0 0 12px;"><strong>${escapeHtml(input.senderName)}</strong> just left a ${escapeHtml(input.eventType.toLowerCase())} wish for <strong>${escapeHtml(input.celebrantName)}</strong>.</p>
          <p style="margin:0;color:#6f5d67;">Open your celebration page to read the message and keep the momentum going.</p>
        `,
        buttonLabel: "View celebration",
        buttonUrl: env.frontendUrl,
        eyebrow: "New public message",
        footerNote: "Reply, share, or keep collecting the love on your Wish Wall.",
        title: "You received a new wish"
      }),
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

    await sendEmailWithDebug({
      from: env.resendFromEmail,
      html: renderEmailTemplate({
        badge: "Guestbook update",
        body: `
          <p style="margin:0 0 12px;"><strong>${escapeHtml(input.senderName)}</strong> just shared a memory for <strong>${escapeHtml(input.celebrantName)}</strong>.</p>
          <p style="margin:0;color:#6f5d67;">Your guestbook is growing with thoughtful notes and keepsakes.</p>
        `,
        buttonLabel: "Open guestbook",
        buttonUrl: env.frontendUrl,
        eyebrow: "A new memory arrived",
        footerNote: "Thoughtful words deserve a beautiful place to live.",
        title: "You received a new guestbook memory"
      }),
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

    await sendEmailWithDebug({
      from: env.resendFromEmail,
      html: renderEmailTemplate({
        badge: "Gift received",
        body: `
          <p style="margin:0 0 12px;"><strong>${escapeHtml(input.senderName)}</strong> just sent <strong>${escapeHtml(formatNairaFromKobo(input.amountKobo))}</strong> to <strong>${escapeHtml(input.celebrantName)}</strong>.</p>
          <p style="margin:0;color:#6f5d67;">The gift has been recorded and your celebration wallet has been updated.</p>
        `,
        buttonLabel: "View wallet",
        buttonUrl: `${env.frontendUrl}/wallet`,
        eyebrow: "Celebration support",
        footerNote: "Thank you for keeping the celebration warm and generous.",
        title: "You received a new gift"
      }),
      subject: "You received a new gift",
      to: input.ownerEmail
    });
  }
};
