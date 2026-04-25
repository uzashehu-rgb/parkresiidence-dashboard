import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { ApartmentLayoutShape, ApartmentStatus } from "@/lib/dashboard-types";

export const statusLabels: Record<ApartmentStatus, string> = {
  available: "E lire",
  reserved: "E rezervuar",
  sold: "E shitur",
};

export const statusColors: Record<ApartmentStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  reserved: "border-[#d8bd7d] bg-[#fbf4df] text-[#7b5a16]",
  sold: "border-zinc-300 bg-zinc-100 text-zinc-700",
};

export const statusDots: Record<ApartmentStatus, string> = {
  available: "bg-emerald-500",
  reserved: "bg-[#c69c58]",
  sold: "bg-zinc-500",
};

export const layoutShapeLabels: Record<ApartmentLayoutShape, string> = {
  standard: "Standard",
  corner: "Kendore",
  studio: "Studio",
  penthouse: "Penthouse",
};

export const layoutShapeDescriptions: Record<ApartmentLayoutShape, string> = {
  standard: "Plan i balancuar",
  corner: "Cep me drite",
  studio: "Kompakte",
  penthouse: "Premium",
};

export const chartColors = ["#1f7a5c", "#bd8b3a", "#ca5f47", "#2e6b8f", "#6c587a"];

export const fieldClass =
  "h-11 w-full rounded-md border border-[#d8d2c6] bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#8f6a2e] focus:ring-2 focus:ring-[#8f6a2e]/15";

const moneyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number) {
  return moneyFormatter.format(value || 0);
}

export function formatDate(value: string) {
  const text = String(value).slice(0, 10);
  const [year, month, day] = text.split("-");
  if (!year || !month || !day) return text;
  return `${day}.${month}.${year}`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMonth(value: string) {
  const [year, month] = String(value).split("-");
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const index = Number(month) - 1;
  return `${labels[index] ?? month} ${year}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-5 border-b border-[#ded7c9] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7133]">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-full break-words font-serif text-3xl leading-[1.02] text-zinc-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[20rem] text-sm leading-6 text-zinc-600 sm:max-w-2xl">
          {description}
        </p>
      </div>
      {action && (
        <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">{action}</div>
      )}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-lg border border-[#e4dfd5] bg-white shadow-[0_18px_70px_-56px_rgba(41,37,32,0.55)] ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  icon: Icon,
  badge,
  action,
}: {
  eyebrow: string;
  title: string;
  icon?: LucideIcon;
  badge?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative flex flex-col gap-4 border-b border-[#e8e2d8] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#e8e2d8] bg-[#fbfaf7] text-[#9a7133]">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold leading-6 text-zinc-950">{title}</h2>
            {badge && (
              <span className="inline-flex rounded-full border border-[#d9c7a8] bg-[#fbf6eb] px-2 py-0.5 text-xs font-medium text-[#7b5a16]">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#9a7133]">
            {eyebrow}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "dark",
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "dark" | "light";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition ${
        variant === "dark"
          ? "bg-[#24211d] text-white shadow-[0_12px_28px_-18px_rgba(36,33,29,0.9)] hover:bg-[#373029]"
          : "border border-[#ded7c9] bg-white text-zinc-700 hover:bg-[#f8f4ec]"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-md transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-zinc-500 hover:bg-[#f8f4ec] hover:text-zinc-900"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-[#d9c7a8] bg-[#fbf6eb] px-2.5 py-1 text-xs font-medium capitalize text-[#7b5a16]">
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: ApartmentStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColors[status]}`}
    >
      <span className={`size-1.5 rounded-full ${statusDots[status]}`} />
      {statusLabels[status]}
    </span>
  );
}

export function TableIdentity({
  title,
  subtitle,
  initials,
}: {
  title: string;
  subtitle?: ReactNode;
  initials?: string;
}) {
  const fallback = title
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#24211d] text-xs font-semibold text-[#d2b36b] ring-1 ring-[#24211d]/10">
        {initials ?? fallback}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-zinc-950">{title}</span>
        {subtitle && <span className="mt-1 block truncate text-sm text-zinc-500">{subtitle}</span>}
      </span>
    </div>
  );
}

export function ShapePill({ shape }: { shape: ApartmentLayoutShape }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d6d0c4] bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
      <span className={`block size-3 border border-current ${shapeGlyphClass(shape)}`} />
      {layoutShapeLabels[shape]}
    </span>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <div className="p-8 text-center text-sm text-zinc-500">{label}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      {children}
    </label>
  );
}

export function SubmitButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-11 items-center justify-center rounded-md bg-[#26231f] px-4 text-sm font-semibold text-white transition hover:bg-[#3a342d] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? "Duke ruajtur..." : label}
    </button>
  );
}

