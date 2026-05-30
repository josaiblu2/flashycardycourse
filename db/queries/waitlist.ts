import "server-only";

import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";

export type WaitlistGroupCount = {
  key: string | null;
  count: number;
};

export async function createWaitlistLead(
  clerkUserId: string,
  name: string,
  email: string,
  source: string,
  interestCategory?: string,
  priceExpectation?: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  const [lead] = await db
    .insert(waitlist)
    .values({
      clerkUserId,
      name,
      email: normalizedEmail,
      source,
      interestCategory,
      priceExpectation,
    })
    .returning();
  return lead;
}

export async function getWaitlistLeadByClerkUserId(clerkUserId: string) {
  const [lead] = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.clerkUserId, clerkUserId));
  return lead ?? null;
}

export async function getWaitlistLeadByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [lead] = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.email, normalizedEmail));
  return lead ?? null;
}

export async function claimWaitlistLeadForUser(
  leadId: number,
  clerkUserId: string,
  data: {
    name: string;
    interestCategory?: string;
    priceExpectation?: string;
  }
) {
  const [lead] = await db
    .update(waitlist)
    .set({
      clerkUserId,
      name: data.name,
      interestCategory: data.interestCategory,
      priceExpectation: data.priceExpectation,
    })
    .where(eq(waitlist.id, leadId))
    .returning();
  return lead ?? null;
}

export async function countWaitlistLeads() {
  const [row] = await db.select({ total: count() }).from(waitlist);
  return Number(row?.total ?? 0);
}

export async function getWaitlistLeadsByCategory(): Promise<WaitlistGroupCount[]> {
  const rows = await db
    .select({
      key: waitlist.interestCategory,
      count: count(),
    })
    .from(waitlist)
    .groupBy(waitlist.interestCategory);

  return rows.map((row) => ({
    key: row.key,
    count: Number(row.count),
  }));
}

export async function getWaitlistLeadsByPriceExpectation(): Promise<WaitlistGroupCount[]> {
  const rows = await db
    .select({
      key: waitlist.priceExpectation,
      count: count(),
    })
    .from(waitlist)
    .groupBy(waitlist.priceExpectation);

  return rows.map((row) => ({
    key: row.key,
    count: Number(row.count),
  }));
}

export async function getRecentWaitlistLeads(limit = 50) {
  return db
    .select()
    .from(waitlist)
    .orderBy(desc(waitlist.createdAt))
    .limit(limit);
}
