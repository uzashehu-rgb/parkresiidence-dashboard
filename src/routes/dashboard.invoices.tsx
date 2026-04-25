import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Filter, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { InvoiceForm } from "@/components/dashboard/dashboard-forms";
import {
  ActionButton,
  Badge,
  DataCell,
  DataTable,
  DataTableRow,
  DashboardModal,
  EmptyState,
  IconButton,
  PageIntro,
  Panel,
  PanelHeader,
  TableIdentity,
  chartColors,
  fieldClass,
  formatDate,
  formatMoney,
  formatMonth,
} from "@/components/dashboard/dashboard-ui";
import { createInvoice, deleteInvoice, updateInvoice } from "@/lib/dashboard-api";
import type { Invoice } from "@/lib/dashboard-types";

export const Route = createFileRoute("/dashboard/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const { data, search, saving, runMutation } = useDashboard();
  const [category, setCategory] = useState("all");
  const [month, setMonth] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);

  const months = useMemo(() => {
    return [...new Set(data.invoices.map((invoice) => invoice.invoiceDate.slice(0, 7)))].sort();
  }, [data.invoices]);

  const invoices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.invoices.filter((invoice) => {
      const matchesSearch =
        !needle ||
        [invoice.supplier, invoice.description, invoice.categoryName, invoice.invoiceDate]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchesCategory = category === "all" || String(invoice.categoryId) === category;
      const matchesMonth = month === "all" || invoice.invoiceDate.startsWith(month);
      const matchesStart = !start || invoice.invoiceDate >= start;
      const matchesEnd = !end || invoice.invoiceDate <= end;
      return matchesSearch && matchesCategory && matchesMonth && matchesStart && matchesEnd;
    });
  }, [category, data.invoices, end, month, search, start]);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(invoice: Invoice) {
    setEditing(invoice);
    setModalOpen(true);
  }

  async function closeAfter(action: () => Promise<boolean>) {
    const ok = await action();
    if (ok) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  const columns = [
    { label: "Furnitori", width: "minmax(240px,1.3fr)" },
    { label: "Kategoria", width: "150px" },
    { label: "Data", width: "130px" },
    { label: "Shuma", width: "150px" },
    { label: "Veprime", width: "104px" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Faturat"
        title="Shpenzime reale, te filtrueshme."
        description="Regjistri i materialeve, punes, furnitoreve dhe faturave te projektit."
        action={<ActionButton icon={Plus} label="Shto fature" onClick={openNew} />}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Panel>
          <PanelHeader
            eyebrow="Register"
            title="Lista e faturave"
            icon={Receipt}
            badge={`${invoices.length} fatura`}
          />
          <div className="grid gap-3 border-b border-[#e8e2d8] bg-white px-5 py-4 md:grid-cols-2 md:px-6 xl:grid-cols-4">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`${fieldClass} appearance-none pl-10`}
              >
                <option value="all">Te gjitha kategorite</option>
                {data.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className={`${fieldClass} appearance-none pl-10`}
              >
                <option value="all">Te gjithe muajt</option>
                {months.map((item) => (
                  <option key={item} value={item}>
                    {formatMonth(item)}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={fieldClass}
            />
            <input
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className={fieldClass}
            />
          </div>

          <DataTable
            columns={columns}
            minWidth="820px"
            rowCount={invoices.length}
            itemLabel="fatura"
          >
            {invoices.map((invoice) => (
              <DataTableRow key={invoice.id} columns={columns}>
                <DataCell label="Furnitori">
                  <TableIdentity title={invoice.supplier} subtitle={invoice.description} />
                </DataCell>
                <DataCell label="Kategoria">
                  <Badge>{invoice.categoryName}</Badge>
                </DataCell>
                <DataCell label="Data">
                  <span className="text-sm text-zinc-600">{formatDate(invoice.invoiceDate)}</span>
                </DataCell>
                <DataCell label="Shuma">
                  <span className="font-semibold tabular-nums text-zinc-950">
                    {formatMoney(invoice.amount)}
                  </span>
                </DataCell>
                <DataCell label="Veprime">
                  <div className="flex justify-start gap-1">
                    <IconButton icon={Pencil} label="Edito" onClick={() => openEdit(invoice)} />
                    <IconButton
                      icon={Trash2}
                      label="Fshi"
                      danger
                      onClick={() => void runMutation(() => deleteInvoice(invoice.id))}
                    />
                  </div>
                </DataCell>
              </DataTableRow>
            ))}
            {!invoices.length && <EmptyState label="Nuk ka fatura per filtrat aktuale." />}
          </DataTable>
        </Panel>

        <Panel className="h-fit">
          <PanelHeader eyebrow="Totals" title="Sipas kategorise" />
          <div className="space-y-3 p-4">
            {data.analytics.expensesByCategory.map((item, index) => (
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
        </Panel>
      </section>

      <DashboardModal
        title={editing ? "Edito faturen" : "Shto fature"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <InvoiceForm
          categories={data.categories}
          initial={editing}
          saving={saving}
          onSubmit={(payload) =>
            void closeAfter(() =>
              runMutation(() =>
                editing ? updateInvoice(editing.id, payload) : createInvoice(payload),
              ),
            )
          }
        />
      </DashboardModal>
    </>
  );
}
