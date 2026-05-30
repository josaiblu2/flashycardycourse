import { z } from "zod";

export const WAITLIST_INTEREST_CATEGORIES = [
  "languages",
  "certifications",
  "school_university",
  "professional_training",
  "other",
] as const;

export const WAITLIST_LIMIT_TYPES = [
  "global_monthly",
  "user_daily",
  "user_monthly",
] as const;

export type WaitlistInterestCategory =
  (typeof WAITLIST_INTEREST_CATEGORIES)[number];

export type WaitlistLimitType = (typeof WAITLIST_LIMIT_TYPES)[number];

export const WAITLIST_INTEREST_CATEGORY_LABELS: Record<
  WaitlistInterestCategory,
  string
> = {
  languages: "Languages",
  certifications: "Certifications",
  school_university: "School / University",
  professional_training: "Professional Training",
  other: "Other",
};

export const WAITLIST_LIMIT_TYPE_TO_SOURCE: Record<WaitlistLimitType, string> =
  {
    global_monthly: "global_limit",
    user_daily: "user_daily_limit",
    user_monthly: "user_monthly_limit",
  };

export const WAITLIST_SOURCES = [
  "global_limit",
  "user_daily_limit",
  "user_monthly_limit",
] as const;

export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export const WAITLIST_SOURCE_LABELS: Record<WaitlistSource, string> = {
  global_limit: "Global monthly limit",
  user_daily_limit: "Daily limit reached",
  user_monthly_limit: "Monthly limit reached",
};

export const WAITLIST_PRICE_EXPECTATIONS = [
  "under_10",
  "10_to_20",
  "over_20",
  "free_only",
  "not_sure",
] as const;

export type WaitlistPriceExpectation =
  (typeof WAITLIST_PRICE_EXPECTATIONS)[number];

export const WAITLIST_PRICE_EXPECTATION_LABELS: Record<
  WaitlistPriceExpectation,
  string
> = {
  under_10: "Under $10/month",
  "10_to_20": "$10–$20/month",
  over_20: "Over $20/month",
  free_only: "Only if free",
  not_sure: "Not sure yet",
};

export const WAITLIST_UNSET_LABEL = "Not specified";

export const JoinProWaitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  interestCategory: z.enum(WAITLIST_INTEREST_CATEGORIES).optional(),
  priceExpectation: z.enum(WAITLIST_PRICE_EXPECTATIONS, {
    error: "Select how much you would pay per month",
  }),
  limitType: z.enum(WAITLIST_LIMIT_TYPES),
  privacyAcknowledged: z.literal(true, {
    error: "You must accept the privacy notice to join the waitlist.",
  }),
});

export type JoinProWaitlistInput = z.infer<typeof JoinProWaitlistSchema>;
