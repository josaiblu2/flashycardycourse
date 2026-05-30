"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  claimWaitlistLeadForUser,
  createWaitlistLead,
  getWaitlistLeadByClerkUserId,
  getWaitlistLeadByEmail,
} from "@/db/queries/waitlist";
import {
  JoinProWaitlistSchema,
  WAITLIST_LIMIT_TYPE_TO_SOURCE,
  type JoinProWaitlistInput,
} from "@/lib/waitlist/schemas";

export type JoinProWaitlistResult =
  | { success: true }
  | {
      success: false;
      code:
        | "DUPLICATE"
        | "INVALID_INPUT"
        | "UNAUTHORIZED"
        | "NO_VERIFIED_EMAIL";
      message: string;
    };

async function getVerifiedPrimaryEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  return email || null;
}

export async function joinProWaitlist(
  input: JoinProWaitlistInput
): Promise<JoinProWaitlistResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Sign in to join the waitlist.",
    };
  }

  const parsed = JoinProWaitlistSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Invalid input",
    };
  }

  const email = await getVerifiedPrimaryEmail(userId);
  if (!email) {
    return {
      success: false,
      code: "NO_VERIFIED_EMAIL",
      message:
        "Your account does not have a verified email address. Add one in your account settings and try again.",
    };
  }

  const { name, interestCategory, priceExpectation, limitType } = parsed.data;
  const source = WAITLIST_LIMIT_TYPE_TO_SOURCE[limitType];

  const existingByUser = await getWaitlistLeadByClerkUserId(userId);
  if (existingByUser) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "You're already on the waitlist.",
    };
  }

  const existingByEmail = await getWaitlistLeadByEmail(email);
  if (existingByEmail) {
    if (!existingByEmail.clerkUserId) {
      await claimWaitlistLeadForUser(existingByEmail.id, userId, {
        name,
        interestCategory,
        priceExpectation,
      });
      return { success: true };
    }

    return {
      success: false,
      code: "DUPLICATE",
      message: "You're already on the waitlist.",
    };
  }

  try {
    await createWaitlistLead(
      userId,
      name,
      email,
      source,
      interestCategory,
      priceExpectation
    );
  } catch {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Failed to join the waitlist. Please try again.",
    };
  }

  return { success: true };
}
