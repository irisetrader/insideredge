import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppHeader } from "@/components/app-header";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Screener from "@/pages/screener";
import StockDetail from "@/pages/stock-detail";

function AppPages() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/screener" component={Screener} />
          <Route path="/stock/:ticker" component={StockDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Switch>
            <Route path="/" component={Landing} />
            <Route component={AppPages} />
          </Switch>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
