import { createHmac, timingSafeEqual } from "crypto";

export function verifyPaymentWebhook(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
