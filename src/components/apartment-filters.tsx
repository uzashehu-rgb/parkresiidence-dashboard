import { type ApartmentStatus } from "@/data/apartments";

export interface Filters {
  building: "all" | "A" | "B";
  rooms: "all" | 2 | 3 | 4 | 5;
  status: "all" | ApartmentStatus;
  minArea: number;
  maxArea: number;
  minPrice: number;
  maxPrice: number;
}

export const DEFAULT_FILTERS: Filters = {
  building: "all",
  rooms: "all",
  status: "all",
  minArea: 50,
  maxArea: 200,
  minPrice: 200000,
  maxPrice: 1500000,
};

export function ApartmentFilters({
  filters,
  onChange,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  return (
    <div className="bg-card border border-graphite/10 rounded-2xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <p className="eyebrow text-graphite">Refine your search</p>
        <p className="eyebrow text-brass tabular-nums">{resultCount} residences</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <Field label="Building">
          <Select
            value={filters.building}
            onChange={(v) => onChange({ ...filters, building: v as Filters["building"] })}
            options={[
              { v: "all", l: "All" },
              { v: "A", l: "Building A" },
              { v: "B", l: "Building B" },
            ]}
          />
        </Field>

        <Field label="Rooms">
          <Select
            value={String(filters.rooms)}
            onChange={(v) =>
              onChange({ ...filters, rooms: v === "all" ? "all" : (Number(v) as Filters["rooms"]) })
            }
            options={[
              { v: "all", l: "Any" },
              { v: "2", l: "2" },
              { v: "3", l: "3" },
              { v: "4", l: "4" },
              { v: "5", l: "5" },
            ]}
          />
        </Field>

        <Field label="Status">
          <Select
            value={filters.status}
            onChange={(v) => onChange({ ...filters, status: v as Filters["status"] })}
            options={[
              { v: "all", l: "All" },
              { v: "available", l: "Available" },
              { v: "reserved", l: "Reserved" },
              { v: "sold", l: "Sold" },
            ]}
          />
        </Field>

        <Field label={`Min area · ${filters.minArea} m²`}>
          <input
            type="range"
            min={50}
            max={200}
            value={filters.minArea}
            onChange={(e) => onChange({ ...filters, minArea: Number(e.target.value) })}
            className="w-full accent-brass"
          />
        </Field>

        <Field label={`Max area · ${filters.maxArea} m²`}>
          <input
            type="range"
            min={50}
            max={200}
            value={filters.maxArea}
            onChange={(e) => onChange({ ...filters, maxArea: Number(e.target.value) })}
            className="w-full accent-brass"
          />
        </Field>

        <Field label={`Up to · €${(filters.maxPrice / 1000).toFixed(0)}k`}>
          <input
            type="range"
            min={200000}
            max={1500000}
            step={10000}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-brass"
          />
        </Field>
      </div>

      <div className="hairline mt-7 mb-5" />
      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="eyebrow text-graphite/60 hover:text-brass transition-colors"
      >
        Reset filters
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow text-graphite/50 block mb-2">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-canvas border border-graphite/15 rounded-md px-3 py-2.5 text-sm text-graphite focus:outline-none focus:border-brass transition-colors"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}
