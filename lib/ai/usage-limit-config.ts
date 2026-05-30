import "server-only";

const DEFAULT_USER_DAILY_LIMIT = 3;
const DEFAULT_USER_MONTHLY_LIMIT = 20;
const DEFAULT_GLOBAL_MONTHLY_LIMIT = 100;

function parsePositiveInt(
  value: string | undefined,
  fallback: number
): number {
  if (!value?.trim()) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function getAiUsageLimits() {
  return {
    userDaily: parsePositiveInt(
      process.env.AI_USER_DAILY_LIMIT,
      DEFAULT_USER_DAILY_LIMIT
    ),
    userMonthly: parsePositiveInt(
      process.env.AI_USER_MONTHLY_LIMIT,
      DEFAULT_USER_MONTHLY_LIMIT
    ),
    globalMonthly: parsePositiveInt(
      process.env.AI_GLOBAL_MONTHLY_LIMIT,
      DEFAULT_GLOBAL_MONTHLY_LIMIT
    ),
  };
}
