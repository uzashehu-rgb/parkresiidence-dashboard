import { type Apartment, formatPrice } from "@/data/apartments";

const STATUS_STYLES: Record<Apartment["status"], string> = {
  available: "bg-brass/10 text-brass border-brass/30",
  reserved: "bg-leaf/10 text-leaf border-leaf/30",
  sold: "bg-graphite/5 text-graphite/50 border-graphite/15",
};

export function StatusPill({ status }: { status: Apartment["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 eyebrow border rounded-full px-2.5 py-1 ${STATUS_STYLES[status]}`}
    >
      <span className={`size-1 rounded-full ${
        status === "available" ? "bg-brass" : status === "reserved" ? "bg-leaf" : "bg-graphite/40"
      }`} />
      {status}
    </span>
  );
}

export function ApartmentCard({
  apartment,
  onClick,
}: {
  apartment: Apartment;
  onClick: () => void;
}) {
  const sold = apartment.status === "sold";
  return (
    <button
      onClick={onClick}
      className={`group text-left bg-card border border-graphite/10 rounded-2xl p-7 transition-all duration-500 hover:shadow-[0_24px_60px_-20px_oklch(0.2_0.01_60_/_0.18)] hover:-translate-y-1 ${
        sold ? "opacity-70" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="eyebrow text-graphite/50">Building {apartment.building} · Floor {apartment.floor}</p>
          <h3 className="font-serif text-2xl text-graphite mt-1.5 leading-tight">
            {apartment.name}
          </h3>
          <p className="text-xs text-graphite/50 mt-1">Unit {apartment.number}</p>
        </div>
        <StatusPill status={apartment.status} />
      </div>

      <div className="hairline mb-5" />

      <div className="grid grid-cols-3 gap-3 text-xs text-graphite/70 tabular-nums">
        <div>
          <p className="eyebrow text-graphite/40 mb-1">Surface</p>
          <p className="text-graphite">{apartment.area} m²</p>
        </div>
        <div>
          <p className="eyebrow text-graphite/40 mb-1">Rooms</p>
          <p className="text-graphite">{apartment.rooms}</p>
        </div>
        <div>
          <p className="eyebrow text-graphite/40 mb-1">Aspect</p>
          <p className="text-graphite">{apartment.orientation}</p>
        </div>
      </div>

      <div className="hairline my-5" />

      <div className="flex justify-between items-end">
        <div>
          <p className="eyebrow text-graphite/40">From</p>
          <p className="font-serif text-2xl text-graphite tabular-nums mt-0.5">
            {formatPrice(apartment.price)}
          </p>
        </div>
        <span className="eyebrow text-brass group-hover:translate-x-1 transition-transform">
          View →
        </span>
      </div>
    </button>
  );
}
