import { createFileRoute } from "@tanstack/react-router";
import { Grid2X2, Layers3, List, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { ApartmentForm } from "@/components/dashboard/dashboard-forms";
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
  SegmentedControl,
  ShapePill,
  StatusPill,
  TableIdentity,
  floorTileClass,
  formatMoney,
  layoutShapeLabels,
  shapeGlyphClass,
  statusColors,
  statusLabels,
} from "@/components/dashboard/dashboard-ui";
import { createApartment, updateApartment } from "@/lib/dashboard-api";
import type { Apartment, ApartmentLayoutShape, ApartmentStatus } from "@/lib/dashboard-types";

export const Route = createFileRoute("/dashboard/apartments")({
  component: ApartmentsPage,
});

function ApartmentsPage() {
  const { data, search, saving, runMutation, viewer } = useDashboard();
  const [status, setStatus] = useState<ApartmentStatus | "all">("all");
  const [floor, setFloor] = useState<number | "all">("all");
  const [shape, setShape] = useState<ApartmentLayoutShape | "all">("all");
  const [view, setView] = useState<"inventory" | "visual">("inventory");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Apartment | null>(null);

  const apartments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.apartments.filter((apartment) => {
      const matchesStatus = status === "all" || apartment.status === status;
      const matchesFloor = floor === "all" || apartment.floor === floor;
      const matchesShape = shape === "all" || apartment.layoutShape === shape;
      const matchesSearch =
        !needle ||
        [
          apartment.code,
          apartment.description,
          apartment.status,
          apartment.layoutShape,
          String(apartment.floor),
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesFloor && matchesShape && matchesSearch;
    });
  }, [data.apartments, floor, search, shape, status]);

  const floors = [...new Set(data.apartments.map((apartment) => apartment.floor))].sort(
    (a, b) => b - a,
  );

  const visibleFloors = floor === "all" ? floors : floors.filter((item) => item === floor);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(apartment: Apartment) {
    setEditing(apartment);
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
    { label: "Banesa", width: "minmax(180px,1fr)" },
    { label: "Kati", width: "90px" },
    { label: "Forma", width: "150px" },
    { label: "Statusi", width: "150px" },
    { label: "Siperfaqja", width: "120px" },
    { label: "Cmimi", width: "150px" },
    { label: "Veprime", width: "76px" },
  ];

  const statusOptions = [
    { value: "all" as const, label: "Te gjitha" },
    { value: "available" as const, label: "Te lira" },
    { value: "reserved" as const, label: "Rezervuar" },
    { value: "sold" as const, label: "Shitura" },
  ];

  const viewOptions = [
    { value: "inventory" as const, label: "Tabela" },
    { value: "visual" as const, label: "Grid" },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Banesat"
        title="Inventar i lexueshem dhe vizual."
        description="Kodi, kati, siperfaqja, cmimi dhe statusi per secilen banese."
        action={
          viewer.permissions.canCreateApartments ? (
            <ActionButton icon={Plus} label="Shto banese" onClick={openNew} />
          ) : undefined
        }
      />

      <Panel>
        <PanelHeader
          eyebrow="Inventory"
          title="Banesat sipas kateve"
          icon={view === "visual" ? Grid2X2 : List}
          badge={`${apartments.length} banesa`}
          action={<SegmentedControl value={view} options={viewOptions} onChange={setView} />}
        />
        <div className="grid gap-3 border-b border-[#e8e2d8] bg-white px-5 py-4 md:px-6 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <SegmentedControl value={status} options={statusOptions} onChange={setStatus} />
          <select
            value={floor}
            onChange={(event) =>
              setFloor(event.target.value === "all" ? "all" : Number(event.target.value))
            }
            className="h-10 w-full min-w-0 rounded-md border border-[#d8d2c6] bg-white px-3 text-sm outline-none transition focus:border-[#8f6a2e] focus:ring-2 focus:ring-[#8f6a2e]/15"
          >
            <option value="all">Te gjitha katet</option>
            {floors.map((item) => (
              <option key={item} value={item}>
                Kati {item}
              </option>
            ))}
          </select>
          <select
            value={shape}
            onChange={(event) => setShape(event.target.value as ApartmentLayoutShape | "all")}
            className="h-10 w-full min-w-0 rounded-md border border-[#d8d2c6] bg-white px-3 text-sm outline-none transition focus:border-[#8f6a2e] focus:ring-2 focus:ring-[#8f6a2e]/15"
          >
            <option value="all">Te gjitha format</option>
            {(Object.keys(layoutShapeLabels) as ApartmentLayoutShape[]).map((item) => (
              <option key={item} value={item}>
                {layoutShapeLabels[item]}
              </option>
            ))}
          </select>
        </div>

        {view === "visual" ? (
          <div className="space-y-5 p-4">
            {visibleFloors.map((floorNumber) => {
              const floorApartments = apartments.filter(
                (apartment) => apartment.floor === floorNumber,
              );
              if (!floorApartments.length) return null;

              return (
                <div
                  key={floorNumber}
                  className="grid gap-3 rounded-lg border border-[#ebe3d6] bg-[#fbfaf7] p-3 lg:grid-cols-[96px_1fr]"
                >
                  <div className="flex items-center justify-between gap-3 lg:block">
                    <div className="flex size-14 items-center justify-center rounded-md bg-[#24211d] text-white">
                      <Layers3 className="size-5 text-[#d2b36b]" />
                    </div>
                    <div className="lg:mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Kati
                      </p>
                      <p className="font-serif text-4xl leading-none text-zinc-950">
                        {floorNumber}
                      </p>
                    </div>
                  </div>
                  <div className="grid auto-rows-[96px] grid-cols-2 gap-2 sm:grid-cols-6">
                    {floorApartments.map((apartment) => (
                      <button
                        key={apartment.id}
                        type="button"
                        onClick={() => {
                          if (viewer.permissions.canEditApartments) openEdit(apartment);
                        }}
                        className={`group relative min-w-0 overflow-hidden rounded-md border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-30px_rgba(41,37,32,0.7)] ${floorTileClass(apartment.layoutShape)} ${statusColors[apartment.status]}`}
                      >
                        <span
                          className={`absolute right-3 top-3 h-8 w-10 border border-current opacity-35 ${shapeGlyphClass(apartment.layoutShape)}`}
                        />
                        <span className="relative block text-sm font-bold text-zinc-950">
                          {apartment.code}
                        </span>
                        <span className="relative mt-2 block text-xs font-medium opacity-75">
                          {layoutShapeLabels[apartment.layoutShape]} · {apartment.area} m2
                        </span>
                        <span className="relative mt-3 inline-flex rounded-full bg-white/65 px-2 py-1 text-[11px] font-semibold">
                          {statusLabels[apartment.status]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {!apartments.length && <EmptyState label="Nuk ka banesa per filtrat aktuale." />}
          </div>
        ) : (
          <DataTable
            columns={columns}
            minWidth="1010px"
            rowCount={apartments.length}
            itemLabel="banesa"
          >
            {apartments.map((apartment) => (
              <DataTableRow key={apartment.id} columns={columns}>
                <DataCell label="Banesa">
                  <TableIdentity
                    title={apartment.code}
                    subtitle={apartment.description}
                    initials={String(apartment.floor)}
                  />
                </DataCell>
                <DataCell label="Kati">
                  <p className="font-semibold tabular-nums">{apartment.floor}</p>
                </DataCell>
                <DataCell label="Forma">
                  <ShapePill shape={apartment.layoutShape} />
                </DataCell>
                <DataCell label="Statusi">
                  <StatusPill status={apartment.status} />
                </DataCell>
                <DataCell label="Siperfaqja">
                  <p className="font-semibold tabular-nums">{apartment.area} m2</p>
                </DataCell>
                <DataCell label="Cmimi">
                  <p className="font-semibold tabular-nums">{formatMoney(apartment.price)}</p>
                </DataCell>
                <DataCell label="Veprime">
                  {viewer.permissions.canEditApartments ? (
                    <div className="flex justify-start">
                      <IconButton icon={Pencil} label="Edito" onClick={() => openEdit(apartment)} />
                    </div>
                  ) : null}
                </DataCell>
              </DataTableRow>
            ))}
            {!apartments.length && <EmptyState label="Nuk ka banesa per filtrat aktuale." />}
          </DataTable>
        )}
      </Panel>

      <DashboardModal
        title={editing ? "Edito banesen" : "Shto banese"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <ApartmentForm
          initial={editing}
          saving={saving}
          onSubmit={(payload) =>
            void closeAfter(() =>
              runMutation(() =>
                editing ? updateApartment(editing.id, payload) : createApartment(payload),
              ),
            )
          }
        />
      </DashboardModal>
    </>
  );
}
