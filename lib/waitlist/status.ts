import "server-only";

import {
  getWaitlistLeadByClerkUserId,
  getWaitlistLeadByEmail,
} from "@/db/queries/waitlist";
import { clerkClient } from "@clerk/nextjs/server";

export async function isUserOnWaitlist(clerkUserId: string): Promise<boolean> {
  const leadByUser = await getWaitlistLeadByClerkUserId(clerkUserId);
  if (leadByUser) return true;

  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);

  for (const { emailAddress } of user.emailAddresses) {
    const lead = await getWaitlistLeadByEmail(emailAddress);
    if (lead) return true;
  }

  return false;
}
