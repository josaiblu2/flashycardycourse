import "server-only";

/** When false (default), /pricing shows demo waitlist UI instead of Clerk checkout. */
export function isBillingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true";
}
