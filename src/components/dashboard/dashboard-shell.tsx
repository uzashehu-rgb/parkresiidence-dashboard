import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Building2,
  Camera,
  CreditCard,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Users,
} from "lucide-react";

import { dashboardFallback } from "@/data/dashboard-fallback";
import { getDashboard } from "@/lib/dashboard-api";
import { siteConfig } from "@/lib/site";
import type { DashboardData } from "@/lib/dashboard-types";

type DashboardContextValue = {
  data: DashboardData;
  loading: boolean;
  saving: boolean;
  apiError: string | null;
  search: string;
  setSearch: (value: string) => void;
  runMutation: (action: () => Promise<DashboardData>) => Promise<boolean>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/charts", label: "Analitika", icon: BarChart3 },
  { href: "/dashboard/invoices", label: "Faturat", icon: Receipt },
  { href: "/dashboard/apartments", label: "Banesat", icon: Building2 },
  { href: "/dashboard/clients", label: "Klientet", icon: Users },
  { href: "/dashboard/payments", label: "Pagesat", icon: CreditCard },
  { href: "/dashboard/progress", label: "Progresi", icon: Camera },
  { href: "/dashboard/audit", label: "Audit logs", icon: Activity },
] as const;

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(dashboardFallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setApiError(null);
      })
      .catch((error: Error) => {
        if (!active) return;
        setData(dashboardFallback);
        setApiError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function runMutation(action: () => Promise<DashboardData>) {
    setSaving(true);
    setApiError(null);
    try {
      const payload = await action();
      setData(payload);
      return true;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Action failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const value = useMemo(
    () => ({
      data,
      loading,
      saving,
      apiError,
      search,
      setSearch,
      runMutation,
    }),
    [apiError, data, loading, saving, search],
  );

  return (
    <DashboardContext.Provider value={value}>
      <DashboardFrame>{children}</DashboardFrame>
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
}

function DashboardFrame({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("dashboard-sidebar-collapsed") === "true";
  });
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { apiError, data, search, setSearch } = useDashboard();

  useEffect(() => {
    window.localStorage.setItem("dashboard-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f2eb] text-zinc-950">
      <button
        type="button"
        onClick={() => setSidebarOpen((current) => !current)}
        className="fixed left-4 top-4 z-[60] inline-flex size-11 items-center justify-center rounded-md border border-[#ded7c9] bg-[#fbfaf7]/95 text-zinc-900 shadow-sm backdrop-blur lg:hidden"
        aria-label={sidebarOpen ? "Close dashboard navigation" : "Open dashboard navigation"}
      >
        {sidebarOpen ? <PanelLeftClose className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-[#ded7c9] bg-[#fbfaf7] transition-all duration-300 lg:translate-x-0 ${
          collapsed ? "lg:w-[88px]" : "lg:w-[292px]"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex items-center border-b border-[#ded7c9] p-4 pl-20 lg:pl-4 ${
            collapsed ? "lg:justify-center" : "justify-between"
          }`}
        >
          <a href="/" className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`} title={siteConfig.name}>
            <span className="block truncate text-lg font-semibold tracking-tight text-zinc-950">
              {siteConfig.name}
            </span>
          </a>
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-md border border-[#ded7c9] bg-white text-zinc-600 transition hover:text-zinc-950 lg:inline-flex"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? "Expand dashboard navigation" : "Collapse dashboard navigation"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto px-3 py-5 ${collapsed ? "lg:px-4" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={item.label}
                className={`group flex items-center rounded-md px-3 py-3 text-sm transition ${
                  collapsed ? "lg:justify-center lg:px-0" : "gap-3"
                } ${
                  active
                    ? "bg-[#24211d] text-white shadow-[0_14px_32px_-22px_rgba(36,33,29,0.95)]"
                    : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 ${active ? "text-[#d2b36b]" : "text-[#9a7133]"}`}
                />
                <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <div
        className={`transition-all duration-300 ${collapsed ? "lg:pl-[88px]" : "lg:pl-[292px]"}`}
      >
        <main className="mx-auto flex w-full min-w-0 max-w-[1540px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 pl-14 sm:pl-0">
              <p className="truncate text-sm font-semibold text-zinc-950">{data.project.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {data.summary.apartmentCount} banesa · {data.summary.overduePayments} pagesa me
                vonese
              </p>
            </div>
            <div className="relative w-full min-w-0 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kerko ne dashboard"
                className="h-10 w-full rounded-md border border-[#d8d2c6] bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#8f6a2e] focus:ring-2 focus:ring-[#8f6a2e]/15"
              />
            </div>
          </div>
          {apiError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
