/**
 * Coupon code generation utility.
 * Format: ONEBITE-{CAMPAIGN_SLUG}-{6_CHAR_ALPHANUMERIC}
 * Excludes ambiguous characters: 0/O, 1/I
 */

// Unambiguous characters only
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRandomPart(length: number = 6): string {
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += CHARSET[array[i] % CHARSET.length];
  }
  return result;
}

export function generateCouponCode(campaignSlug: string): string {
  const randomPart = generateRandomPart(6);
  return `ONEBITE-${campaignSlug.toUpperCase()}-${randomPart}`;
}
