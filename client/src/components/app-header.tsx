import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  LayoutDashboard,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { useState, useCallback } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Screener", href: "/screener", icon: SlidersHorizontal },
];

export function AppHeader() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/screener?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, navigate]
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-2 flex-wrap">
        <div className="flex items-center gap-6 flex-wrap">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-base tracking-tight hidden sm:inline">
                InsiderEdge
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 flex-wrap">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ticker or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-56 h-8 text-sm"
              data-testid="input-header-search"
            />
          </form>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
