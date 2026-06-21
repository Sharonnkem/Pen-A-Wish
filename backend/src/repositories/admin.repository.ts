import { query } from "../config/db.js";
import type {
  AdminEventRecord,
  AdminGiftRecord,
  AdminListMeta,
  AdminMetricsRecord,
  AdminPaginationInput,
  AdminReportRecord,
  AdminUserRecord,
  AdminWishDetailRecord,
  AdminWishRecord
} from "../types/admin.js";

function buildPaginationMeta(input: AdminPaginationInput, totalItems: number): AdminListMeta {
  return {
    page: input.page,
    pageSize: input.pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / input.pageSize))
  };
}

function buildSearchClause(
  columns: string[],
  startIndex: number,
  q?: string
) {
  if (!q) {
    return {
      clause: "",
      params: [] as string[]
    };
  }

  const likeValue = `%${q}%`;
  const params = columns.map(() => likeValue);
  const clause = ` AND (${columns
    .map((column, index) => `${column} ILIKE $${startIndex + index}`)
    .join(" OR ")})`;

  return { clause, params };
}

export async function listAdminUsers(input: AdminPaginationInput & { role?: "admin" | "user" | "all" }) {
  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (input.role && input.role !== "all") {
    params.push(input.role);
    whereClauses.push(`u.role = $${params.length}`);
  }

  const search = buildSearchClause(["u.name", "u.email"], params.length + 1, input.q);
  if (search.params.length) {
    params.push(...search.params);
    whereClauses.push(
      `(${["u.name", "u.email"]
        .map((column, index) => `${column} ILIKE $${params.length - search.params.length + index + 1}`)
        .join(" OR ")})`
    );
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM users u
     ${whereSql};`,
    params
  );

  params.push(input.pageSize, (input.page - 1) * input.pageSize);

  const result = await query<AdminUserRecord>(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.created_at,
      (
        SELECT COUNT(*)::text
        FROM events e
        WHERE e.user_id = u.id
      ) AS celebrations_count,
      (
        SELECT COALESCE(SUM(g.amount_kobo), 0)::text
        FROM gifts g
        WHERE g.user_id = u.id AND g.status = 'success'
      ) AS total_gifts_kobo
     FROM users u
     ${whereSql}
     ORDER BY u.created_at DESC
     LIMIT $${params.length - 1}
     OFFSET $${params.length};`,
    params
  );

  const totalItems = Number(countResult.rows[0]?.total ?? 0);

  return {
    meta: buildPaginationMeta(input, totalItems),
    rows: result.rows
  };
}

export async function listAdminEvents(input: AdminPaginationInput & { eventType?: string }) {
  const params: unknown[] = [];
  let whereSql = "WHERE 1=1";

  if (input.eventType) {
    params.push(input.eventType);
    whereSql += ` AND e.event_type = $${params.length}`;
  }

  const search = buildSearchClause(
    ["e.title", "e.celebrant_name", "e.slug", "u.name", "u.email"],
    params.length + 1,
    input.q
  );
  params.push(...search.params);
  whereSql += search.clause;

  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM events e
     INNER JOIN users u ON u.id = e.user_id
     ${whereSql};`,
    params
  );

  params.push(input.pageSize, (input.page - 1) * input.pageSize);

  const result = await query<AdminEventRecord>(
    `SELECT
      e.id,
      e.title,
      e.slug,
      e.celebrant_name,
      e.event_type,
      e.event_date,
      e.created_at,
      u.id AS owner_id,
      u.name AS owner_name,
      u.email AS owner_email,
      COUNT(DISTINCT w.id)::text AS wishes_count,
      COUNT(DISTINCT CASE WHEN g.status = 'success' THEN g.id END)::text AS gifts_count
     FROM events e
     INNER JOIN users u ON u.id = e.user_id
     LEFT JOIN wishes w ON w.event_id = e.id
     LEFT JOIN gifts g ON g.event_id = e.id
     ${whereSql}
     GROUP BY e.id, u.id
     ORDER BY e.created_at DESC
     LIMIT $${params.length - 1}
     OFFSET $${params.length};`,
    params
  );

  const totalItems = Number(countResult.rows[0]?.total ?? 0);

  return {
    meta: buildPaginationMeta(input, totalItems),
    rows: result.rows
  };
}

export async function listAdminWishes(
  input: AdminPaginationInput & { visibility?: "all" | "hidden" | "visible" }
) {
  const params: unknown[] = [];
  let whereSql = "WHERE 1=1";

  if (input.visibility === "visible") {
    whereSql += " AND w.is_hidden = FALSE";
  }

  if (input.visibility === "hidden") {
    whereSql += " AND w.is_hidden = TRUE";
  }

  const search = buildSearchClause(
    ["w.sender_name", "COALESCE(w.sender_email, '')", "w.message", "e.title", "e.slug"],
    params.length + 1,
    input.q
  );
  params.push(...search.params);
  whereSql += search.clause;

  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM wishes w
     INNER JOIN events e ON e.id = w.event_id
     ${whereSql};`,
    params
  );

  params.push(input.pageSize, (input.page - 1) * input.pageSize);

  const result = await query<AdminWishRecord>(
    `SELECT
      w.id,
      w.event_id,
      w.sender_name,
      w.sender_email,
      w.message,
      w.is_hidden,
      w.created_at,
      e.title AS event_title,
      e.slug AS event_slug
     FROM wishes w
     INNER JOIN events e ON e.id = w.event_id
     ${whereSql}
     ORDER BY w.created_at DESC
     LIMIT $${params.length - 1}
     OFFSET $${params.length};`,
    params
  );

  const totalItems = Number(countResult.rows[0]?.total ?? 0);

  return {
    meta: buildPaginationMeta(input, totalItems),
    rows: result.rows
  };
}

