"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MailIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
  RefreshCwIcon,
  HistoryIcon,
  SparklesIcon,
  InboxIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getAccessToken } from "@/lib/gmail/auth";
import {
  useStats,
  useSubscriptions,
  useTransactions,
  useIncome,
  useNewsletters,
  useEmails,
} from "@/lib/db/hooks";
import {
  initialSync,
  incrementalSync,
  loadOlderEmails,
  hasSyncedBefore,
  getSyncState,
  type SyncProgress,
} from "@/lib/gmail/sync";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function SyncSection() {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncedBefore, setSyncedBefore] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    setSyncedBefore(hasSyncedBefore());
    const state = getSyncState();
    if (state.lastSyncedAt) {
      setLastSynced(formatRelativeTime(new Date(state.lastSyncedAt)));
    }
  }, [syncing]);

  const handleSync = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError("Session expired. Please sign in again.");
      return;
    }
    setSyncing(true);
    setError(null);
    try {
      if (hasSyncedBefore()) {
        await incrementalSync(token, setProgress);
      } else {
        await initialSync(token, setProgress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
      setProgress(null);
    }
  }, []);

  const handleLoadOlder = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError("Session expired. Please sign in again.");
      return;
    }
    setSyncing(true);
    setError(null);
    try {
      await loadOlderEmails(token, setProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load older emails");
    } finally {
      setSyncing(false);
      setProgress(null);
    }
  }, []);

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Gmail Sync</h3>
          <p className="text-sm text-muted-foreground">
            {lastSynced
              ? `Last synced ${lastSynced}`
              : "Sync your inbox to get started"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncedBefore && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadOlder}
              disabled={syncing}
            >
              <HistoryIcon className="mr-1.5 size-3.5" />
              Load older
            </Button>
          )}
          <Button size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCwIcon
              className={`mr-1.5 size-3.5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing
              ? "Syncing..."
              : syncedBefore
                ? "Sync now"
                : "Start sync"}
          </Button>
        </div>
      </div>

      {syncing && progress && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{progress.phase}...</span>
            <span>
              {progress.current}
              {progress.total > 0 && ` / ${progress.total}`}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {detail && (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}

function RecentEmailsList() {
  const emails = useEmails();
  const recent = emails?.slice(0, 8);

  if (!recent || recent.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="font-semibold">Recent Emails</h3>
        <Badge variant="outline" className="text-xs">
          {emails?.length ?? 0} total
        </Badge>
      </div>
      <div className="divide-y">
        {recent.map((email) => (
          <div key={email.id} className="flex items-start gap-3 px-5 py-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
              {email.from?.[0] ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{email.from}</p>
                {email.category && email.category !== "other" && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {email.category}
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {email.subject}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(new Date(email.date))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionsSummary() {
  const subs = useSubscriptions();
  const active = subs?.filter((s) => s.status === "active") ?? [];

  if (!subs || subs.length === 0) return null;

  const monthlyTotal = active.reduce((sum, s) => {
    if (s.frequency === "yearly") return sum + s.amount / 12;
    if (s.frequency === "quarterly") return sum + s.amount / 3;
    if (s.frequency === "weekly") return sum + s.amount * 4.33;
    return sum + s.amount;
  }, 0);

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="font-semibold">Active Subscriptions</h3>
        <span className="text-sm font-semibold text-primary">
          {formatCurrency(monthlyTotal)}/mo
        </span>
      </div>
      <div className="divide-y">
        {active.slice(0, 5).map((sub) => (
          <div key={sub.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {sub.vendor?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{sub.vendor}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {sub.frequency}
                </p>
              </div>
            </div>
            <span className="text-sm font-mono font-medium">
              {formatCurrency(sub.amount, sub.currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpendingBreakdown() {
  const transactions = useTransactions();

  if (!transactions || transactions.length === 0) return null;

  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  }

  const sorted = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const total = sorted.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Spending by Category</h3>
        <span className="text-sm font-semibold">{formatCurrency(total)}</span>
      </div>
      <div className="mt-4 space-y-3">
        {sorted.map(([category, amount]) => {
          const pct = Math.round((amount / total) * 100);
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{category}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(amount)} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewsletterSummary() {
  const newsletters = useNewsletters();

  if (!newsletters || newsletters.length === 0) return null;

  const bySender: Record<string, { count: number; name: string }> = {};
  for (const n of newsletters) {
    if (!bySender[n.sender]) {
      bySender[n.sender] = { count: 0, name: n.senderName || n.sender };
    }
    bySender[n.sender].count++;
  }

  const sorted = Object.values(bySender)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="font-semibold">Top Newsletters</h3>
        <Badge variant="outline" className="text-xs">
          {newsletters.length} total
        </Badge>
      </div>
      <div className="divide-y">
        {sorted.map((sender) => (
          <div
            key={sender.name}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {sender.name[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="text-sm font-medium">{sender.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {sender.count} emails
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full rounded-lg border border-dashed bg-card p-12 text-center">
      <InboxIcon className="mx-auto size-10 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">No data yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Sync your Gmail above, then use the AI parser in Settings to classify
        your emails into subscriptions, spending, income, and newsletters.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useStats();
  const subscriptions = useSubscriptions();
  const transactions = useTransactions();
  const income = useIncome();

  const activeSubCount =
    subscriptions?.filter((s) => s.status === "active").length ?? 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySpend =
    transactions
      ?.filter((t) => new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0) ?? 0;

  const monthlyIncome =
    income
      ?.filter((i) => new Date(i.date) >= monthStart)
      .reduce((s, i) => s + i.amount, 0) ?? 0;

  const hasData =
    (stats?.totalEmails ?? 0) > 0 ||
    (subscriptions?.length ?? 0) > 0 ||
    (transactions?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Your inbox analytics at a glance.
        </p>
      </div>

      <SyncSection />

      {stats && stats.totalEmails > 0 && stats.unparsed > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <SparklesIcon className="size-4 shrink-0 text-amber-600" />
          <span>
            <strong>{stats.unparsed}</strong> emails haven&apos;t been parsed
            yet. Go to <strong>Settings</strong> to configure your AI provider,
            then run the parser.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Emails"
          value={stats?.totalEmails ?? 0}
          icon={MailIcon}
          detail={
            stats && stats.parsed > 0
              ? `${stats.parsed} parsed, ${stats.unparsed} pending`
              : undefined
          }
        />
        <StatCard
          label="Subscriptions"
          value={activeSubCount}
          icon={CreditCardIcon}
          detail={
            subscriptions && subscriptions.length > 0
              ? `${subscriptions.length} total detected`
              : undefined
          }
        />
        <StatCard
          label="Monthly Spend"
          value={formatCurrency(monthlySpend)}
          icon={DollarSignIcon}
          detail={
            transactions && transactions.length > 0
              ? `${transactions.filter((t) => new Date(t.date) >= monthStart).length} transactions this month`
              : undefined
          }
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={TrendingUpIcon}
          detail={
            income && income.length > 0
              ? `${income.filter((i) => new Date(i.date) >= monthStart).length} deposits this month`
              : undefined
          }
        />
      </div>

      {hasData ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentEmailsList />
          <div className="space-y-6">
            <SubscriptionsSummary />
            <SpendingBreakdown />
            <NewsletterSummary />
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