export function DashboardModal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/55 backdrop-blur-sm"
      />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#ded7c9] bg-[#fbfaf7] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#ded7c9] pb-4">
          <h2 className="font-serif text-3xl leading-none text-zinc-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md border border-[#ded7c9] text-zinc-600 hover:bg-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="pt-5">{children}</div>
      </div>
    </div>
  );
}

export function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-[#ded7c9] bg-white px-3 py-2 shadow-xl">
      {label && <p className="mb-1 text-xs font-medium text-zinc-500">{formatMonth(label)}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-5 text-sm">
            <span className="flex items-center gap-2 text-zinc-600">
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums">{formatMoney(Number(entry.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TableColumn = {
  label: string;
  width: string;
};

export function DataTable({
  columns,
  children,
  minWidth = "760px",
  rowCount,
  itemLabel = "rekorde",
}: {
  columns: TableColumn[];
  children: ReactNode;
  minWidth?: string;
  rowCount?: number;
  itemLabel?: string;
}) {
  const template = columns.map((column) => column.width).join(" ");
  const tableStyle = {
    "--table-grid": template,
    "--table-min-width": minWidth,
  } as CSSProperties;
  const hasFooter = typeof rowCount === "number";
  const visibleFrom = rowCount ? 1 : 0;
  const visibleTo = rowCount ?? 0;

  return (
    <div className="max-w-full overflow-x-auto bg-white">
      <div className="min-w-0 lg:min-w-[var(--table-min-width)]" style={tableStyle}>
        <div className="hidden min-h-11 border-b border-[#e8e2d8] bg-[#fbfaf7] px-5 text-left text-xs font-medium text-zinc-500 lg:grid lg:grid-cols-[var(--table-grid)] lg:items-center md:px-6">
          {columns.map((column) => (
            <div key={column.label} className="truncate pr-4">
              {column.label}
            </div>
          ))}
        </div>
        <div className="divide-y divide-[#ede7de] max-lg:divide-y-0 max-lg:bg-[#fbfaf7]">
          {children}
        </div>
        {hasFooter && (
          <div className="flex flex-col gap-3 border-t border-[#e8e2d8] bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <p className="text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">
                {visibleFrom}-{visibleTo}
              </span>{" "}
              nga {rowCount} {itemLabel}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="inline-flex size-9 items-center justify-center rounded-md border border-[#e1dbd0] text-zinc-300"
                aria-label="Faqja paraprake"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-md bg-[#24211d] text-sm font-semibold text-white"
                aria-label="Faqja 1"
              >
                1
              </button>
              <button
                type="button"
                disabled
                className="inline-flex size-9 items-center justify-center rounded-md border border-[#e1dbd0] text-zinc-300"
                aria-label="Faqja tjeter"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTableRow({
  columns,
  children,
  className = "",
}: {
  columns: TableColumn[];
  children: ReactNode;
  className?: string;
}) {
  const template = columns.map((column) => column.width).join(" ");

  return (
    <div
      className={`grid min-h-[72px] grid-cols-1 gap-0 px-5 py-4 text-left transition hover:bg-[#fbfaf7] max-lg:m-3 max-lg:rounded-lg max-lg:border max-lg:border-[#e8e2d8] max-lg:bg-white max-lg:shadow-[0_14px_36px_-30px_rgba(41,37,32,0.8)] max-lg:[&>*+*]:border-t max-lg:[&>*+*]:border-[#eee7dc] lg:grid-cols-[var(--table-grid)] lg:items-center md:px-6 ${className}`}
      style={{ "--table-grid": template } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function DataCell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 text-left max-lg:grid max-lg:grid-cols-[7rem_minmax(0,1fr)] max-lg:items-start max-lg:gap-3 max-lg:py-3 first:max-lg:pt-0 last:max-lg:pb-0 lg:pr-4 ${className}`}
    >
      <p className="text-xs font-medium text-zinc-500 lg:hidden">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full max-w-full overflow-x-auto rounded-lg border border-[#d8d2c6] bg-[#f7f3ea] p-1 sm:w-auto ${className}`}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-9 shrink-0 whitespace-nowrap rounded-md px-3 text-sm font-medium transition ${
            value === option.value
              ? "bg-white text-zinc-950 shadow-[0_10px_24px_-18px_rgba(41,37,32,0.75)]"
              : "text-zinc-500 hover:text-zinc-950"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function shapeGlyphClass(shape: ApartmentLayoutShape) {
  if (shape === "corner")
    return "rounded-[3px] [clip-path:polygon(0_0,100%_0,100%_58%,58%_58%,58%_100%,0_100%)]";
  if (shape === "studio") return "rounded-full";
  if (shape === "penthouse") return "rounded-[3px] scale-x-125";
  return "rounded-[3px]";
}

export function floorTileClass(shape: ApartmentLayoutShape) {
  if (shape === "penthouse") return "sm:col-span-3";
  if (shape === "studio") return "sm:col-span-1";
  return "sm:col-span-2";
}
