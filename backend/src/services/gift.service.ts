import { withTransaction } from "../config/db.js";
import { env } from "../config/env.js";
import { findEventById, findEventBySlug } from "../repositories/event.repository.js";
import {
  createPendingGift,
  createWalletTransaction,
  findGiftByReference,
  findGiftByReferenceForUpdate,
  findWalletByUserIdForUpdate,
  findWalletTransactionByGiftId,
  incrementWalletBalance,
  updateGiftStatus
} from "../repositories/gift.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { sanitizePlainText } from "../utils/sanitize.js";
import { emailService } from "./email.service.js";
import { paystackService } from "./paystack.service.js";

const PLATFORM_FEE_KOBO = 5_000;

function nairaToKobo(amountNaira: number) {
  return Math.round(amountNaira * 100);
}

function buildGuestEmail(input: {
  senderEmail?: string;
  senderName: string;
}) {
  if (input.senderEmail) {
    return input.senderEmail;
  }

  const normalized = input.senderName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return `${normalized || "guest"}.${Date.now()}@penawish.com`;
}

function buildReference(eventId: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `paw_${eventId.slice(0, 8)}_${Date.now()}_${random}`;
}

export const giftService = {
  async initializeGift(
    slug: string,
    input: {
      amountNaira: number;
      message?: string;
      senderEmail?: string;
      senderName: string;
    }
  ) {
    const event = await findEventBySlug(slug);

    if (!event || !event.is_public) {
      throw new AppError("Celebration not found", 404);
    }

    const sanitizedSenderName = sanitizePlainText(input.senderName);
    const sanitizedMessage = input.message
      ? sanitizePlainText(input.message) || undefined
      : undefined;

    if (sanitizedSenderName.length < 2) {
      throw new AppError("Sender name must contain at least 2 valid characters", 400);
    }

    const amountKobo = nairaToKobo(input.amountNaira);
    const platformFeeKobo = PLATFORM_FEE_KOBO;
    const totalChargedKobo = amountKobo + platformFeeKobo;
    const reference = buildReference(event.id);

    await createPendingGift({
      amountKobo,
      eventId: event.id,
      message: sanitizedMessage,
      paystackReference: reference,
      platformFeeKobo,
      senderEmail: input.senderEmail,
      senderName: sanitizedSenderName,
      totalChargedKobo,
      userId: event.user_id
    });

    const checkout = await paystackService.initializeTransaction({
      amountKobo: totalChargedKobo,
      callbackUrl: `${env.frontendUrl}/events/${event.slug}`,
      email: buildGuestEmail({
        senderEmail: input.senderEmail,
        senderName: sanitizedSenderName
      }),
      reference
    });

    return {
      amountKobo,
      authorizationUrl: checkout.authorizationUrl,
      platformFeeKobo,
      reference: checkout.reference,
      totalChargedKobo
    };
  },

  async verifyPaystackPayment(reference: string) {
    const existingGift = await findGiftByReference(reference);

    if (!existingGift) {
      throw new AppError("Gift payment reference not found", 404);
    }

    if (existingGift.status === "success" && existingGift.verified_at) {
      return {
        giftId: existingGift.id,
        status: existingGift.status
      };
    }

    const verification = await paystackService.verifyTransaction(reference);

    if (verification.reference !== reference) {
      throw new AppError("Payment reference mismatch", 400);
    }

    if (verification.currency !== "NGN") {
      throw new AppError("Unsupported payment currency", 400);
    }

    if (verification.status !== "success") {
      await updateGiftStatus(existingGift.id, {
        status: "failed",
        verifiedAt: null
      });
      throw new AppError("Payment was not successful", 400);
    }

    if (verification.amountKobo !== Number(existingGift.total_charged_kobo)) {
      await updateGiftStatus(existingGift.id, {
        status: "review",
        verifiedAt: null
      });
      throw new AppError("Payment amount mismatch. Gift has been marked for review.", 409);
    }

    const result = await withTransaction(async (client) => {
      const lockedGift = await findGiftByReferenceForUpdate(reference, client);

      if (!lockedGift) {
        throw new AppError("Gift payment reference not found", 404);
      }

      if (lockedGift.status === "success" && lockedGift.verified_at) {
        return {
          giftId: lockedGift.id,
          status: lockedGift.status
        };
      }

      const wallet = await findWalletByUserIdForUpdate(lockedGift.user_id, client);

      if (!wallet) {
        throw new AppError("Celebrant wallet not found", 404);
      }

      const existingWalletTransaction = await findWalletTransactionByGiftId(
        lockedGift.id,
        client
      );

      if (!existingWalletTransaction) {
        await incrementWalletBalance(wallet.id, Number(lockedGift.amount_kobo), client);
        await createWalletTransaction(
          {
            amountKobo: Number(lockedGift.amount_kobo),
            description: `Gift from ${lockedGift.sender_name}`,
            giftId: lockedGift.id,
            type: "gift_credit",
            walletId: wallet.id
          },
          client
        );
      }

      const updatedGift = await updateGiftStatus(
        lockedGift.id,
        {
          status: "success",
          verifiedAt: new Date()
        },
        client
      );

      return {
        giftId: updatedGift?.id ?? lockedGift.id,
        status: updatedGift?.status ?? "success"
      };
    });

    const owner = await findUserById(existingGift.user_id);
    const event = await findEventById(existingGift.event_id);

    if (owner) {
      try {
        await emailService.sendGiftNotification({
          amountKobo: Number(existingGift.amount_kobo),
          celebrantName: event?.celebrant_name ?? owner.name,
          ownerEmail: owner.email,
          senderName: existingGift.sender_name
        });
      } catch (error) {
        console.error("Unable to send gift notification", {
          error,
          ownerEmail: owner.email,
          reference
        });
      }
    }

    return result;
  }
};
