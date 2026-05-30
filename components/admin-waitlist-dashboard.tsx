import Link from "next/link";
import type { WaitlistGroupCount } from "@/db/queries/waitlist";
import type { waitlist } from "@/db/schema";
import {
  WAITLIST_INTEREST_CATEGORY_LABELS,
  WAITLIST_PRICE_EXPECTATION_LABELS,
  WAITLIST_SOURCE_LABELS,
  WAITLIST_UNSET_LABEL,
  type WaitlistInterestCategory,
  type WaitlistPriceExpectation,
  type WaitlistSource,
} from "@/lib/waitlist/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WaitlistLead = typeof waitlist.$inferSelect;

interface AdminWaitlistDashboardProps {
  totalLeads: number;
  byCategory: WaitlistGroupCount[];
  byPriceExpectation: WaitlistGroupCount[];
  recentLeads: WaitlistLead[];
}

function formatGroupLabel(
  key: string | null,
  labels: Record<string, string>
): string {
  if (!key) return WAITLIST_UNSET_LABEL;
  return labels[key] ?? key;
}

function sortGroupsByCount(groups: WaitlistGroupCount[]): WaitlistGroupCount[] {
  return [...groups].sort((a, b) => b.count - a.count);
}

function GroupCountList({
  groups,
  labelForKey,
}: {
  groups: WaitlistGroupCount[];
  labelForKey: (key: string | null) => string;
}) {
  const sorted = sortGroupsByCount(groups);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No leads yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {sorted.map((group) => (
        <li
          key={group.key ?? "__unset__"}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span className="text-foreground">{labelForKey(group.key)}</span>
          <Badge variant="secondary">{group.count}</Badge>
        </li>
      ))}
    </ul>
  );
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AdminWaitlistDashboard({
  totalLeads,
  byCategory,
  byPriceExpectation,
  recentLeads,
}: AdminWaitlistDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Pro waitlist signups from the app
        </p>
        <div className="flex gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
            Admin users
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total waitlist leads</CardTitle>
          <CardDescription>All unique signups stored in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {totalLeads}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by category</CardTitle>
            <CardDescription>Interest category selected at signup</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupCountList
              groups={byCategory}
              labelForKey={(key) =>
                formatGroupLabel(
                  key,
                  WAITLIST_INTEREST_CATEGORY_LABELS as Record<string, string>
                )
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads by price expectation</CardTitle>
            <CardDescription>
              Monthly price range selected at signup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GroupCountList
              groups={byPriceExpectation}
              labelForKey={(key) =>
                formatGroupLabel(
                  key,
                  WAITLIST_PRICE_EXPECTATION_LABELS as Record<string, string>
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent signups</CardTitle>
          <CardDescription>
            Latest {recentLeads.length} lead
            {recentLeads.length === 1 ? "" : "s"}, newest first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          ) : (
            <div className="rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Clerk user</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price expectation</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Signed up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                        {lead.clerkUserId ?? WAITLIST_UNSET_LABEL}
                      </TableCell>
                      <TableCell>
                        {lead.interestCategory
                          ? WAITLIST_INTEREST_CATEGORY_LABELS[
                              lead.interestCategory as WaitlistInterestCategory
                            ]
                          : WAITLIST_UNSET_LABEL}
                      </TableCell>
                      <TableCell>
                        {lead.priceExpectation
                          ? WAITLIST_PRICE_EXPECTATION_LABELS[
                              lead.priceExpectation as WaitlistPriceExpectation
                            ]
                          : WAITLIST_UNSET_LABEL}
                      </TableCell>
                      <TableCell>
                        {WAITLIST_SOURCE_LABELS[lead.source as WaitlistSource] ??
                          lead.source}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {dateFormatter.format(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
