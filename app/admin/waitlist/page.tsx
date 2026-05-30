import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AdminWaitlistDashboard } from "@/components/admin-waitlist-dashboard";
import { AuthButtons } from "@/components/auth-buttons";
import {
  countWaitlistLeads,
  getRecentWaitlistLeads,
  getWaitlistLeadsByCategory,
  getWaitlistLeadsByPriceExpectation,
} from "@/db/queries/waitlist";
import {
  isAdminConfigured,
  isAllowlistedAdmin,
} from "@/lib/admin/require-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function AdminWaitlistPage() {
  const configured = isAdminConfigured();

  if (!configured) {
    return (
      <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
        <Alert variant="destructive">
          <AlertTitle>Admin panel not configured</AlertTitle>
          <AlertDescription>
            Set ADMIN_CLERK_USER_IDS in your environment with at least one Clerk
            user ID before using this page.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Waitlist admin
          </h1>
          <p className="text-muted-foreground">
            Sign in with an allowlisted Clerk account to view waitlist leads.
          </p>
        </div>
        <AuthButtons />
      </main>
    );
  }

  if (!isAllowlistedAdmin(userId)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>
            Only accounts listed in ADMIN_CLERK_USER_IDS can access this page.
          </AlertDescription>
        </Alert>
        <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
          Back to dashboard
        </Button>
      </main>
    );
  }

  const [totalLeads, byCategory, byPriceExpectation, recentLeads] =
    await Promise.all([
      countWaitlistLeads(),
      getWaitlistLeadsByCategory(),
      getWaitlistLeadsByPriceExpectation(),
      getRecentWaitlistLeads(50),
    ]);

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Waitlist leads
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor Pro waitlist signups and interest breakdowns.
        </p>
      </div>
      <AdminWaitlistDashboard
        totalLeads={totalLeads}
        byCategory={byCategory}
        byPriceExpectation={byPriceExpectation}
        recentLeads={recentLeads}
      />
    </main>
  );
}
