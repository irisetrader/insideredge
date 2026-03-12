import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Crown,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  BarChart3,
  Activity,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { StockDetail } from "@shared/schema";

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(2)}`;
}

function formatMarketCap(val: number | null): string {
  if (!val) return "N/A";
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
  return `$${val.toFixed(0)}`;
}

function MetricPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5" data-testid={`metric-${label.toLowerCase().replace(/[\s()]/g, "-")}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-mono font-medium ${color || ""}`}>{value}</span>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-muted-foreground";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-success/10 dark:bg-success/20";
  if (score >= 50) return "bg-warning/10 dark:bg-warning/20";
  return "bg-muted";
}

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = params.ticker?.toUpperCase() || "";

  const { data, isLoading, error } = useQuery<StockDetail>({
    queryKey: ["/api/stock", ticker],
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <Card className="p-6">
          <div className="h-8 w-48 rounded bg-muted animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </Card>
        <Card className="h-64 animate-pulse bg-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <Link href="/screener">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4" data-testid="button-back-error">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Screener
          </Button>
        </Link>
        <Card className="p-8 text-center" data-testid="card-error">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground" data-testid="text-stock-not-found">
            Could not find stock data for {ticker}.
          </p>
        </Card>
      </div>
    );
  }

  const m = data.metrics;
  const score = m?.signalScore ?? 0;

  const chartData = (data.priceHistory || [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((p) => ({
      date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: p.close,
      volume: p.volume,
    }));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Link href="/screener">
        <Button variant="ghost" size="sm" className="gap-1.5" data-testid="button-back">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Screener
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight font-mono" data-testid="text-stock-ticker">
              {data.ticker}
            </h1>
            <div className={`flex items-center justify-center rounded-md px-2.5 py-1 ${getScoreBg(score)}`}>
              <span className={`font-mono font-bold text-sm ${getScoreColor(score)}`} data-testid="text-signal-score">
                Score {score.toFixed(0)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-stock-name">{data.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {data.isOptionable && <Badge variant="outline" data-testid="badge-optionable">Optionable</Badge>}
          {data.isSmallCap && <Badge variant="outline" data-testid="badge-smallcap">Small-Cap</Badge>}
          {data.exchange && <Badge variant="secondary" data-testid="badge-exchange">{data.exchange}</Badge>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2" data-testid="card-company-profile">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Company Profile
            </span>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <MetricPill label="Current Price" value={m?.currentPrice ? `$${m.currentPrice.toFixed(2)}` : "N/A"} />
            <MetricPill label="Market Cap" value={formatMarketCap(data.marketCap)} />
            <MetricPill label="Sector" value={data.sector || "N/A"} />
            <MetricPill label="Industry" value={data.industry || "N/A"} />
            <MetricPill label="52W Low" value={m?.low52w ? `$${m.low52w.toFixed(2)}` : "N/A"} />
            <MetricPill label="52W High" value={m?.high52w ? `$${m.high52w.toFixed(2)}` : "N/A"} />
            <MetricPill label="Earnings" value={data.earningsDate || "N/A"} />
            <MetricPill label="Exchange" value={data.exchange || "N/A"} />
          </div>
        </Card>

        <Card className="p-4" data-testid="card-technical">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Technical Indicators
            </span>
          </div>
          <div className="grid gap-3 grid-cols-2">
            <MetricPill label="RSI(14)" value={m?.rsi14 ? m.rsi14.toFixed(1) : "N/A"} color={m?.rsi14 && m.rsi14 < 30 ? "text-success" : m?.rsi14 && m.rsi14 > 70 ? "text-destructive" : ""} />
            <MetricPill label="Trend" value={m?.trendStatus || "N/A"} color={m?.trendStatus === "Bullish" ? "text-success" : m?.trendStatus === "Bearish" ? "text-destructive" : ""} />
            <MetricPill label="SMA 20" value={m?.sma20 ? `$${m.sma20.toFixed(2)}` : "N/A"} />
            <MetricPill label="SMA 50" value={m?.sma50 ? `$${m.sma50.toFixed(2)}` : "N/A"} />
            <MetricPill label="SMA 200" value={m?.sma200 ? `$${m.sma200.toFixed(2)}` : "N/A"} />
            <MetricPill label="Vol Spike" value={m?.volumeSpikeFlag ? "Yes" : "No"} color={m?.volumeSpikeFlag ? "text-warning" : ""} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2" data-testid="card-signal-flags">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Signal Flags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {m?.hasCeoBuy && (
              <Badge variant="secondary" data-testid="badge-ceo-buy"><Crown className="h-3 w-3 mr-1" /> CEO Purchase</Badge>
            )}
            {m?.hasFounderBuy && (
              <Badge variant="secondary" data-testid="badge-founder-buy"><Crown className="h-3 w-3 mr-1" /> Founder Purchase</Badge>
            )}
            {m?.hasMillionPlusBuy && (
              <Badge variant="secondary" data-testid="badge-million-buy"><DollarSign className="h-3 w-3 mr-1" /> $1M+ Buy</Badge>
            )}
            {m?.nearLow52w && (
              <Badge variant="secondary" data-testid="badge-near-low"><TrendingDown className="h-3 w-3 mr-1" /> Near 52W Low</Badge>
            )}
            {m?.nearMultiYearLow && (
              <Badge variant="secondary" data-testid="badge-multi-year-low"><TrendingDown className="h-3 w-3 mr-1" /> Near Multi-Year Low</Badge>
            )}
            {(m?.clusterBuyingScore ?? 0) >= 2 && (
              <Badge variant="secondary" data-testid="badge-cluster"><Users className="h-3 w-3 mr-1" /> Cluster Buying ({m?.clusterBuyingScore})</Badge>
            )}
            {m?.marketDownturnFlag && (
              <Badge variant="secondary" data-testid="badge-downturn"><TrendingDown className="h-3 w-3 mr-1" /> Market Downturn</Badge>
            )}
            {m?.boughtBeforeEarnings && (
              <Badge variant="secondary" data-testid="badge-pre-earnings"><Calendar className="h-3 w-3 mr-1" /> Before Earnings</Badge>
            )}
            {!m?.hasCeoBuy && !m?.hasFounderBuy && !m?.nearLow52w && !m?.hasMillionPlusBuy && (
              <span className="text-sm text-muted-foreground" data-testid="text-no-flags">No major signal flags detected.</span>
            )}
          </div>
        </Card>

        <Card className="p-4" data-testid="card-cluster">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Insider Activity
            </span>
          </div>
          <div className="grid gap-3 grid-cols-2">
            <MetricPill label="Cluster Score" value={String(m?.clusterBuyingScore ?? 0)} color={(m?.clusterBuyingScore ?? 0) >= 2 ? "text-success" : ""} />
            <MetricPill label="Transactions" value={String(data.transactions?.length || 0)} />
          </div>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="p-4" data-testid="card-price-chart">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price History
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 15%, 88%)" strokeOpacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 45%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 45%)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 22%, 11%)",
                    border: "1px solid hsl(220, 15%, 18%)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(210, 20%, 96%)",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(217, 91%, 45%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="p-4" data-testid="card-transactions">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Insider Transaction Timeline
          </span>
        </div>
        {data.transactions && data.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Insider</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Shares</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                  <TableHead className="text-xs text-right">Total Value</TableHead>
                  <TableHead className="text-xs text-center">Filing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map((tx) => (
                  <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                    <TableCell className="text-xs font-mono">
                      {new Date(tx.transactionDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(tx.insider?.isCeo || tx.insider?.isFounder) && (
                          <Crown className="h-3 w-3 text-warning shrink-0" />
                        )}
                        <span className="truncate max-w-32">{tx.insider?.name ?? "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-24">
                      {tx.insider?.title || "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.isPurchase ? "secondary" : "outline"} className="text-xs" data-testid={`badge-type-${tx.id}`}>
                        {tx.isPurchase ? "Buy" : "Sell"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {tx.shares.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      ${tx.pricePerShare.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium">
                      {formatCurrency(tx.totalValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      {tx.filingUrl ? (
                        <a
                          href={tx.filingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                          data-testid={`link-filing-${tx.id}`}
                        >
                          <ExternalLink className="h-3 w-3 text-primary" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{"\u2014"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-transactions">
            No insider transactions found for this stock.
          </p>
        )}
      </Card>
    </div>
  );
}
