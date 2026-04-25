import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, Banknote, Building2, CheckCircle2, Receipt } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import {
  MoneyTooltip,
  PageIntro,
  Panel,
  PanelHeader,
  formatDate,
  formatMoney,
  formatMonth,
} from "@/components/dashboard/dashboard-ui";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data } = useDashboard();
  const summary = data.summary;

  const kpis = [
    {
      label: "Shpenzime",
      value: formatMoney(summary.totalExpenses),
      detail: `${data.invoices.length} fatura`,
      icon: Receipt,
    },
    {
      label: "Te hyra",
      value: formatMoney(summary.totalPayments),
      detail: `${data.payments.length} pagesa`,
      icon: Banknote,
    },
    {
      label: "Diferenca",
      value: formatMoney(summary.currentProfit),
      detail: "Pagesa minus shpenzime",
      icon: Activity,
    },
    {
      label: "Banesa",
      value: String(summary.apartmentCount),
      detail: `${summary.availableApartments} te lira`,
      icon: Building2,
    },
    {
      label: "Te shitura",
      value: String(summary.soldApartments),
      detail: `${summary.reservedApartments} te rezervuara`,
      icon: CheckCircle2,
    },
    {
      label: "Me vonese",
      value: String(summary.overduePayments),
      detail: "Afate per ndjekje",
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Overview"
        title="Pamje e qarte per projektin."
        description="Gjendja financiare, inventari dhe aktiviteti i fundit ne nje ekran te qete."
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Panel key={item.label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-[#26231f] text-[#d2b36b]">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950">{item.value}</p>
              <p className="mt-2 text-sm text-zinc-500">{item.detail}</p>
            </Panel>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <PanelHeader eyebrow="Cashflow" title="Te hyra dhe shpenzime" icon={Activity} />
          <div className="h-[360px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.analytics.monthlyCashflow}>
                <defs>
                  <linearGradient id="paymentsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f7d61" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2f7d61" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d96f52" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#d96f52" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ece3d6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatMonth}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="payments"
                  name="Pagesa"
                  stroke="#2f7d61"
                  strokeWidth={3}
                  fill="url(#paymentsFill)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Shpenzime"
                  stroke="#d96f52"
                  strokeWidth={3}
                  fill="url(#expensesFill)"
                />
                <Line
                  type="monotone"
                  dataKey="payments"
                  stroke="#2f7d61"
                  strokeWidth={3}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Collection" title="Afatet me prioritet" icon={AlertTriangle} />
          <div className="divide-y divide-[#ebe3d6]">
            {data.paymentSchedules.slice(0, 8).map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {schedule.clientName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {schedule.apartmentCode} · {formatDate(schedule.dueDate)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    schedule.status === "late"
                      ? "bg-red-100 text-red-700"
                      : schedule.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#fbf4df] text-[#7b5a16]"
                  }`}
                >
                  {schedule.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {data.analytics.clientsWithDebt.slice(0, 3).map((client) => (
          <Panel key={client.id} className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Klient me borxh
            </p>
            <p className="mt-3 font-serif text-2xl leading-none">{client.fullName}</p>
            <p className="mt-2 text-sm text-zinc-500">{client.apartmentCode}</p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-2xl font-semibold text-red-600 tabular-nums">
                {formatMoney(client.remainingAmount)}
              </p>
              <p className="text-sm text-zinc-500">mbetur</p>
            </div>
          </Panel>
        ))}
      </section>
    </>
  );
}
