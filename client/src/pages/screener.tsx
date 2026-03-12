import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignalCard, SignalCardSkeleton } from "@/components/signal-card";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter,
} from "lucide-react";
import type { ScreenerResult, ScreenerFilter } from "@shared/schema";

const defaultFilters: ScreenerFilter = {
  priceMin: undefined,
  priceMax: undefined,
  nearLow52w: false,
  nearMultiYearLow: false,
  ceoFounderOnly: false,
  minTransactionValue: undefined,
  marketDownturn: false,
  beforeEarnings: false,
  optionableOnly: false,
  smallCapOnly: false,
  clusterBuying: false,
  sortBy: "signalScore",
  sortDir: "desc",
  page: 1,
  limit: 12,
  search: "",
};

function buildQueryString(filters: ScreenerFilter): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== false && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export default function Screener() {
  const searchString = useSearch();
  const initialSearch = new URLSearchParams(searchString).get("search") || "";

  const [filters, setFilters] = useState<ScreenerFilter>({
    ...defaultFilters,
    search: initialSearch,
  });
  const [showFilters, setShowFilters] = useState(true);

  const queryString = buildQueryString(filters);

  const { data, isLoading, error } = useQuery<{
    results: ScreenerResult[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ["/api/screener?" + queryString],
  });

  const updateFilter = useCallback(
    (key: keyof ScreenerFilter, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? value : 1 }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ ...defaultFilters });
  }, []);

  const activeFilterCount = [
    filters.nearLow52w,
    filters.nearMultiYearLow,
    filters.ceoFounderOnly,
    filters.marketDownturn,
    filters.beforeEarnings,
    filters.optionableOnly,
    filters.smallCapOnly,
    filters.clusterBuying,
    (filters.minTransactionValue ?? 0) > 0,
    (filters.priceMin ?? 0) > 0,
    (filters.priceMax ?? 0) > 0,
  ].filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-1" data-testid="text-screener-title">
            Screener
          </h1>
          <p className="text-sm text-muted-foreground">
            Filter and sort insider trading events by your criteria.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
            data-testid="button-toggle-filters"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs ml-0.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5 text-muted-foreground"
              data-testid="button-reset-filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by ticker or company name..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
          data-testid="input-screener-search"
        />
      </div>

      {showFilters && (
        <Card className="p-4" data-testid="card-filters">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Price Range
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "priceMin",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="h-8 text-sm"
                  data-testid="input-price-min"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "priceMax",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="h-8 text-sm"
                  data-testid="input-price-max"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Min Transaction Value
              </p>
              <Select
                value={String(filters.minTransactionValue ?? "0")}
                onValueChange={(v) =>
                  updateFilter("minTransactionValue", v === "0" ? undefined : Number(v))
                }
              >
                <SelectTrigger className="h-8 text-sm" data-testid="select-min-value">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="100000">$100K+</SelectItem>
                  <SelectItem value="500000">$500K+</SelectItem>
                  <SelectItem value="1000000">$1M+</SelectItem>
                  <SelectItem value="5000000">$5M+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sort By
              </p>
              <Select
                value={filters.sortBy || "signalScore"}
                onValueChange={(v) => updateFilter("sortBy", v)}
              >
                <SelectTrigger className="h-8 text-sm" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signalScore">Signal Score</SelectItem>
                  <SelectItem value="totalValue">Transaction Value</SelectItem>
                  <SelectItem value="currentPrice">Price</SelectItem>
                  <SelectItem value="ticker">Ticker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Direction
              </p>
              <Select
                value={filters.sortDir || "desc"}
                onValueChange={(v) => updateFilter("sortDir", v as "asc" | "desc")}
              >
                <SelectTrigger className="h-8 text-sm" data-testid="select-sort-dir">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Highest First</SelectItem>
                  <SelectItem value="asc">Lowest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t mt-4 pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Signal Filters
            </p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {[
                { key: "ceoFounderOnly", label: "CEO/Founder Only" },
                { key: "nearLow52w", label: "Near 52W Low" },
                { key: "nearMultiYearLow", label: "Near Multi-Year Low" },
                { key: "clusterBuying", label: "Cluster Buying" },
                { key: "marketDownturn", label: "Market Downturn" },
                { key: "beforeEarnings", label: "Before Earnings" },
                { key: "optionableOnly", label: "Optionable" },
                { key: "smallCapOnly", label: "Small-Cap" },
              ].map((f) => (
                <div key={f.key} className="flex items-center gap-2">
                  <Checkbox
                    id={f.key}
                    checked={!!filters[f.key as keyof ScreenerFilter]}
                    onCheckedChange={(v) =>
                      updateFilter(f.key as keyof ScreenerFilter, !!v)
                    }
                    data-testid={`checkbox-${f.key}`}
                  />
                  <Label htmlFor={f.key} className="text-sm cursor-pointer">
                    {f.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground" data-testid="text-result-count">
          {isLoading
            ? "Loading..."
            : data
              ? `${data.total} result${data.total !== 1 ? "s" : ""} found`
              : ""}
        </p>
        {data && data.totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={!data || data.page <= 1}
              onClick={() => updateFilter("page", (filters.page ?? 1) - 1)}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2 font-mono" data-testid="text-page-info">
              {data?.page ?? 1} / {data?.totalPages ?? 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={!data || data.page >= data.totalPages}
              onClick={() => updateFilter("page", (filters.page ?? 1) + 1)}
              data-testid="button-next-page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SignalCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground" data-testid="text-error">
            Failed to load screener results. Please try again.
          </p>
        </Card>
      ) : data && data.results.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((r) => (
            <SignalCard key={r.id} result={r} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center" data-testid="card-empty-state">
          <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No results match your filters</p>
          <p className="text-sm text-muted-foreground mb-3">
            Try adjusting your criteria or reset filters.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} data-testid="button-reset-empty">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
