"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import {
  activateDemoProRecord,
  dismissDemoProWaitlistReminder as dismissReminderRecord,
  getDemoProActivationByUser,
} from "@/db/queries/demo-pro";
import { isBillingEnabled } from "@/lib/billing/config";

export type ActivateDemoProResult =
  | { success: true; alreadyActive: boolean }
  | {
      success: false;
      code: "UNAUTHORIZED" | "BILLING_ENABLED" | "FAILED";
      message: string;
    };

export async function activateDemoPro(): Promise<ActivateDemoProResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Sign in to activate Demo Pro.",
    };
  }

  if (isBillingEnabled()) {
    return {
      success: false,
      code: "BILLING_ENABLED",
      message: "Demo Pro is not available when billing is enabled.",
    };
  }

  try {
    const existing = await getDemoProActivationByUser(userId);
    if (existing) {
      return { success: true, alreadyActive: true };
    }

    await activateDemoProRecord(userId);

    revalidatePath("/", "layout");

    return { success: true, alreadyActive: false };
  } catch {
    return {
      success: false,
      code: "FAILED",
      message: "Failed to activate Demo Pro. Please try again.",
    };
  }
}

const DismissReminderSchema = z.object({});

export async function dismissDemoProWaitlistReminder() {
  const parsed = DismissReminderSchema.safeParse({});
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dismissReminderRecord(userId);

  revalidatePath("/dashboard");
}
