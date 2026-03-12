import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignalCard, SignalCardSkeleton } from "@/components/signal-card";
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Crown,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import type { ScreenerResult } from "@shared/schema";

interface DashboardData {
  topSignals: ScreenerResult[];
  stats: {
    totalSignals: number;
    ceoFounderBuys: number;
    millionPlusBuys: number;
    clusterEvents: number;
    avgScore: number;
  };
  marketContext: {
    spyChange5d: number;
    isDownturn: boolean;
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <Card className="p-4" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className={`flex items-center justify-center w-7 h-7 rounded-md ${accent || "bg-primary/10 dark:bg-primary/20"}`}>
          <Icon className={`h-3.5 w-3.5 ${accent ? "text-white" : "text-primary"}`} />
        </div>
      </div>
      <span className="text-2xl font-bold font-mono">{value}</span>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Today's top insider trading signals ranked by our scoring algorithm.
        </p>
      </div>

      {data?.marketContext && (
        <Card
          className={`p-3 flex items-center gap-3 flex-wrap ${
            data.marketContext.isDownturn
              ? "border-destructive/30 bg-destructive/5 dark:bg-destructive/10"
              : "border-success/30 bg-success/5 dark:bg-success/10"
          }`}
          data-testid="card-market-context"
        >
          {data.marketContext.isDownturn ? (
            <TrendingDown className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <TrendingUp className="h-4 w-4 text-success shrink-0" />
          )}
          <span className="text-sm font-medium">
            SPY {data.marketContext.spyChange5d >= 0 ? "+" : ""}
            {data.marketContext.spyChange5d.toFixed(1)}% over 5 days
          </span>
          {data.marketContext.isDownturn && (
            <Badge variant="destructive" className="text-xs ml-auto">
              Market Downturn
            </Badge>
          )}
        </Card>
      )}

      {isLoading ? (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="h-3 w-20 rounded bg-muted animate-pulse mb-3" />
                <div className="h-7 w-12 rounded bg-muted animate-pulse" />
              </Card>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SignalCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : error ? (
        <Card className="p-8 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Failed to load dashboard data. Please try again later.
          </p>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <StatCard label="Total Signals" value={data.stats.totalSignals} icon={Activity} />
            <StatCard label="CEO/Founder Buys" value={data.stats.ceoFounderBuys} icon={Crown} />
            <StatCard label="$1M+ Purchases" value={data.stats.millionPlusBuys} icon={DollarSign} />
            <StatCard label="Cluster Events" value={data.stats.clusterEvents} icon={Users} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h2 className="font-semibold text-sm">Top Ranked Signals</h2>
              <Badge variant="outline" className="text-xs font-mono">
                Avg Score: {data.stats.avgScore.toFixed(0)}
              </Badge>
            </div>
            {data.topSignals.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.topSignals.map((s) => (
                  <SignalCard key={s.id} result={s} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No signals detected today. Check back later.
                </p>
              </Card>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
