import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  TrendingUp,
  Shield,
  Search,
  Bell,
  BarChart3,
  Users,
  ArrowRight,
  Zap,
  Target,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Screener",
    desc: "Filter insider buys by price range, transaction size, CEO/Founder status, and more with our powerful filter builder.",
  },
  {
    icon: Target,
    title: "Signal Scoring",
    desc: "Our proprietary algorithm ranks insider events by significance. CEO buys, cluster activity, and low-proximity signals boost scores.",
  },
  {
    icon: BarChart3,
    title: "Technical Analysis",
    desc: "RSI, SMA crossovers, volume spikes, and trend analysis layered on top of insider activity for confirmation.",
  },
  {
    icon: Users,
    title: "Cluster Detection",
    desc: "Detect when multiple insiders are buying the same stock within a rolling window - a powerful bullish signal.",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    desc: "Get notified instantly when new Form 4 filings match your saved screener filters via email.",
  },
  {
    icon: Shield,
    title: "SEC Form 4 Data",
    desc: "Direct from EDGAR filings. Every insider purchase parsed, normalized, and searchable in seconds.",
  },
];

const signalExamples = [
  {
    ticker: "ACME",
    event: "CEO purchased $2.1M",
    score: 94,
    tags: ["CEO Buy", "Near 52W Low", "Cluster"],
  },
  {
    ticker: "BOLT",
    event: "Founder increased stake $1.5M",
    score: 88,
    tags: ["Founder", "$1M+", "Downturn"],
  },
  {
    ticker: "NXRA",
    event: "3 insiders bought in 7 days",
    score: 82,
    tags: ["Cluster", "Small-Cap", "Optionable"],
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Basic screener access",
      "Top 5 daily signals",
      "Delayed data (24h)",
      "Company search",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Full screener filters",
      "Real-time email alerts",
      "Stock detail pages",
      "Newsletter archive (30d)",
      "Saved filter presets",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Elite",
    price: "$79",
    period: "/month",
    features: [
      "Everything in Pro",
      "CSV export",
      "Advanced scoring controls",
      "Intraday refresh",
      "Full newsletter archive",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">InsiderEdge</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button size="sm" data-testid="button-go-to-app">
                Go to App
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 dark:from-primary/10 dark:to-chart-2/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Powered by SEC Form 4 Filings
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
              Spot insider buying
              <br />
              <span className="text-primary">before the market does.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Screen for CEO & founder purchases, cluster buying activity, and
              stocks near their lows. Filter by price, market cap, options
              availability, and technical signals.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/dashboard">
                <Button size="lg" data-testid="button-hero-cta">
                  Explore Signals
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/screener">
                <Button size="lg" variant="outline" data-testid="button-hero-screener">
                  Open Screener
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-6">
            Example Signals
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {signalExamples.map((s) => (
              <Card key={s.ticker} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-semibold text-sm">{s.ticker}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Score {s.score}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{s.event}</p>
                <div className="flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Everything you need to find insider conviction
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From SEC filings to signal scoring, built for serious stock traders.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-5">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 dark:bg-primary/20 mb-3">
                  <f.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Start free, upgrade when you're ready for real-time alerts.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`p-5 relative ${p.popular ? "border-primary" : ""}`}
              >
                {p.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-success shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={p.popular ? "default" : "outline"}
                  data-testid={`button-plan-${p.name.toLowerCase()}`}
                >
                  {p.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
              <TrendingUp className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">InsiderEdge</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Data sourced from SEC EDGAR. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
