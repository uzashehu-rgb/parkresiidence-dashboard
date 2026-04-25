import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { ClientForm } from "@/components/dashboard/dashboard-forms";
import {
  ActionButton,
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
  formatMoney,
} from "@/components/dashboard/dashboard-ui";
import { createClient, deleteClient, updateClient } from "@/lib/dashboard-api";
import type { Client } from "@/lib/dashboard-types";

export const Route = createFileRoute("/dashboard/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const { data, search, saving, runMutation } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const clients = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.clients.filter((client) => {
      if (!needle) return true;
      return [client.fullName, client.phone, client.email, client.apartmentCode, client.notes]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [data.clients, search]);

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

  function openEdit(client: Client) {
    setEditing(client);
    setModalOpen(true);
  }

  const columns = [
    { label: "Klienti", width: "minmax(240px,1.2fr)" },
    { label: "Banesa", width: "130px" },
    { label: "Kontrata", width: "150px" },
    { label: "Paguar", width: "150px" },
    { label: "Mbetur", width: "150px" },
    { label: "Veprime", width: "104px" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Klientet"
        title="Klientet dhe lidhjet me banesa."
        description="Kontaktet, kontratat aktive dhe balanca e mbetur per secilin klient."
        action={<ActionButton icon={Plus} label="Shto klient" onClick={openNew} />}
      />

      <Panel>
        <PanelHeader
          eyebrow="Directory"
          title="Lista e klienteve"
          icon={Users}
          badge={`${clients.length} kliente`}
        />
        <DataTable columns={columns} minWidth="850px" rowCount={clients.length} itemLabel="kliente">
          {clients.map((client) => (
            <DataTableRow key={client.id} columns={columns}>
              <DataCell label="Klienti">
                <TableIdentity
                  title={client.fullName}
                  subtitle={`${client.phone} · ${client.email || "pa email"}`}
                />
              </DataCell>
              <DataCell label="Banesa">
                <p className="mt-1 text-sm font-medium">{client.apartmentCode ?? "Pa lidhje"}</p>
              </DataCell>
              <DataCell label="Kontrata">
                <p className="font-semibold tabular-nums">
                  {client.contractPrice ? formatMoney(client.contractPrice) : "-"}
                </p>
              </DataCell>
              <DataCell label="Paguar">
                <p className="font-semibold tabular-nums">{formatMoney(client.paidAmount)}</p>
              </DataCell>
              <DataCell label="Mbetur">
                <p className="font-semibold tabular-nums text-red-600">
                  {client.remainingAmount ? formatMoney(client.remainingAmount) : "-"}
                </p>
              </DataCell>
              <DataCell label="Veprime">
                <div className="flex gap-1">
                  <IconButton icon={Pencil} label="Edito" onClick={() => openEdit(client)} />
                  <IconButton
                    icon={Trash2}
                    label="Fshi"
                    danger
                    onClick={() => void runMutation(() => deleteClient(client.id))}
                  />
                </div>
              </DataCell>
            </DataTableRow>
          ))}
          {!clients.length && <EmptyState label="Nuk ka kliente per kerkimin aktual." />}
        </DataTable>
      </Panel>

      <DashboardModal
        title={editing ? "Edito klientin" : "Shto klient"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <ClientForm
          apartments={data.apartments}
          initial={editing}
          saving={saving}
          onSubmit={(payload) =>
            void closeAfter(() =>
              runMutation(() =>
                editing ? updateClient(editing.id, payload) : createClient(payload),
              ),
            )
          }
        />
      </DashboardModal>
    </>
  );
}
