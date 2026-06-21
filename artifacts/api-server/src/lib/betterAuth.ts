import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { pool } from "@workspace/db";
import { sendEmail } from "./email";

/**
 * Better Auth — email/password auth using the existing pg Pool.
 * No Drizzle adapter: avoids the kysely/drizzle-orm dual-instance type conflict.
 * Tables: user, session, account, verification (BA defaults, singular).
 * fields overrides map BA's camelCase JS names to our snake_case DB columns.
 * bearer plugin: enables Authorization: Bearer <token> for mobile clients.
 */
export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your LivingSyria password / إعادة تعيين كلمة مرور ليفينغ سوريا",
        html: `
          <div dir="ltr" style="font-family:sans-serif;max-width:520px;margin:auto">
            <h2>Reset your password</h2>
            <p>Click the link below to set a new password. The link expires in 1 hour.</p>
            <p><a href="${url}" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Reset password</a></p>
            <hr/>
            <p dir="rtl" style="text-align:right">أو انسخ هذا الرابط وألصقه في متصفحك:</p>
            <p style="word-break:break-all;font-size:12px;color:#666">${url}</p>
          </div>
        `,
      });
    },
  },
  plugins: [bearer()],

  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt:     "created_at",
      updatedAt:     "updated_at",
    },
  },

  session: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId:    "user_id",
    },
  },

  account: {
    fields: {
      accountId:             "account_id",
      providerId:            "provider_id",
      userId:                "user_id",
      accessToken:           "access_token",
      refreshToken:          "refresh_token",
      idToken:               "id_token",
      accessTokenExpiresAt:  "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt:             "created_at",
      updatedAt:             "updated_at",
    },
  },

  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  secret: (() => {
    const s = process.env.BETTER_AUTH_SECRET;
    if (!s) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("BETTER_AUTH_SECRET env var must be set in production");
      }
      console.warn("[betterAuth] BETTER_AUTH_SECRET not set — using insecure dev fallback. Set this env var before deploying.");
      return "dev-secret-change-me-in-production-min-32-chars!";
    }
    return s;
  })(),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:8080",
  basePath: "/api/auth",
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
});
