import bcrypt from "bcryptjs";
import type { PoolClient } from "pg";

import { withTransaction } from "../config/db.js";
import { env } from "../config/env.js";
import {
  createRefreshTokenRecord,
  findRefreshTokenByHash,
  revokeRefreshTokenById,
  revokeRefreshTokensByUserId
} from "../repositories/refresh-token.repository.js";
import {
  createUser,
  createWalletForUser,
  deleteUserById,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  updateUserPassword
} from "../repositories/user.repository.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";
import { createRandomToken, hashToken } from "../utils/crypto.js";
import { safeAsync } from "../utils/safe-async.js";
import {
  createAccessToken,
  createPasswordResetToken,
  verifyPasswordResetToken
} from "../utils/tokens.js";
import { emailService } from "./email.service.js";

function toAuthUser(user: {
  avatar_url?: string | null;
  email: string;
  id: string;
  name: string;
  role: "user" | "admin";
}): AuthUser {
  return {
    avatarUrl: user.avatar_url ?? null,
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role
  };
}

async function issueRefreshToken(userId: string, client: PoolClient) {
  const refreshToken = createRandomToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * env.refreshTokenTtlDays
  );

  await createRefreshTokenRecord(
    {
      expiresAt,
      tokenHash: refreshTokenHash,
      userId
    },
    client
  );

  return refreshToken;
}

export const authService = {
  async register(input: { email: string; name: string; password: string }) {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError("An account with that email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return withTransaction(async (client) => {
      const user = await createUser(
        {
          email: input.email,
          name: input.name,
          passwordHash
        },
        client
      );

      await createWalletForUser(user.id, client);
      const refreshToken = await issueRefreshToken(user.id, client);
      const authUser = toAuthUser(user);

      return {
        accessToken: createAccessToken(authUser),
        refreshToken,
        user: authUser
      };
    });
  },

  async login(input: { email: string; password: string }) {
    const user = await findUserByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    const result = await withTransaction(async (client) => {
      const refreshToken = await issueRefreshToken(user.id, client);
      const authUser = toAuthUser(user);

      return {
        accessToken: createAccessToken(authUser),
        refreshToken,
        user: authUser
      };
    });

    void safeAsync(() =>
      emailService.sendLoginAlertEmail({
        email: user.email,
        name: user.name
      })
    );

    return result;
  },

  async updateProfile(
    user: AuthUser,
    input: {
      avatarUrl?: string | null;
      email: string;
      name: string;
    }
  ) {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser && existingUser.id !== user.id) {
      throw new AppError("An account with that email already exists", 409);
    }

    const updatedUser = await withTransaction(async (client) => {
      const record = await updateUserProfile(
        user.id,
        {
          avatarUrl: input.avatarUrl ?? null,
          email: input.email,
          name: input.name
        },
        client
      );

      if (!record) {
        throw new AppError("Account not found", 404);
      }

      return record;
    });

    const authUser = toAuthUser(updatedUser);

    return {
      accessToken: createAccessToken(authUser),
      user: authUser
    };
  },

  async deleteAccount(user: AuthUser) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM admin_logs WHERE admin_id = $1;`, [user.id]);
      await client.query(`UPDATE withdrawal_requests SET reviewed_by = NULL WHERE reviewed_by = $1;`, [
        user.id
      ]);
      await deleteUserById(user.id, client);
    });
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
      return;
    }

    const storedToken = await findRefreshTokenByHash(hashToken(refreshToken));

    if (storedToken) {
      await revokeRefreshTokenById(storedToken.id);
    }
  },

  async refreshAccessToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new AppError("Refresh token is missing", 401);
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await findRefreshTokenByHash(tokenHash);

    if (!storedToken || storedToken.revoked_at || storedToken.expires_at < new Date()) {
      throw new AppError("Refresh token is invalid or expired", 401);
    }

    const user = await findUserById(storedToken.user_id);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    return withTransaction(async (client) => {
      await revokeRefreshTokenById(storedToken.id, client);
      const nextRefreshToken = await issueRefreshToken(user.id, client);
      const authUser = toAuthUser(user);

      return {
        accessToken: createAccessToken(authUser),
        refreshToken: nextRefreshToken,
        user: authUser
      };
    });
  },

  async forgotPassword(email: string) {
    const user = await findUserByEmail(email);

    if (!user) {
      return;
    }

    const resetToken = createPasswordResetToken({
      email: user.email,
      id: user.id,
      passwordHash: user.password_hash
    });

    await safeAsync(() =>
      emailService.sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetToken
      })
    );
  },

  async resetPassword(input: { password: string; token: string }) {
    let payload;

    try {
      payload = verifyPasswordResetToken(input.token);
    } catch {
      throw new AppError("Reset token is invalid or expired", 400);
    }

    if (payload.purpose !== "password-reset") {
      throw new AppError("Reset token is invalid", 400);
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      throw new AppError("Reset token is invalid", 400);
    }

    if (hashToken(user.password_hash) !== payload.fingerprint) {
      throw new AppError("Reset token is no longer valid", 400);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await withTransaction(async (client) => {
      await updateUserPassword(user.id, passwordHash, client);
      await revokeRefreshTokensByUserId(user.id, client);
    });
  }
};
