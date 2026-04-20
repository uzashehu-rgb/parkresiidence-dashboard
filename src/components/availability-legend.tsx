import { type ApartmentStatus } from "@/data/apartments";

const STATUSES: { key: ApartmentStatus; label: string; dot: string }[] = [
  { key: "available", label: "Available", dot: "bg-brass" },
  { key: "reserved", label: "Reserved", dot: "bg-leaf/60" },
  { key: "sold", label: "Sold", dot: "bg-graphite/30" },
];

export function AvailabilityLegend({
  className = "",
  active,
  onToggle,
}: {
  className?: string;
  active?: ApartmentStatus | "all";
  onToggle?: (s: ApartmentStatus | "all") => void;
}) {
  const interactive = !!onToggle;
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${className}`}>
      {interactive && (
        <button
          onClick={() => onToggle?.("all")}
          className={`eyebrow transition-opacity ${
            active === "all" || !active ? "text-graphite" : "text-graphite/40 hover:text-graphite/70"
          }`}
        >
          All
        </button>
      )}
      {STATUSES.map((s) => {
        const isActive = !active || active === "all" || active === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onToggle?.(s.key)}
            disabled={!interactive}
            className={`flex items-center gap-3 transition-opacity ${
              isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
            } ${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            <span className="eyebrow text-graphite/70">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
