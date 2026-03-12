import { db } from "./db";
import { eq, and, gte, lte, desc, asc, ilike, or, sql, count } from "drizzle-orm";
import {
  companies,
  prices,
  insiders,
  insiderTransactions,
  computedMetrics,
  type Company,
  type InsertCompany,
  type Price,
  type InsertPrice,
  type Insider,
  type InsertInsider,
  type InsiderTransaction,
  type InsertTransaction,
  type ComputedMetrics,
  type InsertMetrics,
  type ScreenerResult,
  type ScreenerFilter,
  type StockDetail,
} from "@shared/schema";

export interface IStorage {
  getCompanies(): Promise<Company[]>;
  getCompanyByTicker(ticker: string): Promise<Company | undefined>;
  createCompany(data: InsertCompany): Promise<Company>;
  createInsider(data: InsertInsider): Promise<Insider>;
  createTransaction(data: InsertTransaction): Promise<InsiderTransaction>;
  createPrice(data: InsertPrice): Promise<Price>;
  createMetrics(data: InsertMetrics): Promise<ComputedMetrics>;
  getScreenerResults(filters: ScreenerFilter): Promise<{
    results: ScreenerResult[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getStockDetail(ticker: string): Promise<StockDetail | null>;
  getDashboardData(): Promise<{
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
  }>;
  searchCompanies(query: string): Promise<Company[]>;
  getCompanyCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies);
  }

