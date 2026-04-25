import { createFileRoute } from "@tanstack/react-router";
import { Activity, Building2, Camera, CreditCard, Receipt } from "lucide-react";
import { useMemo, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import {
  Badge,
  DataCell,
  DataTable,
  DataTableRow,
  EmptyState,
  PageIntro,
  Panel,
  PanelHeader,
  formatDateTime,
} from "@/components/dashboard/dashboard-ui";

export const Route = createFileRoute("/dashboard/audit")({
  component: AuditPage,
});

const entityLabels: Record<string, string> = {
  invoice: "Fature",
  apartment: "Banese",
  payment: "Pagese",
  payment_schedule: "Afat pagese",
  construction_photo: "Foto progresi",
  client: "Klient",
};

function AuditPage() {
  const { data, search } = useDashboard();
  const [entity, setEntity] = useState("all");

  const entityTypes = useMemo(() => {
    return [...new Set(data.activityLogs.map((item) => item.entityType))].sort();
  }, [data.activityLogs]);

  const logs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.activityLogs.filter((item) => {
      const matchesEntity = entity === "all" || item.entityType === entity;
      const matchesSearch =
        !needle ||
        [item.entityType, item.action, item.description, item.createdAt]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesEntity && matchesSearch;
    });
  }, [data.activityLogs, entity, search]);

  const columns = [
    { label: "Tipi", width: "170px" },
    { label: "Veprimi", width: "170px" },
    { label: "Pershkrimi", width: "minmax(280px,1fr)" },
    { label: "Koha", width: "180px" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Audit logs"
        title="Ndryshimet dhe aktiviteti."
        description="Cdo veprim kryesor i projektit, i ndare nga overview dhe modulet operative."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <AuditMetric label="Total logs" value={String(data.activityLogs.length)} />
        <AuditMetric
          label="Fatura"
          value={String(data.activityLogs.filter((item) => item.entityType === "invoice").length)}
        />
        <AuditMetric
          label="Pagesa"
          value={String(data.activityLogs.filter((item) => item.entityType === "payment").length)}
        />
        <AuditMetric
          label="Banesa"
          value={String(data.activityLogs.filter((item) => item.entityType === "apartment").length)}
        />
      </section>

      <Panel>
        <PanelHeader
          eyebrow="Change history"
          title="Audit trail"
          icon={Activity}
          badge={`${logs.length} logs`}
        />
        <div className="border-b border-[#e8e2d8] bg-white px-5 py-4 md:px-6">
          <select
            value={entity}
            onChange={(event) => setEntity(event.target.value)}
            className="h-10 w-full rounded-md border border-[#ded7c9] bg-white px-3 text-sm outline-none transition focus:border-[#b48a47] focus:ring-2 focus:ring-[#b48a47]/20 sm:max-w-xs"
          >
            <option value="all">Te gjitha ndryshimet</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {entityLabels[type] ?? type}
              </option>
            ))}
          </select>
        </div>

        <DataTable columns={columns} minWidth="860px" rowCount={logs.length} itemLabel="logs">
          {logs.map((item) => {
            const Icon = iconForEntity(item.entityType);
            return (
              <DataTableRow key={item.id} columns={columns}>
                <DataCell label="Tipi">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-md bg-[#24211d] text-[#d2b36b]">
                      <Icon className="size-4" />
                    </span>
                    <Badge>{entityLabels[item.entityType] ?? item.entityType}</Badge>
                  </span>
                </DataCell>
                <DataCell label="Veprimi">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {item.action.replaceAll("_", " ")}
                  </span>
                </DataCell>
                <DataCell label="Pershkrimi">
                  <p className="text-sm font-medium text-zinc-950">{item.description}</p>
                </DataCell>
                <DataCell label="Koha">
                  <p className="text-sm text-zinc-500">{formatDateTime(item.createdAt)}</p>
                </DataCell>
              </DataTableRow>
            );
          })}
          {!logs.length && <EmptyState label="Nuk ka audit logs per filtrin aktual." />}
        </DataTable>
      </Panel>
    </>
  );
}

function AuditMetric({ label, value }: { label: string; value: string }) {
  return (
    <Panel className="p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-950">{value}</p>
    </Panel>
  );
}

function iconForEntity(entityType: string) {
  if (entityType.includes("invoice")) return Receipt;
  if (entityType.includes("payment")) return CreditCard;
  if (entityType.includes("photo")) return Camera;
  if (entityType.includes("apartment")) return Building2;
  return Activity;
}
