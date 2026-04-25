import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CircleDollarSign, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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
  chartColors,
  formatMoney,
  formatMonth,
} from "@/components/dashboard/dashboard-ui";

export const Route = createFileRoute("/dashboard/charts")({
  component: ChartsPage,
});

function ChartsPage() {
  const { data } = useDashboard();
  const categoryTotals = data.analytics.expensesByCategory.filter((item) => item.total > 0);

  return (
    <>
      <PageIntro
        eyebrow="Analitika"
        title="Charts qe tregojne ku po shkojne parate."
        description="Krahasim mujor i pagesave, shpenzimeve dhe kategorive kryesore."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <PanelHeader
            eyebrow="Category mix"
            title="Shpenzime sipas kategorise"
            icon={CircleDollarSign}
          />
          <div className="grid gap-6 p-5 lg:grid-cols-[320px_1fr] lg:items-center">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    dataKey="total"
                    nameKey="categoryName"
                    innerRadius={82}
                    outerRadius={124}
                    paddingAngle={5}
                    cornerRadius={5}
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={entry.categoryId} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryTotals.map((item, index) => (
                <div
                  key={item.categoryId}
                  className="rounded-md border border-[#ebe3d6] bg-[#fbfaf7] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-medium capitalize">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      {item.categoryName}
                    </span>
                    <span className="font-semibold tabular-nums">{formatMoney(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Monthly burn" title="Shpenzimet mujore" icon={BarChart3} />
          <div className="h-[420px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.analytics.monthlyCashflow} barCategoryGap="28%">
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
                <Bar dataKey="expenses" name="Shpenzime" fill="#d96f52" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <Panel>
        <PanelHeader eyebrow="Trend line" title="Pagesa kundrejt shpenzimeve" icon={TrendingUp} />
        <div className="h-[420px] p-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.analytics.monthlyCashflow}>
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
              <Line
                type="monotone"
                dataKey="payments"
                name="Pagesa"
                stroke="#2f7d61"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2f7d61", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Shpenzime"
                stroke="#d96f52"
                strokeWidth={3}
                dot={{ r: 4, fill: "#d96f52", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
