import "server-only";

import { db, sql } from "@/db";
import { aiGenerationUsage } from "@/db/schema";
import type { AiGenerationErrorCode } from "@/lib/ai/generation-errors";
import { startOfMonthUtc, startOfTodayUtc } from "@/lib/ai/usage-periods";
import { and, count, eq, gte } from "drizzle-orm";

type AiUsageLimits = {
  userDaily: number;
  userMonthly: number;
  globalMonthly: number;
};

type AiGenerationUsageRecord = typeof aiGenerationUsage.$inferSelect;

function mapUsageRow(row: Record<string, unknown>): AiGenerationUsageRecord {
  return {
    id: row.id as number,
    clerkUserId: row.clerkUserId as string,
    deckId: (row.deckId as number | null) ?? null,
    createdAt: new Date(row.createdAt as string | Date),
  };
}

function resolveLimitFailure(
  counts: { daily: number; monthlyUser: number; monthlyGlobal: number },
  limits: AiUsageLimits
): AiGenerationErrorCode {
  if (counts.daily >= limits.userDaily) {
    return "USER_DAILY_LIMIT_REACHED";
  }
  if (counts.monthlyUser >= limits.userMonthly) {
    return "USER_MONTHLY_LIMIT_REACHED";
  }
  return "GLOBAL_MONTHLY_LIMIT_REACHED";
}

export async function reserveAiGenerationUsageRecord(
  clerkUserId: string,
  deckId: number,
  limits: AiUsageLimits
): Promise<
  | { success: true; record: AiGenerationUsageRecord }
  | { success: false; code: AiGenerationErrorCode }
> {
  const todayStart = startOfTodayUtc();
  const monthStart = startOfMonthUtc();

  const results = await sql.transaction((txn) => [
    txn`SELECT pg_advisory_xact_lock(hashtext('ai_usage_global'))`,
    txn`SELECT pg_advisory_xact_lock(hashtext(${clerkUserId}))`,
    txn`
      INSERT INTO ai_generation_usage ("clerkUserId", "deckId")
      SELECT ${clerkUserId}, ${deckId}
      WHERE
        (SELECT COUNT(*)::int FROM ai_generation_usage WHERE "clerkUserId" = ${clerkUserId} AND "createdAt" >= ${todayStart}) < ${limits.userDaily}
        AND (SELECT COUNT(*)::int FROM ai_generation_usage WHERE "clerkUserId" = ${clerkUserId} AND "createdAt" >= ${monthStart}) < ${limits.userMonthly}
        AND (SELECT COUNT(*)::int FROM ai_generation_usage WHERE "createdAt" >= ${monthStart}) < ${limits.globalMonthly}
      RETURNING *
    `,
    txn`
      SELECT
        (SELECT COUNT(*)::int FROM ai_generation_usage WHERE "clerkUserId" = ${clerkUserId} AND "createdAt" >= ${todayStart}) AS daily,
        (SELECT COUNT(*)::int FROM ai_generation_usage WHERE "clerkUserId" = ${clerkUserId} AND "createdAt" >= ${monthStart}) AS "monthlyUser",
        (SELECT COUNT(*)::int FROM ai_generation_usage WHERE "createdAt" >= ${monthStart}) AS "monthlyGlobal"
    `,
  ]);

  const inserted = results[2];
  if (Array.isArray(inserted) && inserted.length > 0) {
    return {
      success: true,
      record: mapUsageRow(inserted[0] as Record<string, unknown>),
    };
  }

  const countsRow = results[3];
  const counts = Array.isArray(countsRow) ? countsRow[0] : countsRow;
  const daily = Number((counts as Record<string, unknown>)?.daily ?? 0);
  const monthlyUser = Number(
    (counts as Record<string, unknown>)?.monthlyUser ?? 0
  );
  const monthlyGlobal = Number(
    (counts as Record<string, unknown>)?.monthlyGlobal ?? 0
  );

  return {
    success: false,
    code: resolveLimitFailure(
      { daily, monthlyUser, monthlyGlobal },
      limits
    ),
  };
}

export async function createAiGenerationUsageRecord(
  clerkUserId: string,
  deckId: number
) {
  const [record] = await db
    .insert(aiGenerationUsage)
    .values({ clerkUserId, deckId })
    .returning();
  return record;
}

export async function countAiGenerationsForUserToday(clerkUserId: string) {
  const since = startOfTodayUtc();
  const [row] = await db
    .select({ total: count() })
    .from(aiGenerationUsage)
    .where(
      and(
        eq(aiGenerationUsage.clerkUserId, clerkUserId),
        gte(aiGenerationUsage.createdAt, since)
      )
    );
  return Number(row?.total ?? 0);
}

export async function countAiGenerationsForUserThisMonth(clerkUserId: string) {
  const since = startOfMonthUtc();
  const [row] = await db
    .select({ total: count() })
    .from(aiGenerationUsage)
    .where(
      and(
        eq(aiGenerationUsage.clerkUserId, clerkUserId),
        gte(aiGenerationUsage.createdAt, since)
      )
    );
  return Number(row?.total ?? 0);
}

export async function countGlobalAiGenerationsThisMonth() {
  const since = startOfMonthUtc();
  const [row] = await db
    .select({ total: count() })
    .from(aiGenerationUsage)
    .where(gte(aiGenerationUsage.createdAt, since));
  return Number(row?.total ?? 0);
}
