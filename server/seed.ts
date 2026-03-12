import { db } from "./db";
import { storage } from "./storage";
import { companies } from "@shared/schema";
import { log } from "./index";

function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility: number
): { open: number; high: number; low: number; close: number; volume: number; date: string }[] {
  const history = [];
  let price = basePrice * (1 + Math.random() * 0.3);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const change = (Math.random() - 0.52) * volatility;
    price = Math.max(0.5, price + change);

    const dayHigh = price * (1 + Math.random() * 0.03);
    const dayLow = price * (1 - Math.random() * 0.03);
    const open = price * (1 + (Math.random() - 0.5) * 0.02);
    const volume = Math.floor(500000 + Math.random() * 5000000);

    history.push({
      date: dateStr,
      open: Math.round(open * 100) / 100,
      high: Math.round(dayHigh * 100) / 100,
      low: Math.round(dayLow * 100) / 100,
      close: Math.round(price * 100) / 100,
      volume,
    });
  }

  return history;
}

export async function seedDatabase() {
  const existingCount = await storage.getCompanyCount();
  if (existingCount > 0) {
    log("Database already seeded, skipping", "seed");
    return;
  }

  log("Seeding database with insider trading data...", "seed");

  const companiesData = [
    {
      ticker: "NXRA",
      name: "Nexera Therapeutics Inc",
      sector: "Healthcare",
      industry: "Biotechnology",
      exchange: "NASDAQ",
      marketCap: 420000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-03-15",
      description: "Clinical-stage biopharmaceutical company developing novel oncology treatments.",
    },
    {
      ticker: "BOLT",
      name: "BoltWave Energy Corp",
      sector: "Energy",
      industry: "Renewable Energy",
      exchange: "NYSE",
      marketCap: 680000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-03-01",
      description: "Developing next-generation energy storage and grid solutions.",
    },
    {
      ticker: "ACME",
      name: "Acme Digital Solutions",
      sector: "Technology",
      industry: "Software Infrastructure",
      exchange: "NASDAQ",
      marketCap: 950000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-02-28",
      description: "Enterprise SaaS platform for supply chain and logistics automation.",
    },
    {
      ticker: "MNRL",
      name: "Mineral Ridge Resources",
      sector: "Basic Materials",
      industry: "Gold Mining",
      exchange: "NYSE",
      marketCap: 380000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-04-10",
      description: "Junior gold and silver mining company with properties in Nevada and Idaho.",
    },
    {
      ticker: "VCTR",
      name: "Vector Dynamics Inc",
      sector: "Industrials",
      industry: "Aerospace & Defense",
      exchange: "NASDAQ",
      marketCap: 1200000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-03-20",
      description: "Precision components manufacturer for aerospace and defense applications.",
    },
    {
      ticker: "PRXL",
      name: "Proxel Bio Sciences",
      sector: "Healthcare",
      industry: "Medical Devices",
      exchange: "NASDAQ",
      marketCap: 310000000,
      isSmallCap: true,
      isOptionable: false,
      earningsDate: "2026-04-05",
      description: "Developing minimally invasive diagnostic devices for point-of-care testing.",
    },
    {
      ticker: "CRBN",
      name: "CarbonShift Technologies",
      sector: "Industrials",
      industry: "Environmental Services",
      exchange: "NYSE",
      marketCap: 520000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-03-25",
      description: "Carbon capture and sequestration technology for industrial applications.",
    },
    {
      ticker: "QLUX",
      name: "QuantumLux Semiconductors",
      sector: "Technology",
      industry: "Semiconductors",
      exchange: "NASDAQ",
      marketCap: 780000000,
      isSmallCap: true,
      isOptionable: true,
      earningsDate: "2026-02-20",
      description: "Fabless semiconductor company focused on quantum-resistant encryption chips.",
    },
  ];

  const createdCompanies = [];
  for (const c of companiesData) {
    const company = await storage.createCompany(c);
    createdCompanies.push(company);
  }

  const insidersData = [
    { name: "James R. Mitchell", title: "CEO & Co-Founder", isCeo: true, isFounder: true },
    { name: "Sarah L. Chen", title: "CEO", isCeo: true, isFounder: false },
    { name: "David Kovalev", title: "Co-Founder & CTO", isCeo: false, isFounder: true },
    { name: "Maria Gonzalez", title: "CFO", isCeo: false, isFounder: false },
    { name: "Robert Wei", title: "CEO & Founder", isCeo: true, isFounder: true },
    { name: "Emily Parker", title: "Director", isCeo: false, isFounder: false },
    { name: "Michael Tanaka", title: "EVP Operations", isCeo: false, isFounder: false },
    { name: "Dr. Lisa Novak", title: "Chief Scientific Officer", isCeo: false, isFounder: false },
    { name: "Thomas Burke", title: "CEO", isCeo: true, isFounder: false },
    { name: "Angela Reyes", title: "10% Owner", isCeo: false, isFounder: false },
    { name: "Peter Mansfield", title: "CEO & Founder", isCeo: true, isFounder: true },
    { name: "Jennifer Walsh", title: "Director", isCeo: false, isFounder: false },
  ];

  const createdInsiders = [];
  for (const ins of insidersData) {
    const insider = await storage.createInsider(ins);
    createdInsiders.push(insider);
  }

  const transactionsConfig = [
    { companyIdx: 0, insiderIdx: 0, shares: 500000, price: 3.20, daysAgo: 3, isPurchase: true },
    { companyIdx: 0, insiderIdx: 3, shares: 100000, price: 3.18, daysAgo: 5, isPurchase: true },
    { companyIdx: 0, insiderIdx: 5, shares: 75000, price: 3.25, daysAgo: 7, isPurchase: true },
    { companyIdx: 1, insiderIdx: 2, shares: 350000, price: 4.10, daysAgo: 2, isPurchase: true },
    { companyIdx: 1, insiderIdx: 6, shares: 120000, price: 4.05, daysAgo: 4, isPurchase: true },
    { companyIdx: 2, insiderIdx: 1, shares: 450000, price: 4.55, daysAgo: 1, isPurchase: true },
    { companyIdx: 2, insiderIdx: 3, shares: 200000, price: 4.50, daysAgo: 6, isPurchase: true },
    { companyIdx: 2, insiderIdx: 5, shares: 80000, price: 4.48, daysAgo: 8, isPurchase: true },
    { companyIdx: 3, insiderIdx: 4, shares: 600000, price: 2.80, daysAgo: 4, isPurchase: true },
    { companyIdx: 3, insiderIdx: 9, shares: 250000, price: 2.75, daysAgo: 6, isPurchase: true },
    { companyIdx: 4, insiderIdx: 8, shares: 200000, price: 4.90, daysAgo: 5, isPurchase: true },
    { companyIdx: 4, insiderIdx: 11, shares: 50000, price: 4.85, daysAgo: 10, isPurchase: true },
    { companyIdx: 5, insiderIdx: 10, shares: 400000, price: 3.50, daysAgo: 3, isPurchase: true },
    { companyIdx: 5, insiderIdx: 7, shares: 150000, price: 3.45, daysAgo: 5, isPurchase: true },
    { companyIdx: 6, insiderIdx: 1, shares: 300000, price: 3.90, daysAgo: 2, isPurchase: true },
    { companyIdx: 6, insiderIdx: 6, shares: 100000, price: 3.85, daysAgo: 4, isPurchase: true },
    { companyIdx: 7, insiderIdx: 2, shares: 280000, price: 4.30, daysAgo: 1, isPurchase: true },
    { companyIdx: 7, insiderIdx: 5, shares: 90000, price: 4.25, daysAgo: 3, isPurchase: true },
    { companyIdx: 7, insiderIdx: 9, shares: 60000, price: 4.20, daysAgo: 7, isPurchase: true },
  ];

  for (const tx of transactionsConfig) {
    const d = new Date();
    d.setDate(d.getDate() - tx.daysAgo);
    const txDate = d.toISOString().split("T")[0];

    await storage.createTransaction({
      companyId: createdCompanies[tx.companyIdx].id,
      insiderId: createdInsiders[tx.insiderIdx].id,
      filingDate: txDate,
      transactionDate: txDate,
      isPurchase: tx.isPurchase,
      shares: tx.shares,
      pricePerShare: tx.price,
      totalValue: tx.shares * tx.price,
      sharesOwnedAfter: Math.floor(tx.shares * 2.5),
      filingUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${createdCompanies[tx.companyIdx].ticker}&type=4`,
    });
  }

  const priceTargets = [3.22, 4.12, 4.55, 2.82, 4.88, 3.50, 3.92, 4.32];
  for (let i = 0; i < createdCompanies.length; i++) {
    const history = generatePriceHistory(priceTargets[i], 90, 0.08);
    for (const p of history) {
      await storage.createPrice({
        companyId: createdCompanies[i].id,
        date: p.date,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
      });
    }
  }

  const metricsConfig = [
    {
      companyIdx: 0,
      currentPrice: 3.22,
      low52w: 2.80,
      high52w: 6.10,
      nearLow52w: true,
      nearMultiYearLow: true,
      rsi14: 28.5,
      sma20: 3.35,
      sma50: 3.80,
      sma200: 4.20,
      volumeAvg: 1500000,
      volumeLatest: 4200000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 3,
      signalScore: 94,
      marketDownturnFlag: true,
      boughtBeforeEarnings: true,
      hasCeoBuy: true,
      hasFounderBuy: true,
      hasMillionPlusBuy: true,
    },
    {
      companyIdx: 1,
      currentPrice: 4.12,
      low52w: 3.60,
      high52w: 7.80,
      nearLow52w: true,
      nearMultiYearLow: false,
      rsi14: 32.1,
      sma20: 4.25,
      sma50: 4.60,
      sma200: 5.10,
      volumeAvg: 2000000,
      volumeLatest: 3800000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 2,
      signalScore: 88,
      marketDownturnFlag: true,
      boughtBeforeEarnings: true,
      hasCeoBuy: false,
      hasFounderBuy: true,
      hasMillionPlusBuy: true,
    },
    {
      companyIdx: 2,
      currentPrice: 4.55,
      low52w: 3.90,
      high52w: 8.20,
      nearLow52w: true,
      nearMultiYearLow: false,
      rsi14: 35.8,
      sma20: 4.70,
      sma50: 5.20,
      sma200: 5.80,
      volumeAvg: 2500000,
      volumeLatest: 5100000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 3,
      signalScore: 82,
      marketDownturnFlag: false,
      boughtBeforeEarnings: true,
      hasCeoBuy: true,
      hasFounderBuy: false,
      hasMillionPlusBuy: true,
    },
    {
      companyIdx: 3,
      currentPrice: 2.82,
      low52w: 2.40,
      high52w: 5.50,
      nearLow52w: true,
      nearMultiYearLow: true,
      rsi14: 25.3,
      sma20: 3.10,
      sma50: 3.50,
      sma200: 3.90,
      volumeAvg: 800000,
      volumeLatest: 2100000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 2,
      signalScore: 91,
      marketDownturnFlag: true,
      boughtBeforeEarnings: false,
      hasCeoBuy: true,
      hasFounderBuy: true,
      hasMillionPlusBuy: true,
    },
    {
      companyIdx: 4,
      currentPrice: 4.88,
      low52w: 4.20,
      high52w: 9.50,
      nearLow52w: true,
      nearMultiYearLow: false,
      rsi14: 38.2,
      sma20: 5.10,
      sma50: 5.80,
      sma200: 6.40,
      volumeAvg: 1200000,
      volumeLatest: 1800000,
      volumeSpikeFlag: false,
      trendStatus: "Bearish",
      clusterBuyingScore: 1,
      signalScore: 65,
      marketDownturnFlag: false,
      boughtBeforeEarnings: true,
      hasCeoBuy: true,
      hasFounderBuy: false,
      hasMillionPlusBuy: false,
    },
    {
      companyIdx: 5,
      currentPrice: 3.50,
      low52w: 3.10,
      high52w: 6.80,
      nearLow52w: true,
      nearMultiYearLow: true,
      rsi14: 30.0,
      sma20: 3.65,
      sma50: 4.10,
      sma200: 4.60,
      volumeAvg: 600000,
      volumeLatest: 1500000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 2,
      signalScore: 86,
      marketDownturnFlag: true,
      boughtBeforeEarnings: false,
      hasCeoBuy: true,
      hasFounderBuy: true,
      hasMillionPlusBuy: true,
    },
    {
      companyIdx: 6,
      currentPrice: 3.92,
      low52w: 3.50,
      high52w: 7.20,
      nearLow52w: true,
      nearMultiYearLow: false,
      rsi14: 33.5,
      sma20: 4.05,
      sma50: 4.50,
      sma200: 5.00,
      volumeAvg: 1000000,
      volumeLatest: 2200000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 2,
      signalScore: 76,
      marketDownturnFlag: false,
      boughtBeforeEarnings: true,
      hasCeoBuy: true,
      hasFounderBuy: false,
      hasMillionPlusBuy: true,
    },
    {
      companyIdx: 7,
      currentPrice: 4.32,
      low52w: 3.80,
      high52w: 8.00,
      nearLow52w: true,
      nearMultiYearLow: false,
      rsi14: 31.2,
      sma20: 4.45,
      sma50: 4.90,
      sma200: 5.50,
      volumeAvg: 1800000,
      volumeLatest: 4500000,
      volumeSpikeFlag: true,
      trendStatus: "Bearish",
      clusterBuyingScore: 3,
      signalScore: 79,
      marketDownturnFlag: true,
      boughtBeforeEarnings: false,
      hasCeoBuy: false,
      hasFounderBuy: true,
      hasMillionPlusBuy: true,
    },
  ];

  for (const m of metricsConfig) {
    await storage.createMetrics({
      companyId: createdCompanies[m.companyIdx].id,
      currentPrice: m.currentPrice,
      low52w: m.low52w,
      high52w: m.high52w,
      nearLow52w: m.nearLow52w,
      nearMultiYearLow: m.nearMultiYearLow,
      rsi14: m.rsi14,
      sma20: m.sma20,
      sma50: m.sma50,
      sma200: m.sma200,
      volumeAvg: m.volumeAvg,
      volumeLatest: m.volumeLatest,
      volumeSpikeFlag: m.volumeSpikeFlag,
      trendStatus: m.trendStatus,
      clusterBuyingScore: m.clusterBuyingScore,
      signalScore: m.signalScore,
      marketDownturnFlag: m.marketDownturnFlag,
      boughtBeforeEarnings: m.boughtBeforeEarnings,
      hasCeoBuy: m.hasCeoBuy,
      hasFounderBuy: m.hasFounderBuy,
      hasMillionPlusBuy: m.hasMillionPlusBuy,
    });
  }

  log("Database seeded successfully with 8 companies and insider trading data", "seed");
}
