import "server-only";

import { headers } from "next/headers";

export async function getRequestIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return headersList.get("x-real-ip") ?? "unknown";
}
