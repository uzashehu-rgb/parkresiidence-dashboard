import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import {
  ActionButton,
  DataCell,
  DataTable,
  DataTableRow,
  DashboardModal,
  EmptyState,
  Field,
  PageIntro,
  Panel,
  PanelHeader,
  SubmitButton,
  TableIdentity,
  fieldClass,
  formatDateTime,
} from "@/components/dashboard/dashboard-ui";
import { createUser, listUsers } from "@/lib/dashboard-api";
import type { ManagedUser } from "@/lib/dashboard-types";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    let active = true;

    listUsers()
      .then((response) => {
        if (!active) return;
        setUsers(response.users);
        setError(null);
      })
      .catch((currentError) => {
        if (!active) return;
        setError(currentError instanceof Error ? currentError.message : "Failed to load users");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await createUser({
        ...form,
        role: "sales",
      });
      setUsers(response.users);
      setModalOpen(false);
      setForm({ fullName: "", email: "", password: "" });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "User creation failed");
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { label: "Perdoruesi", width: "minmax(240px,1.1fr)" },
    { label: "Roli", width: "140px" },
    { label: "Krijuar nga", width: "170px" },
    { label: "Login i fundit", width: "180px" },
    { label: "Statusi", width: "120px" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Users"
        title="Qasje e kontrolluar per dashboard."
        description="Super admini krijon perdorues sales qe mund te hyjne vetem te banesat."
        action={<ActionButton icon={Plus} label="Shto user" onClick={() => setModalOpen(true)} />}
      />

      <Panel>
        <PanelHeader
          eyebrow="Access"
          title="Perdoruesit e sistemit"
          icon={ShieldCheck}
          badge={`${users.length} users`}
        />
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <DataTable columns={columns} minWidth="860px" rowCount={users.length} itemLabel="users">
          {users.map((user) => (
            <DataTableRow key={user.id} columns={columns}>
              <DataCell label="Perdoruesi">
                <TableIdentity
                  title={user.fullName}
                  subtitle={user.email}
                  initials={user.role === "super_admin" ? "SA" : "SL"}
                />
              </DataCell>
              <DataCell label="Roli">
                <span className="inline-flex rounded-full border border-[#d9c7a8] bg-[#fbf6eb] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#7b5a16]">
                  {user.role === "super_admin" ? "Super Admin" : "Sales"}
                </span>
              </DataCell>
              <DataCell label="Krijuar nga">
                <span className="text-sm text-zinc-600">{user.createdByName ?? "-"}</span>
              </DataCell>
              <DataCell label="Login i fundit">
                <span className="text-sm text-zinc-600">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Asnjehere"}
                </span>
              </DataCell>
              <DataCell label="Statusi">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.isActive ? "Aktiv" : "Jo aktiv"}
                </span>
              </DataCell>
            </DataTableRow>
          ))}
          {!users.length && !loading && <EmptyState label="Nuk ka ende users te regjistruar." />}
          {loading && <EmptyState label="Po ngarkohen users..." />}
        </DataTable>
      </Panel>

      <DashboardModal title="Shto user sales" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <Field label="Emri i plote">
            <input
              required
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
              className={fieldClass}
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className={fieldClass}
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              minLength={10}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className={fieldClass}
            />
          </Field>
          <Field label="Roli">
            <div className="flex h-11 items-center gap-3 rounded-md border border-[#d8d2c6] bg-[#fbfaf7] px-3 text-sm text-zinc-700">
              <UserRound className="size-4 text-[#9a7133]" />
              Sales
            </div>
          </Field>
          <div className="rounded-md border border-[#e8e2d8] bg-[#fbfaf7] px-4 py-3 text-sm text-zinc-600">
            Ky user do te kete qasje vetem te seksioni i banesave.
          </div>
          <SubmitButton saving={saving} label="Krijo user" />
        </form>
      </DashboardModal>
    </>
  );
}
