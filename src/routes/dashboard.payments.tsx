import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { PaymentForm } from "@/components/dashboard/dashboard-forms";
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
  formatDate,
  formatMoney,
} from "@/components/dashboard/dashboard-ui";
import { createPayment, deletePayment, updatePayment } from "@/lib/dashboard-api";
import type { Payment } from "@/lib/dashboard-types";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const { data, search, saving, runMutation } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const payments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.payments.filter((payment) => {
      if (!needle) return true;
      return [
        payment.clientName,
        payment.apartmentCode,
        payment.paymentMethod,
        payment.note,
        payment.paymentDate,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [data.payments, search]);

  async function closeAfter(action: () => Promise<boolean>) {
    const ok = await action();
    if (ok) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(payment: Payment) {
    setEditing(payment);
    setModalOpen(true);
  }

  const paymentColumns = [
    { label: "Klienti", width: "minmax(170px,1fr)" },
    { label: "Banesa", width: "80px" },
    { label: "Data", width: "104px" },
    { label: "Metoda", width: "88px" },
    { label: "Shuma", width: "104px" },
    { label: "Veprime", width: "88px" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Pagesat"
        title="Pagesa, kestet dhe borxhet."
        description="Historiku i arketimeve, afatet dhe klientet me balance te hapur."
        action={<ActionButton icon={Plus} label="Regjistro pagese" onClick={openNew} />}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel>
          <PanelHeader
            eyebrow="History"
            title="Historiku i pagesave"
            icon={CreditCard}
            badge={`${payments.length} pagesa`}
          />
          <DataTable
            columns={paymentColumns}
            minWidth="660px"
            rowCount={payments.length}
            itemLabel="pagesa"
          >
            {payments.map((payment) => (
              <DataTableRow key={payment.id} columns={paymentColumns}>
                <DataCell label="Klienti">
                  <TableIdentity
                    title={payment.clientName}
                    subtitle={payment.note || payment.paymentMethod}
                  />
                </DataCell>
                <DataCell label="Banesa">
                  <p className="text-sm font-medium">{payment.apartmentCode}</p>
                </DataCell>
                <DataCell label="Data">
                  <p className="text-sm text-zinc-600">{formatDate(payment.paymentDate)}</p>
                </DataCell>
                <DataCell label="Metoda">
                  <Badge>{payment.paymentMethod}</Badge>
                </DataCell>
                <DataCell label="Shuma">
                  <p className="font-semibold tabular-nums">{formatMoney(payment.amount)}</p>
                </DataCell>
                <DataCell label="Veprime">
                  <div className="flex gap-1">
                    <IconButton icon={Pencil} label="Edito" onClick={() => openEdit(payment)} />
                    <IconButton
                      icon={Trash2}
                      label="Fshi"
                      danger
                      onClick={() => void runMutation(() => deletePayment(payment.id))}
                    />
                  </div>
                </DataCell>
              </DataTableRow>
            ))}
            {!payments.length && <EmptyState label="Nuk ka pagesa per kerkimin aktual." />}
          </DataTable>
        </Panel>

        <div className="grid h-fit gap-6">
          <Panel>
            <PanelHeader eyebrow="Debt" title="Klientet me borxh" />
            <div className="space-y-3 p-4">
              {data.analytics.clientsWithDebt.slice(0, 6).map((client) => (
                <div
                  key={client.id}
                  className="rounded-md border border-[#ebe3d6] bg-[#fbfaf7] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{client.fullName}</p>
                      <p className="mt-1 text-xs text-zinc-500">{client.apartmentCode}</p>
                    </div>
                    <p className="font-semibold text-red-600 tabular-nums">
                      {formatMoney(client.remainingAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Schedules" title="Afatet" />
            <div className="divide-y divide-[#ebe3d6]">
              {data.paymentSchedules.slice(0, 7).map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{schedule.clientName}</p>
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
        </div>
      </section>

      <DashboardModal
        title={editing ? "Edito pagesen" : "Regjistro pagese"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <PaymentForm
          clients={data.clients}
          apartments={data.apartments}
          initial={editing}
          saving={saving}
          onSubmit={(payload) =>
            void closeAfter(() =>
              runMutation(() =>
                editing ? updatePayment(editing.id, payload) : createPayment(payload),
              ),
            )
          }
        />
      </DashboardModal>
    </>
  );
}
