import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { screenerFilterSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/dashboard", async (_req, res) => {
    try {
      const data = await storage.getDashboardData();
      res.json(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/screener", async (req, res) => {
    try {
      const rawFilters: any = {};
      const q = req.query;

      if (q.search) rawFilters.search = String(q.search);
      if (q.priceMin) rawFilters.priceMin = Number(q.priceMin);
      if (q.priceMax) rawFilters.priceMax = Number(q.priceMax);
      if (q.nearLow52w === "true") rawFilters.nearLow52w = true;
      if (q.nearMultiYearLow === "true") rawFilters.nearMultiYearLow = true;
      if (q.ceoFounderOnly === "true") rawFilters.ceoFounderOnly = true;
      if (q.minTransactionValue) rawFilters.minTransactionValue = Number(q.minTransactionValue);
      if (q.marketDownturn === "true") rawFilters.marketDownturn = true;
      if (q.beforeEarnings === "true") rawFilters.beforeEarnings = true;
      if (q.optionableOnly === "true") rawFilters.optionableOnly = true;
      if (q.smallCapOnly === "true") rawFilters.smallCapOnly = true;
      if (q.clusterBuying === "true") rawFilters.clusterBuying = true;
      if (q.sortBy) rawFilters.sortBy = String(q.sortBy);
      if (q.sortDir) rawFilters.sortDir = String(q.sortDir);
      if (q.page) rawFilters.page = Number(q.page);
      if (q.limit) rawFilters.limit = Number(q.limit);

      const filters = screenerFilterSchema.parse(rawFilters);
      const results = await storage.getScreenerResults(filters);
      res.json(results);
    } catch (err) {
      console.error("Screener error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stock/:ticker", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const detail = await storage.getStockDetail(ticker);
      if (!detail) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(detail);
    } catch (err) {
      console.error("Stock detail error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const q = String(req.query.q || "");
      if (!q || q.length < 1) {
        return res.json([]);
      }
      const results = await storage.searchCompanies(q);
      res.json(results);
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
