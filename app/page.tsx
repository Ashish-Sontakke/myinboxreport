import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  BubbleChatSparkIcon,
  DatabaseLockedIcon,
  GithubIcon,
  Mail01Icon,
  MailSearch01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { Logo } from "@/components/logo"
import { RedirectIfSignedIn } from "@/components/redirect-if-signed-in"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import { Separator } from "@/components/ui/separator"

const GITHUB_URL = "https://github.com/Ashish-Sontakke/myinboxreport"

function Reveal({
  delay,
  className,
  children,
}: {
  delay: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`animate-fade-up ${className ?? ""}`}
      style={{ "--reveal": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

const CHART_BARS = [22, 34, 18, 42, 30, 56, 38, 64, 48, 72, 58, 84]

function ChatVignette() {
  return (
    <div className="border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Agent · runs in your browser
          </span>
        </div>
        <HugeiconsIcon
          icon={BubbleChatSparkIcon}
          className="size-3.5 text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-5 p-4 sm:p-5">
        <Reveal delay={500}>
          <Message>
            <MessageAvatar>
              <HugeiconsIcon icon={SparklesIcon} className="size-4 p-0.5" />
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>Agent</MessageHeader>
              <Bubble variant="muted">
                <BubbleContent>
                  I read a sample of your last 3 months — 1,101 emails. I can
                  see Zerodha contract notes, Swiggy orders, salary from Acme
                  Corp, and 14 newsletters. What do you want to track?
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </Reveal>

        <Reveal delay={900}>
          <Message align="end">
            <MessageContent>
              <Bubble variant="default" align="end">
                <BubbleContent>
                  investments and food delivery. also my SaaS subscriptions
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </Reveal>

        <Reveal delay={1300}>
          <Message>
            <MessageAvatar>
              <HugeiconsIcon icon={SparklesIcon} className="size-4 p-0.5" />
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="muted">
                <BubbleContent>
                  Done — I created <code className="font-mono">investments</code>,{" "}
                  <code className="font-mono">food_delivery</code> and{" "}
                  <code className="font-mono">subscriptions</code> tables and
                  started parsing. Food delivery so far:
                </BubbleContent>
              </Bubble>

              <div className="w-full max-w-72 border bg-background p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    Food delivery
                  </span>
                  <span className="font-mono text-xs font-semibold">
                    ₹4,120
                  </span>
                </div>
                <div className="mt-3 flex h-16 items-end gap-1">
                  {CHART_BARS.map((height, i) => (
                    <div
                      key={i}
                      className="animate-bar-grow min-w-0 flex-1 bg-primary/70"
                      style={
                        {
                          height: `${height}%`,
                          "--reveal": `${1500 + i * 45}ms`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  last 12 weeks · pinned to your dashboard
                </p>
              </div>
            </MessageContent>
          </Message>
        </Reveal>
      </div>
    </div>
  )
}

const STEPS = [
  {
    number: "01",
    title: "Connect",
    icon: Mail01Icon,
    body: "Sign in with read-only Gmail access and choose how far back to sync — a month or a year. Your emails land in a SQLite database inside your browser, and nowhere else.",
  },
  {
    number: "02",
    title: "Describe",
    icon: MailSearch01Icon,
    body: "Tell the agent what matters to you. It samples your inbox and designs your database — your tables, your categories, your rules. Not a schema we invented for everyone.",
  },
  {
    number: "03",
    title: "Ask",
    icon: BubbleChatSparkIcon,
    body: "Ask questions in plain language. The agent writes the SQL, renders the chart, and pins the ones you like to your dashboard. When it gets something wrong, correct it — it learns.",
  },
]

const RECEIPT_ROWS = [
  ["Your emails", "SQLite in your browser"],
  ["AI parsing", "your Ollama, or your API key"],
  ["Gmail scope", "read-only, revoke anytime"],
  ["Our servers", "none exist"],
  ["Cookies & trackers", "none"],
]

export default function Page() {
  return (
    <div className="min-h-svh">
      <RedirectIfSignedIn />

      {/* Nav */}
      <header className="border-b">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo className="size-5 text-primary" />
            <span className="font-mono text-sm font-semibold tracking-tight">
              myinboxreport
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" render={<a href="#how" />}>
              How it works
            </Button>
            <Button variant="ghost" size="sm" render={<a href="#privacy" />}>
              Privacy
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="GitHub"
              render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
            >
              <HugeiconsIcon icon={GithubIcon} />
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-dot-grid absolute inset-0 [mask-image:radial-gradient(75%_75%_at_50%_30%,black,transparent)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="flex flex-col items-start gap-6">
              <Reveal delay={0}>
                <Badge variant="secondary" className="font-mono uppercase">
                  Local-first · No servers
                </Badge>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Ask your inbox anything.
                  <span className="text-muted-foreground">
                    {" "}
                    It stays your inbox.
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
                  An AI agent turns your Gmail into a private analytics
                  database — schema, categories, and dashboards designed
                  around what <em>you</em> want to track. Parsed by your local
                  model or your own API key. Stored in your browser. Nothing
                  else sees it.
                </p>
              </Reveal>
              <Reveal delay={300} className="flex flex-wrap items-center gap-3">
                <Button size="lg" render={<a href="/app" />}>
                  Open the app
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    data-icon="inline-end"
                  />
                </Button>
                <Button variant="outline" size="lg" render={<a href="#how" />}>
                  How it works
                </Button>
              </Reveal>
            </div>

            <Reveal delay={350}>
              <ChatVignette />
            </Reveal>
          </div>
        </section>

        <Separator />

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col gap-3">
            <MonoLabel>How it works</MonoLabel>
            <h2 className="max-w-2xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Three steps. Zero uploads.
            </h2>
          </div>

          <div className="mt-10 grid gap-px border bg-border sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex flex-col gap-4 bg-background p-6 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
                    {step.number}
                  </span>
                  <HugeiconsIcon
                    icon={step.icon}
                    className="size-4 text-muted-foreground"
                  />
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Your schema */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start gap-4">
            <MonoLabel>Your schema, not ours</MonoLabel>
            <h2 className="max-w-md font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              A database designed for you, not for everyone.
            </h2>
            <p className="max-w-md text-muted-foreground">
              Most finance apps force your life into their categories. Here,
              the agent starts with an empty database and builds one around
              your actual inbox — a trader gets an investments table, a
              freelancer gets invoices, you get whatever you ask for.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={DatabaseLockedIcon} className="size-4" />
              <span>SQL you can read, inspect, and export at any time.</span>
            </div>
          </div>

          <div className="border bg-card">
            <div className="border-b px-4 py-2.5">
              <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                generated after you said “track my investments”
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm">
              <code>
                <span className="text-muted-foreground">
                  {"-- created by your agent, in your browser\n"}
                </span>
                {"CREATE TABLE investments (\n"}
                {"  id          INTEGER PRIMARY KEY,\n"}
                {"  broker      TEXT,      "}
                <span className="text-muted-foreground">{"-- 'Zerodha'\n"}</span>
                {"  action      TEXT,      "}
                <span className="text-muted-foreground">
                  {"-- 'buy' | 'sell'\n"}
                </span>
                {"  instrument  TEXT,\n"}
                {"  amount      REAL,\n"}
                {"  currency    TEXT DEFAULT 'INR',\n"}
                {"  traded_at   DATE\n"}
                {");"}
              </code>
            </pre>
          </div>
        </section>

        <Separator />

        {/* Privacy receipt */}
        <section
          id="privacy"
          className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <MonoLabel>Privacy</MonoLabel>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Here’s your receipt.
            </h2>
          </div>

          <div className="w-full max-w-md border bg-card font-mono text-sm">
            <div className="border-b border-dashed px-6 py-4 text-center">
              <p className="text-xs tracking-[0.24em] uppercase">
                myinboxreport
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                data collection statement
              </p>
            </div>
            <div className="flex flex-col gap-3 px-6 py-5">
              {RECEIPT_ROWS.map(([item, where]) => (
                <div
                  key={item}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="shrink-0 text-xs uppercase">{item}</span>
                  <span className="text-right text-xs text-muted-foreground">
                    {where}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed px-6 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase">
                  Total collected
                </span>
                <span className="text-base font-semibold">0 bytes</span>
              </div>
            </div>
          </div>

          <p className="max-w-md text-center text-sm text-muted-foreground">
            The app is a static page. There is no backend to send anything to —
            not by policy, by architecture. Read the source and check.
          </p>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
          <p className="font-mono text-xs text-muted-foreground">
            myinboxreport — no cookies, no analytics, no servers.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={GithubIcon} className="size-3.5" />
            open source
          </a>
        </div>
      </footer>
    </div>
  )
}