  async getCompanyByTicker(ticker: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.ticker, ticker.toUpperCase()))
      .limit(1);
    return company;
  }

  async createCompany(data: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(data).returning();
    return company;
  }

  async createInsider(data: InsertInsider): Promise<Insider> {
    const [insider] = await db.insert(insiders).values(data).returning();
    return insider;
  }

  async createTransaction(data: InsertTransaction): Promise<InsiderTransaction> {
    const [tx] = await db.insert(insiderTransactions).values(data).returning();
    return tx;
  }

  async createPrice(data: InsertPrice): Promise<Price> {
    const [price] = await db.insert(prices).values(data).returning();
    return price;
  }

  async createMetrics(data: InsertMetrics): Promise<ComputedMetrics> {
    const [metric] = await db.insert(computedMetrics).values(data).returning();
    return metric;
  }

  async getCompanyCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(companies);
    return result?.count ?? 0;
  }

  async searchCompanies(query: string): Promise<Company[]> {
    return db
      .select()
      .from(companies)
      .where(
        or(
          ilike(companies.ticker, `%${query}%`),
          ilike(companies.name, `%${query}%`)
        )
      )
      .limit(10);
  }

  async getScreenerResults(filters: ScreenerFilter): Promise<{
    results: ScreenerResult[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters.search) {
      conditions.push(
        or(
          ilike(companies.ticker, `%${filters.search}%`),
          ilike(companies.name, `%${filters.search}%`)
        )
      );
    }

    if (filters.priceMin !== undefined) {
      conditions.push(gte(computedMetrics.currentPrice, filters.priceMin));
    }
    if (filters.priceMax !== undefined) {
      conditions.push(lte(computedMetrics.currentPrice, filters.priceMax));
    }
    if (filters.nearLow52w) {
      conditions.push(eq(computedMetrics.nearLow52w, true));
    }
    if (filters.nearMultiYearLow) {
      conditions.push(eq(computedMetrics.nearMultiYearLow, true));
    }
    if (filters.ceoFounderOnly) {
      conditions.push(
        or(eq(computedMetrics.hasCeoBuy, true), eq(computedMetrics.hasFounderBuy, true))
      );
    }
    if (filters.marketDownturn) {
      conditions.push(eq(computedMetrics.marketDownturnFlag, true));
    }
    if (filters.beforeEarnings) {
      conditions.push(eq(computedMetrics.boughtBeforeEarnings, true));
    }
    if (filters.optionableOnly) {
      conditions.push(eq(companies.isOptionable, true));
    }
    if (filters.smallCapOnly) {
      conditions.push(eq(companies.isSmallCap, true));
    }
    if (filters.clusterBuying) {
      conditions.push(gte(computedMetrics.clusterBuyingScore, 2));
    }
    if (filters.minTransactionValue) {
      conditions.push(eq(computedMetrics.hasMillionPlusBuy, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy: any;
    const sortDir = filters.sortDir === "asc" ? asc : desc;
    switch (filters.sortBy) {
      case "totalValue":
        orderBy = sortDir(computedMetrics.signalScore);
        break;
      case "currentPrice":
        orderBy = sortDir(computedMetrics.currentPrice);
        break;
      case "ticker":
        orderBy = sortDir(companies.ticker);
        break;
      default:
        orderBy = sortDir(computedMetrics.signalScore);
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(companies)
      .leftJoin(computedMetrics, eq(companies.id, computedMetrics.companyId))
      .where(whereClause);

    const total = totalResult?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    const rows = await db
      .select({
        company: companies,
        metrics: computedMetrics,
      })
      .from(companies)
      .leftJoin(computedMetrics, eq(companies.id, computedMetrics.companyId))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const results: ScreenerResult[] = [];

    for (const row of rows) {
      const latestTx = await db
        .select({
          transaction: insiderTransactions,
          insider: insiders,
        })
        .from(insiderTransactions)
        .leftJoin(insiders, eq(insiderTransactions.insiderId, insiders.id))
        .where(eq(insiderTransactions.companyId, row.company.id))
        .orderBy(desc(insiderTransactions.transactionDate))
        .limit(1);

      results.push({
        ...row.company,
        metrics: row.metrics,
        latestTransaction: latestTx[0]
          ? { ...latestTx[0].transaction, insider: latestTx[0].insider! }
          : null,
      });
    }

    return { results, total, page, totalPages };
  }

  async getStockDetail(ticker: string): Promise<StockDetail | null> {
    const company = await this.getCompanyByTicker(ticker);
    if (!company) return null;

    const [metrics] = await db
      .select()
      .from(computedMetrics)
      .where(eq(computedMetrics.companyId, company.id))
      .limit(1);

    const txRows = await db
      .select({
        transaction: insiderTransactions,
        insider: insiders,
      })
      .from(insiderTransactions)
      .leftJoin(insiders, eq(insiderTransactions.insiderId, insiders.id))
      .where(eq(insiderTransactions.companyId, company.id))
      .orderBy(desc(insiderTransactions.transactionDate));

    const priceHistory = await db
      .select()
      .from(prices)
      .where(eq(prices.companyId, company.id))
      .orderBy(asc(prices.date));

    return {
      ...company,
      metrics: metrics || null,
      transactions: txRows.map((r) => ({
        ...r.transaction,
        insider: r.insider!,
      })),
      priceHistory,
    };
  }

  async getDashboardData() {
    const allMetrics = await db.select().from(computedMetrics);

    const totalSignals = allMetrics.length;
    const ceoFounderBuys = allMetrics.filter(
      (m) => m.hasCeoBuy || m.hasFounderBuy
    ).length;
    const millionPlusBuys = allMetrics.filter((m) => m.hasMillionPlusBuy).length;
    const clusterEvents = allMetrics.filter(
      (m) => (m.clusterBuyingScore ?? 0) >= 2
    ).length;
    const avgScore =
      totalSignals > 0
        ? allMetrics.reduce((sum, m) => sum + (m.signalScore ?? 0), 0) / totalSignals
        : 0;

    const topResult = await this.getScreenerResults({
      sortBy: "signalScore",
      sortDir: "desc",
      page: 1,
      limit: 9,
    });

    const hasDownturn = allMetrics.some((m) => m.marketDownturnFlag);

    return {
      topSignals: topResult.results,
      stats: {
        totalSignals,
        ceoFounderBuys,
        millionPlusBuys,
        clusterEvents,
        avgScore,
      },
      marketContext: {
        spyChange5d: hasDownturn ? -3.2 : 1.4,
        isDownturn: hasDownturn,
      },
    };
  }
}

export const storage = new DatabaseStorage();
