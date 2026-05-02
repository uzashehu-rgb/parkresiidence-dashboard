import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Building2,
  Camera,
  CreditCard,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ApiError, getDashboard, logout, setAuthToken } from "@/lib/dashboard-api";
import { siteConfig } from "@/lib/site";
import type { DashboardData, DashboardPermissions, DashboardViewer } from "@/lib/dashboard-types";

type DashboardContextValue = {
  data: DashboardData;
  viewer: DashboardViewer;
  loading: boolean;
  saving: boolean;
  apiError: string | null;
  search: string;
  setSearch: (value: string) => void;
  runMutation: (action: () => Promise<DashboardData>) => Promise<boolean>;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof Home;
  permission: keyof DashboardPermissions;
}> = [
  { href: "/dashboard", label: "Overview", icon: Home, permission: "canViewOverview" },
  { href: "/dashboard/charts", label: "Analitika", icon: BarChart3, permission: "canViewCharts" },
  { href: "/dashboard/invoices", label: "Faturat", icon: Receipt, permission: "canViewInvoices" },
  {
    href: "/dashboard/apartments",
    label: "Banesat",
    icon: Building2,
    permission: "canViewApartments",
  },
  { href: "/dashboard/clients", label: "Klientet", icon: Users, permission: "canViewClients" },
  {
    href: "/dashboard/payments",
    label: "Pagesat",
    icon: CreditCard,
    permission: "canViewPayments",
  },
  { href: "/dashboard/progress", label: "Progresi", icon: Camera, permission: "canViewProgress" },
  { href: "/dashboard/audit", label: "Audit logs", icon: Activity, permission: "canViewAudit" },
  { href: "/dashboard/users", label: "Users", icon: ShieldCheck, permission: "canManageUsers" },
];

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

function isPathAllowed(pathname: string, allowedRoutes: string[]) {
  const normalizedPath = pathname === "/dashboard/" ? "/dashboard" : pathname;

  return allowedRoutes.some((route) => {
    if (route === "/dashboard") return normalizedPath === "/dashboard";
    return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
  });
}

function DashboardScreen({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f2eb] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#ded7c9] bg-white p-8 text-center shadow-[0_22px_80px_-56px_rgba(36,33,29,0.55)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7133]">
          Dashboard
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-none text-zinc-950">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">{description}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleRequestError = useCallback((error: unknown, redirectOnAuth = true) => {
    if (error instanceof ApiError && error.status === 401) {
      setAuthToken(null);
      if (redirectOnAuth) redirectToLogin();
      return;
    }

    setApiError(error instanceof Error ? error.message : "Request failed");
  }, []);

  const loadDashboard = useCallback(
    async ({ redirectOnAuth = true }: { redirectOnAuth?: boolean } = {}) => {
      setLoading(true);
      try {
        const payload = await getDashboard();
        setData(payload);
        setApiError(null);
      } catch (error) {
        handleRequestError(error, redirectOnAuth);
      } finally {
        setLoading(false);
      }
    },
    [handleRequestError],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const runMutation = useCallback(
    async (action: () => Promise<DashboardData>) => {
      setSaving(true);
      setApiError(null);
      try {
        const payload = await action();
        setData(payload);
        return true;
      } catch (error) {
        handleRequestError(error);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [handleRequestError],
  );

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Clear local auth state even if the backend session is already gone.
    } finally {
      setAuthToken(null);
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  }, []);

  const value = useMemo(
    () =>
      data
        ? {
            data,
            viewer: data.viewer,
            loading,
            saving,
            apiError,
            search,
            setSearch,
            runMutation,
            signOut,
            reload: () => loadDashboard({ redirectOnAuth: true }),
          }
        : null,
    [apiError, data, loading, loadDashboard, runMutation, saving, search, signOut],
  );

  if (loading && !data) {
    return (
      <DashboardScreen
        title="Po ngarkohet dashboard-i"
        description="Po verifikohet sesioni dhe po merren te dhenat e projektit."
      />
    );
  }

  if (!data) {
    return (
      <DashboardScreen
        title="Nuk u ngarkua dashboard-i"
        description={apiError ?? "Serveri nuk ktheu te dhena. Provoje perseri."}
        action={
          <button
            type="button"
            onClick={() => void loadDashboard({ redirectOnAuth: true })}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#26231f] px-4 text-sm font-semibold text-white transition hover:bg-[#3a342d]"
          >
            Provo perseri
          </button>
        }
      />
    );
  }

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
  const { apiError, data, search, setSearch, signOut, viewer } = useDashboard();
  const visibleNavItems = navItems.filter((item) => viewer.permissions[item.permission]);
  const pathAllowed = isPathAllowed(pathname, viewer.allowedRoutes);

  useEffect(() => {
    window.localStorage.setItem("dashboard-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!pathAllowed && typeof window !== "undefined") {
      window.location.replace(viewer.homeRoute);
    }
  }, [pathAllowed, viewer.homeRoute]);

  if (!pathAllowed) {
    return (
      <DashboardScreen
        title="Po ridrejtohesh"
        description="Ky perdorues nuk ka qasje ne kete faqe. Po te dergojme te seksioni i lejuar."
      />
    );
  }

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
          {visibleNavItems.map((item) => {
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

        <div className="border-t border-[#ded7c9] p-3">
          <div
            className={`rounded-md border border-[#e8e2d8] bg-white p-3 ${collapsed ? "lg:px-2" : ""}`}
          >
            <p
              className={`truncate text-sm font-semibold text-zinc-950 ${collapsed ? "lg:hidden" : ""}`}
            >
              {viewer.user.fullName}
            </p>
            <p className={`mt-1 truncate text-xs text-zinc-500 ${collapsed ? "lg:hidden" : ""}`}>
              {viewer.user.email}
            </p>
            <div className={`mt-3 flex items-center gap-2 ${collapsed ? "lg:justify-center" : ""}`}>
              <span
                className={`inline-flex rounded-full border border-[#d9c7a8] bg-[#fbf6eb] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7b5a16] ${collapsed ? "lg:hidden" : ""}`}
              >
                {viewer.user.role === "super_admin" ? "Super Admin" : "Sales"}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex size-9 items-center justify-center rounded-md border border-[#ded7c9] text-zinc-600 transition hover:bg-[#f8f4ec] hover:text-zinc-950"
                aria-label="Dil"
                title="Dil"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
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
                placeholder={
                  viewer.user.role === "sales" ? "Kerko ne banesa" : "Kerko ne dashboard"
                }
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
