"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Shield,
  Cpu,
  ArrowRight,
  Sparkles,
  Github,
  CheckCircle2,
  Lock,
  TrendingUp,
  DollarSign,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm rounded-full border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Free & Open Source
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              See What Your <br />
              <span>Emails Say About You</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect Gmail, scan your emails locally, and get clear reports on
              subscriptions, spending, and income. Your data stays on your
              computer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  <Mail className="mr-2 h-5 w-5" />
                  Connect Gmail & Start
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={siteConfig.links.github} target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  View Source
                </Link>
              </Button>
            </div>
          </div>

          {/* Mockup / App Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl perspective-[1000px]">
            <div className="relative rounded-xl border bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden transform rotate-x-12 transition-transform duration-500 hover:rotate-0 group">
              {/* Mock Browser Header */}
              <div className="h-12 border-b bg-muted/40 flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 h-6 w-64 bg-muted rounded-md flex items-center px-2">
                  <div className="w-3 h-3 rounded-full bg-primary/20" />
                  <div className="ml-2 h-2 w-32 bg-primary/10 rounded-full" />
                </div>
              </div>

              {/* Mock App Content */}
              <div className="grid grid-cols-[240px_1fr] h-[500px]">
                {/* Sidebar */}
                <div className="border-r p-4 space-y-6 bg-muted/20">
                  <div className="space-y-2">
                    <div className="h-8 w-full bg-primary/10 rounded-md flex items-center px-3 text-primary font-medium text-sm">
                      Dashboard
                    </div>
                    <div className="h-8 w-full hover:bg-muted rounded-md flex items-center px-3 text-muted-foreground text-sm">
                      Subscriptions
                    </div>
                    <div className="h-8 w-full hover:bg-muted rounded-md flex items-center px-3 text-muted-foreground text-sm">
                      Income
                    </div>
                    <div className="h-8 w-full hover:bg-muted rounded-md flex items-center px-3 text-muted-foreground text-sm">
                      Expenses
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="text-xs font-medium text-muted-foreground px-2">
                      CONNECTED ACCOUNTS
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">user@gmail.com</span>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="p-6 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Stat Cards */}
                    {[
                      {
                        label: "Total Spend (This Month)",
                        value: "$2,450.00",
                        trend: "+12%",
                        color: "text-red-500",
                      },
                      {
                        label: "Active Subscriptions",
                        value: "14",
                        trend: "2 Renewing Soon",
                        color: "text-blue-500",
                      },
                      {
                        label: "Newsletter Read Rate",
                        value: "24%",
                        trend: "Low Engagement",
                        color: "text-orange-500",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-card p-4 shadow-sm"
                      >
                        <div className="text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </div>
                        <div className="text-2xl font-bold mt-2">
                          {stat.value}
                        </div>
                        <div className={`text-xs mt-1 ${stat.color}`}>
                          {stat.trend}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 h-fit">
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">Recent Transactions</div>
                        <div className="text-xs text-muted-foreground">
                          AI Categorized
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b border-dashed pb-2 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {["NF", "AMZ", "UBR", "SPT"][i - 1]}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {
                                    ["Netflix", "Amazon", "Uber", "Spotify"][
                                      i - 1
                                    ]
                                  }
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Subscription
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-mono">$14.99</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm h-[200px]">
                      <div className="font-semibold mb-4">Income Trend</div>
                      <div className="h-32 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <div
                            key={i}
                            className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/60 transition-colors relative group"
                            style={{ height: `${h}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-sm">
                              ${h}00
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Elements around Mockup */}
            <div className="absolute -right-12 top-20 p-4 bg-background rounded-lg shadow-xl border animate-in fade-in slide-in-from-right duration-1000 delay-300 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Netflix Renewed</p>
                  <p className="text-xs text-muted-foreground">
                    Detected 2 mins ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions / Features */}
      <section className="py-24" id="features">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-14 space-y-4 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm rounded-full border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Privacy-first Gmail analytics
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold">
              Value you can open in your browser
            </h2>
            <p className="text-lg text-muted-foreground">
              Local LLMs parse your inbox to surface subscriptions, spending,
              income, and newsletters—without shipping data to a server.
            </p>
          </div>

          <div className="flex flex-col gap-20 md:gap-32">
            {[
              {
                title: "Catch renewals before they bill",
                description:
                  "Surfaces subscriptions and auto-pay charges so you can cancel or downgrade before the next cycle.",
                icon: CreditCard,
                accent: "from-amber-500/20 via-amber-500/5 to-orange-500/10",
                statLabel: "Renewals next 30 days",
                statValue: "5 services",
                bullets: [
                  "Detects receipts and trials automatically",
                  "Groups by product and billing cadence",
                  "Data stays in your browser",
                ],
                visual: (
                  <div className="space-y-3">
                    {[
                      { name: "Netflix", date: "May 28", price: "$15.99" },
                      { name: "Spotify", date: "Jun 2", price: "$9.99" },
                      { name: "Notion", date: "Jun 5", price: "$12.99" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 font-semibold flex items-center justify-center">
                            {item.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Renews {item.date}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded-full bg-amber-500/10 text-amber-700">
                          {item.price}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-dashed">
                      <span>Auto-pay in the next 7 days</span>
                      <span className="font-semibold text-foreground">
                        $38.97 due
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                title: "Know where money is going",
                description:
                  "Auto-categorizes spending using your own model so you can see totals and trends without spreadsheets.",
                icon: DollarSign,
                accent: "from-blue-500/15 via-sky-400/10 to-cyan-500/10",
                statLabel: "Spend this month",
                statValue: "$2,450",
                bullets: [
                  "LLM-powered categorization on-device",
                  "Clear totals by category and merchant",
                  "Exports stay local by default",
                ],
                visual: (
                  <div className="space-y-3">
                    {[
                      {
                        label: "Food & Dining",
                        value: 38,
                        color: "bg-orange-500",
                      },
                      { label: "Shopping", value: 22, color: "bg-blue-500" },
                      { label: "Transport", value: 14, color: "bg-purple-500" },
                      {
                        label: "Subscriptions",
                        value: 12,
                        color: "bg-amber-500",
                      },
                    ].map((cat) => (
                      <div key={cat.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            {cat.label}
                          </span>
                          <span className="text-muted-foreground">
                            {cat.value}%
                          </span>
                        </div>
                        <div className="h-2 rounded bg-muted">
                          <div
                            className={`h-full rounded-md ${cat.color}`}
                            style={{ width: `${cat.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground pt-2">
                      <div className="rounded-lg border bg-muted/40 p-2 text-center">
                        <p className="font-semibold text-foreground">$620</p>
                        <p>Groceries</p>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-2 text-center">
                        <p className="font-semibold text-foreground">$340</p>
                        <p>Rides</p>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-2 text-center">
                        <p className="font-semibold text-foreground">$280</p>
                        <p>Streaming</p>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: "Spot income signals fast",
                description:
                  "Track payroll, payouts, and refunds in one place with simple, private charts.",
                icon: TrendingUp,
                accent: "from-emerald-500/20 via-emerald-400/10 to-teal-500/10",
                statLabel: "Last payout detected",
                statValue: "$3,200",
                bullets: [
                  "Grouped by sender or client",
                  "Month-over-month trendlines",
                  "Works offline after first sync",
                ],
                visual: (
                  <div className="space-y-4">
                    <div className="relative h-36 rounded-lg bg-muted/50 border overflow-hidden p-3">
                      <div className="absolute inset-3 flex flex-col justify-between text-[10px] text-muted-foreground">
                        <div className="border-t border-dashed border-border/60" />
                        <div className="border-t border-dashed border-border/60" />
                        <div className="border-t border-dashed border-border/60" />
                      </div>
                      <div className="relative flex items-end gap-2 h-full">
                        {[
                          { label: "Jan", value: 24 },
                          { label: "Feb", value: 32 },
                          { label: "Mar", value: 28 },
                          { label: "Apr", value: 41 },
                          { label: "May", value: 36 },
                        ].map((bar) => (
                          <div
                            key={bar.label}
                            className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
                          >
                            <div
                              className="w-full rounded-md bg-emerald-500/80 shadow-[0_6px_16px_-8px_rgba(16,185,129,0.5)]"
                              style={{ height: `${2 * bar.value}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {bar.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {["Payroll Inc", "Stripe Payout", "Refunds"].map(
                        (src) => (
                          <span
                            key={src}
                            className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-medium"
                          >
                            {src}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ),
              },
              {
                title: "Compile newsletters automatically",
                description:
                  "Declutter your inbox by aggregating newsletters and pulling the highlights into one feed.",
                icon: Mail,
                accent: "from-purple-500/15 via-primary/10 to-transparent",
                statLabel: "Newsletters this week",
                statValue: "8 digests",
                bullets: [
                  "Bundles by sender and topic",
                  "Summaries cached locally",
                  "Read-only Gmail scope",
                ],
                visual: (
                  <div className="space-y-3">
                    {[
                      { name: "Morning Brew", count: 4, time: "Today" },
                      { name: "TLDR AI", count: 3, time: "Yesterday" },
                      { name: "Platformer", count: 1, time: "This week" },
                    ].map((newsletter) => (
                      <div
                        key={newsletter.name}
                        className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-700 font-semibold flex items-center justify-center">
                            {newsletter.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {newsletter.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {newsletter.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {newsletter.count} issues
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-dashed">
                      <span>Summaries cached locally</span>
                      <span className="font-semibold text-foreground">
                        0 sent
                      </span>
                    </div>
                  </div>
                ),
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              const isReversed = i % 2 !== 0;

              return (
                <div
                  key={feature.title}
                  className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
                >
                  {/* Text Side */}
                  <div className={cn("space-y-6", isReversed && "md:order-2")}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Icon className="w-4 h-4" />
                      <span>{feature.statLabel}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.bullets.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Side */}
                  <div
                    className={cn("relative group", isReversed && "md:order-1")}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-3xl blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-30",
                        "bg-gradient-to-br",
                        feature.accent
                      )}
                    />
                    <div className="relative rounded-2xl border bg-card/50 backdrop-blur-sm p-2 shadow-2xl ring-1 ring-white/10">
                      {/* Mock Window Header */}
                      <div className="h-8 border-b bg-muted/30 flex items-center px-3 gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                      </div>
                      <div className="p-4 bg-background/50 rounded-b-xl">
                        {feature.visual}
                      </div>
                    </div>

                    {/* Floating Badge */}
                    <div
                      className={cn(
                        "absolute -bottom-6 bg-card border shadow-xl p-4 rounded-2xl animate-in fade-in zoom-in duration-700 delay-100 hidden lg:block",
                        isReversed ? "-left-6" : "-right-6"
                      )}
                    >
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        {feature.statLabel}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {feature.statValue}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm rounded-full border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              100% Private
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold my-6">
              Your Data Stays on Your Computer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We don&apos;t have servers. We don&apos;t store your emails.
              Everything runs in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-muted/30 border">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Runs Locally</h3>
              <p className="text-sm text-muted-foreground">
                Connect to Ollama or LM Studio. Your emails are processed on
                your own machine.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/30 border">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Browser Storage Only</h3>
              <p className="text-sm text-muted-foreground">
                Data lives in your browser. Clear it anytime. We never see it.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/30 border">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Read-Only Access</h3>
              <p className="text-sm text-muted-foreground">
                We only read emails. We can&apos;t send, delete, or change
                anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">Ready to try it?</h2>
            <p className="text-xl text-muted-foreground">
              Free, open source, and private. Connect your Gmail and see what
              you find.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={"/dashboard"}>
                  Connect Gmail Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href={siteConfig.links.github}>Star on GitHub</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
