import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  TrendingUp,
  Users,
  Crown,
  DollarSign,
  Calendar,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import type { ScreenerResult } from "@shared/schema";

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

export function SignalCard({ result }: { result: ScreenerResult }) {
  const m = result.metrics;
  const tx = result.latestTransaction;
  const score = m?.signalScore ?? 0;

  return (
    <Link href={`/stock/${result.ticker}`}>
      <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-signal-${result.ticker}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-mono font-bold text-sm">{result.ticker}</span>
              {result.isOptionable && (
                <Badge variant="outline" className="text-xs">OPT</Badge>
              )}
              {result.isSmallCap && (
                <Badge variant="outline" className="text-xs">Small-Cap</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{result.name}</p>
          </div>
          <div className={`flex items-center justify-center rounded-md px-2 py-1 ${getScoreBg(score)}`}>
            <span className={`font-mono font-bold text-sm ${getScoreColor(score)}`}>
              {score.toFixed(0)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-medium font-mono">
              {m?.currentPrice ? `$${m.currentPrice.toFixed(2)}` : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              MCap {formatMarketCap(result.marketCap)}
            </span>
          </div>
        </div>

        {tx && (
          <div className="rounded-md bg-muted/50 dark:bg-muted/30 p-2.5 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              {tx.insider?.isCeo || tx.insider?.isFounder ? (
                <Crown className="h-3 w-3 text-warning" />
              ) : (
                <Users className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-xs font-medium truncate">
                {tx.insider?.name ?? "Insider"}
              </span>
              {tx.insider?.title && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  ({tx.insider.title})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-success font-medium">
                Bought {formatCurrency(tx.totalValue)}
              </span>
              <span className="text-xs text-muted-foreground">
                @ ${tx.pricePerShare.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {m?.hasCeoBuy && (
            <Badge variant="secondary" className="text-xs">
              <Crown className="h-2.5 w-2.5 mr-0.5" /> CEO Buy
            </Badge>
          )}
          {m?.hasFounderBuy && (
            <Badge variant="secondary" className="text-xs">
              <Crown className="h-2.5 w-2.5 mr-0.5" /> Founder
            </Badge>
          )}
          {m?.hasMillionPlusBuy && (
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="h-2.5 w-2.5 mr-0.5" /> $1M+
            </Badge>
          )}
          {m?.nearLow52w && (
            <Badge variant="secondary" className="text-xs">
              <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> Near 52W Low
            </Badge>
          )}
          {(m?.clusterBuyingScore ?? 0) >= 2 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-2.5 w-2.5 mr-0.5" /> Cluster
            </Badge>
          )}
          {m?.marketDownturnFlag && (
            <Badge variant="secondary" className="text-xs">
              <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> Downturn
            </Badge>
          )}
          {m?.boughtBeforeEarnings && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-2.5 w-2.5 mr-0.5" /> Pre-Earnings
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function SignalCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="h-4 w-16 rounded bg-muted animate-pulse mb-1.5" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-7 w-10 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-4 w-14 rounded bg-muted animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-14 rounded-md bg-muted animate-pulse mb-3" />
      <div className="flex gap-1">
        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
      </div>
    </Card>
  );
}
