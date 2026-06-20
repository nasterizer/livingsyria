import { fromNodeHeaders } from "better-auth/node";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  MobileSignInBody,
  MobileSignInResponse,
  MobileSignOutResponse,
} from "@workspace/api-zod";
import { auth } from "../lib/betterAuth";

const router: IRouter = Router();

// ─── GET /me — returns the authenticated user in the legacy shape ─────────────
// NOTE: must NOT be under /auth/* — that namespace is owned by Better Auth's handler.
router.get("/me", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

// ─── Mobile: email / password sign-in → bearer token ─────────────────────────
router.post("/mobile-auth/sign-in", async (req: Request, res: Response) => {
  const parsed = MobileSignInBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: new Headers(),
    });

    // Better Auth returns the session token in result.token
    const token = (result as unknown as { token?: string })?.token
      ?? (result as unknown as { session?: { token?: string } })?.session?.token;

    if (!token) {
      res.status(401).json({ error: "Sign in failed — no token returned" });
      return;
    }

    res.json(MobileSignInResponse.parse({ token }));
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    const message =
      (err as { message?: string })?.message ?? "Invalid credentials";
    req.log.error({ err }, "Mobile sign-in failed");
    res
      .status(status === 400 || status === 401 ? status : 401)
      .json({ error: message });
  }
});

// ─── Mobile: sign out ─────────────────────────────────────────────────────────
router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  try {
    await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
  } catch {
    // ignore errors — token may already be invalid
  }
  res.json(MobileSignOutResponse.parse({ success: true }));
});

export default router;
