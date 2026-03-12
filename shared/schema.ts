import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  date,
  serial,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable(
  "companies",
  {
    id: serial("id").primaryKey(),
    ticker: varchar("ticker", { length: 10 }).notNull().unique(),
    name: text("name").notNull(),
    sector: text("sector"),
    industry: text("industry"),
    exchange: varchar("exchange", { length: 10 }),
    marketCap: real("market_cap"),
    isSmallCap: boolean("is_small_cap").default(false),
    isOptionable: boolean("is_optionable").default(false),
    earningsDate: date("earnings_date"),
    description: text("description"),
  },
  (table) => [
    index("companies_ticker_idx").on(table.ticker),
  ]
);

export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id),
    date: date("date").notNull(),
    open: real("open").notNull(),
    high: real("high").notNull(),
    low: real("low").notNull(),
    close: real("close").notNull(),
    volume: integer("volume").notNull(),
  },
  (table) => [
    index("prices_company_date_idx").on(table.companyId, table.date),
  ]
);

export const insiders = pgTable("insiders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  isCeo: boolean("is_ceo").default(false),
  isFounder: boolean("is_founder").default(false),
});

export const insiderTransactions = pgTable(
  "insider_transactions",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id),
    insiderId: integer("insider_id")
      .notNull()
      .references(() => insiders.id),
    filingDate: date("filing_date").notNull(),
    transactionDate: date("transaction_date").notNull(),
    isPurchase: boolean("is_purchase").default(true),
    shares: integer("shares").notNull(),
    pricePerShare: real("price_per_share").notNull(),
    totalValue: real("total_value").notNull(),
    sharesOwnedAfter: integer("shares_owned_after"),
    filingUrl: text("filing_url"),
  },
  (table) => [
    index("transactions_company_idx").on(table.companyId),
    index("transactions_date_idx").on(table.transactionDate),
  ]
);

export const computedMetrics = pgTable(
  "computed_metrics",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id),
    computedAt: timestamp("computed_at").defaultNow(),
    currentPrice: real("current_price"),
    low52w: real("low_52w"),
    high52w: real("high_52w"),
    nearLow52w: boolean("near_low_52w").default(false),
    nearMultiYearLow: boolean("near_multi_year_low").default(false),
    rsi14: real("rsi_14"),
    sma20: real("sma_20"),
    sma50: real("sma_50"),
    sma200: real("sma_200"),
    volumeAvg: real("volume_avg"),
    volumeLatest: integer("volume_latest"),
    volumeSpikeFlag: boolean("volume_spike_flag").default(false),
    trendStatus: text("trend_status"),
    clusterBuyingScore: integer("cluster_buying_score").default(0),
    signalScore: real("signal_score").default(0),
    marketDownturnFlag: boolean("market_downturn_flag").default(false),
    boughtBeforeEarnings: boolean("bought_before_earnings").default(false),
    hasCeoBuy: boolean("has_ceo_buy").default(false),
    hasFounderBuy: boolean("has_founder_buy").default(false),
    hasMillionPlusBuy: boolean("has_million_plus_buy").default(false),
  },
  (table) => [
    index("metrics_company_idx").on(table.companyId),
    index("metrics_score_idx").on(table.signalScore),
  ]
);

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertPriceSchema = createInsertSchema(prices).omit({ id: true });
export const insertInsiderSchema = createInsertSchema(insiders).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(insiderTransactions).omit({ id: true });
export const insertMetricsSchema = createInsertSchema(computedMetrics).omit({ id: true });

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertPrice = z.infer<typeof insertPriceSchema>;
export type InsertInsider = z.infer<typeof insertInsiderSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;

export type Company = typeof companies.$inferSelect;
export type Price = typeof prices.$inferSelect;
export type Insider = typeof insiders.$inferSelect;
export type InsiderTransaction = typeof insiderTransactions.$inferSelect;
export type ComputedMetrics = typeof computedMetrics.$inferSelect;

export type ScreenerResult = Company & {
  metrics: ComputedMetrics | null;
  latestTransaction: (InsiderTransaction & { insider: Insider }) | null;
};

export type StockDetail = Company & {
  metrics: ComputedMetrics | null;
  transactions: (InsiderTransaction & { insider: Insider })[];
  priceHistory: Price[];
};

export const screenerFilterSchema = z.object({
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  nearLow52w: z.boolean().optional(),
  nearMultiYearLow: z.boolean().optional(),
  ceoFounderOnly: z.boolean().optional(),
  minTransactionValue: z.number().optional(),
  marketDownturn: z.boolean().optional(),
  beforeEarnings: z.boolean().optional(),
  optionableOnly: z.boolean().optional(),
  smallCapOnly: z.boolean().optional(),
  clusterBuying: z.boolean().optional(),
  sortBy: z.enum(["signalScore", "totalValue", "currentPrice", "ticker"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
});

export type ScreenerFilter = z.infer<typeof screenerFilterSchema>;
