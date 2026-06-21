import { Resend } from "resend";
import { logger } from "./logger";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "LivingSyria <noreply@livingsyria.com>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<void> {
  if (!resend) {
    logger.warn({ to, subject }, "[email] RESEND_API_KEY not set — email not sent");
    return;
  }
  try {
    // Resend's union types require at least one content field to be defined
    await resend.emails.send({
      from,
      to,
      subject,
      html: html ?? text ?? "",
    });
    logger.info({ to, subject }, "[email] sent");
  } catch (err) {
    logger.error({ err, to, subject }, "[email] send failed");
  }
}
