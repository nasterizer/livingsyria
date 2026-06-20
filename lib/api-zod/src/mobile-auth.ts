import * as zod from "zod";

export const MobileSignInBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(1),
});

export const MobileSignInResponse = zod.object({
  token: zod.string(),
});

export const MobileSignOutResponse = zod.object({
  success: zod.boolean(),
});
