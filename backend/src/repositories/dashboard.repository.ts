import { query } from "../config/db.js";
import type { DashboardOverview, WishRecord } from "../types/dashboard.js";

export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const [statsResult, walletResult, wishesResult, giftsResult] = await Promise.all([
    query<{
      celebrations_count: string;
      gifts_received_count: string;
      public_links_count: string;
      wishes_received_count: string;
    }>(
      `SELECT
        COUNT(DISTINCT e.id)::text AS celebrations_count,
        COUNT(DISTINCT CASE WHEN e.is_public = TRUE THEN e.id END)::text AS public_links_count,
        COUNT(DISTINCT w.id)::text AS wishes_received_count,
        COUNT(DISTINCT CASE WHEN g.status = 'success' THEN g.id END)::text AS gifts_received_count
       FROM events e
       LEFT JOIN wishes w ON w.event_id = e.id
       LEFT JOIN gifts g ON g.event_id = e.id
       WHERE e.user_id = $1;`,
      [userId]
    ),
    query<{
      balance_kobo: string;
      total_gifts_received_kobo: string;
    }>(
      `SELECT
        COALESCE(w.balance_kobo, 0)::text AS balance_kobo,
        COALESCE((
          SELECT SUM(g.amount_kobo)
          FROM gifts g
          WHERE g.user_id = $1 AND g.status = 'success'
        ), 0)::text AS total_gifts_received_kobo
       FROM wallets w
       WHERE w.user_id = $1
       LIMIT 1;`,
      [userId]
    ),
    query<{
      created_at: Date;
      event_id: string;
      event_slug: string;
      event_title: string;
      id: string;
      is_hidden: boolean;
      message: string;
      sender_name: string;
    }>(
      `SELECT
        w.id,
        w.event_id,
        w.sender_name,
        w.message,
        w.is_hidden,
        w.created_at,
        e.slug AS event_slug,
        e.title AS event_title
       FROM wishes w
       INNER JOIN events e ON e.id = w.event_id
       WHERE e.user_id = $1
       ORDER BY w.created_at DESC
       LIMIT 5;`,
      [userId]
    ),
    query<{
      amount_kobo: string;
      created_at: Date;
      event_id: string;
      event_slug: string;
      event_title: string;
      id: string;
      message: string | null;
      sender_name: string;
    }>(
      `SELECT
        g.id,
        g.event_id,
        g.sender_name,
        g.message,
        g.amount_kobo::text AS amount_kobo,
        g.created_at,
        e.slug AS event_slug,
        e.title AS event_title
       FROM gifts g
       INNER JOIN events e ON e.id = g.event_id
       WHERE e.user_id = $1 AND g.status = 'success'
       ORDER BY g.created_at DESC
       LIMIT 5;`,
      [userId]
    )
  ]);

  const stats = statsResult.rows[0];
  const wallet = walletResult.rows[0] ?? {
    balance_kobo: "0",
    total_gifts_received_kobo: "0"
  };

  return {
    recentGifts: giftsResult.rows.map((gift) => ({
      amountKobo: Number(gift.amount_kobo),
      createdAt: gift.created_at,
      eventId: gift.event_id,
      eventSlug: gift.event_slug,
      eventTitle: gift.event_title,
      id: gift.id,
      message: gift.message,
      senderName: gift.sender_name
    })),
    recentWishes: wishesResult.rows.map((wish) => ({
      createdAt: wish.created_at,
      eventId: wish.event_id,
      eventSlug: wish.event_slug,
      eventTitle: wish.event_title,
      id: wish.id,
      isHidden: wish.is_hidden,
      message: wish.message,
      senderName: wish.sender_name
    })),
    stats: {
      celebrationsCount: Number(stats?.celebrations_count ?? 0),
      giftsReceivedCount: Number(stats?.gifts_received_count ?? 0),
      publicLinksCount: Number(stats?.public_links_count ?? 0),
      wishesReceivedCount: Number(stats?.wishes_received_count ?? 0)
    },
    wallet: {
      balanceKobo: Number(wallet.balance_kobo),
      totalGiftsReceivedKobo: Number(wallet.total_gifts_received_kobo)
    }
  };
}

export async function getEventWishesForOwner(eventId: string) {
  const result = await query<WishRecord>(
    `SELECT
      id,
      event_id,
      sender_name,
      sender_email,
      message,
      is_hidden,
      created_at
     FROM wishes
     WHERE event_id = $1
     ORDER BY created_at DESC;`,
    [eventId]
  );

  return result.rows;
}

export async function hideWishForOwner(wishId: string) {
  const result = await query<WishRecord>(
    `UPDATE wishes
     SET is_hidden = TRUE
     WHERE id = $1
     RETURNING
      created_at,
      event_id,
      id,
      is_hidden,
      message,
      sender_email,
      sender_name;`,
    [wishId]
  );

  return result.rows[0] ?? null;
}
