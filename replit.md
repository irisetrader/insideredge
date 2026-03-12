# InsiderEdge - Insider Trading Screener

## Overview
InsiderEdge is an insider trading screener SaaS application that helps stock traders find and analyze insider buying activity, focusing on small-cap optionable stocks. The app screens for CEO/Founder purchases, cluster buying, and stocks near their lows.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express routes (backend)
- **State**: TanStack React Query

## Project Structure
```
client/src/
  pages/
    landing.tsx       - Marketing landing page
    dashboard.tsx     - Dashboard with top signals & stats
    screener.tsx      - Filterable screener with signal cards
    stock-detail.tsx  - Full stock detail with charts & transactions
  components/
    app-header.tsx    - Navigation header with search
    signal-card.tsx   - Reusable signal card component
    theme-provider.tsx - Dark/light mode
    theme-toggle.tsx  - Theme toggle button
server/
  index.ts            - Express server entry
  routes.ts           - API endpoints
  storage.ts          - Database storage layer
  db.ts               - Drizzle DB connection
  seed.ts             - Seed data for demo
shared/
  schema.ts           - Drizzle schemas & TypeScript types
```

## API Endpoints
- `GET /api/dashboard` - Dashboard data (top signals, stats, market context)
- `GET /api/screener?...` - Screener with filter query params
- `GET /api/stock/:ticker` - Stock detail with transactions, price history
- `GET /api/search?q=...` - Company search

## Database Tables
- `companies` - Stock companies with ticker, name, sector, market cap
- `prices` - OHLCV price history
- `insiders` - Insider persons with CEO/Founder flags
- `insider_transactions` - Buy/sell transactions with filing data
- `computed_metrics` - Signal scores, technical indicators, flags

## Design
- Dark-first finance theme with blue primary accent
- Inter font family, JetBrains Mono for data
- Signal scoring with color coding (green 80+, yellow 50+)
- Responsive grid layouts