export async function findAdminWishById(wishId: string) {
  const result = await query<AdminWishDetailRecord>(
    `SELECT
      id,
      event_id,
      sender_name,
      sender_email,
      message,
      is_hidden,
      created_at
     FROM wishes
     WHERE id = $1
     LIMIT 1;`,
    [wishId]
  );

  return result.rows[0] ?? null;
}

export async function deleteWishById(wishId: string) {
  await query("DELETE FROM wishes WHERE id = $1;", [wishId]);
}

export async function listAdminReports(
  input: AdminPaginationInput & { status?: "all" | "open" | "reviewed" | "resolved" }
) {
  const params: unknown[] = [];
  let whereSql = "WHERE 1=1";

  if (input.status && input.status !== "all") {
    params.push(input.status);
    whereSql += ` AND r.status = $${params.length}`;
  }

  const search = buildSearchClause(
    ["r.reason", "COALESCE(e.title, '')", "COALESCE(w.message, '')"],
    params.length + 1,
    input.q
  );
  params.push(...search.params);
  whereSql += search.clause;

  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM reports r
     LEFT JOIN events e ON e.id = r.event_id
     LEFT JOIN wishes w ON w.id = r.wish_id
     ${whereSql};`,
    params
  );

  params.push(input.pageSize, (input.page - 1) * input.pageSize);

  const result = await query<AdminReportRecord>(
    `SELECT
      r.id,
      r.event_id,
      r.wish_id,
      r.guestbook_entry_id,
      r.reason,
      r.status,
      r.created_at,
      e.title AS event_title,
      w.message AS wish_message
     FROM reports r
     LEFT JOIN events e ON e.id = r.event_id
     LEFT JOIN wishes w ON w.id = r.wish_id
     ${whereSql}
     ORDER BY r.created_at DESC
     LIMIT $${params.length - 1}
     OFFSET $${params.length};`,
    params
  );

  const totalItems = Number(countResult.rows[0]?.total ?? 0);

  return {
    meta: buildPaginationMeta(input, totalItems),
    rows: result.rows
  };
}

export async function listAdminGifts(
  input: AdminPaginationInput & { status?: "all" | "failed" | "pending" | "success" }
) {
  const params: unknown[] = [];
  let whereSql = "WHERE 1=1";

  if (input.status && input.status !== "all") {
    params.push(input.status);
    whereSql += ` AND g.status = $${params.length}`;
  }

  const search = buildSearchClause(
    [
      "g.sender_name",
      "COALESCE(g.sender_email, '')",
      "COALESCE(g.message, '')",
      "g.paystack_reference",
      "e.title",
      "u.name",
      "u.email"
    ],
    params.length + 1,
    input.q
  );
  params.push(...search.params);
  whereSql += search.clause;

  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total
     FROM gifts g
     INNER JOIN events e ON e.id = g.event_id
     INNER JOIN users u ON u.id = g.user_id
     ${whereSql};`,
    params
  );

  params.push(input.pageSize, (input.page - 1) * input.pageSize);

  const result = await query<AdminGiftRecord>(
    `SELECT
      g.id,
      g.event_id,
      g.sender_name,
      g.sender_email,
      g.message,
      g.amount_kobo::text,
      g.platform_fee_kobo::text,
      g.total_charged_kobo::text,
      g.paystack_reference,
      g.status,
      g.created_at,
      g.verified_at,
      e.title AS event_title,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email
     FROM gifts g
     INNER JOIN events e ON e.id = g.event_id
     INNER JOIN users u ON u.id = g.user_id
     ${whereSql}
     ORDER BY g.created_at DESC
     LIMIT $${params.length - 1}
     OFFSET $${params.length};`,
    params
  );

  const totalItems = Number(countResult.rows[0]?.total ?? 0);

  return {
    meta: buildPaginationMeta(input, totalItems),
    rows: result.rows
  };
}

export async function getAdminMetrics() {
  const result = await query<AdminMetricsRecord>(
    `SELECT
      (SELECT COUNT(*)::text FROM users) AS total_users,
      (SELECT COUNT(*)::text FROM events) AS total_celebrations,
      (SELECT COUNT(*)::text FROM wishes) AS total_wishes,
      (SELECT COUNT(*)::text FROM gifts WHERE status = 'success') AS total_gifts,
      (SELECT COALESCE(SUM(amount_kobo), 0)::text FROM gifts WHERE status = 'success') AS successful_gift_value_kobo,
      (SELECT COUNT(*)::text FROM withdrawal_requests WHERE status = 'pending') AS pending_withdrawals_count,
      (SELECT COUNT(*)::text FROM reports WHERE status = 'open') AS open_reports_count;`
  );

  return result.rows[0];
}
