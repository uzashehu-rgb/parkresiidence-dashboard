import { useEffect } from "react";
import { type Apartment, formatPrice, apartments as ALL } from "@/data/apartments";
import { StatusPill } from "./apartment-card";
import floorplan from "@/assets/balcony-1.jpg";
import interior from "@/assets/interior-1.jpg";

interface Props {
  apartment: Apartment | null;
  onClose: () => void;
  onSelect: (a: Apartment) => void;
}

export function ApartmentDetailModal({ apartment, onClose, onSelect }: Props) {
  useEffect(() => {
    if (!apartment) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [apartment, onClose]);

  if (!apartment) return null;

  const related = ALL
    .filter((a) => a.id !== apartment.id && a.rooms === apartment.rooms && a.status === "available")
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-up"
      style={{ background: "oklch(0.22 0.004 60 / 0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-canvas w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Visual */}
          <div className="relative bg-mist aspect-[4/5] lg:aspect-auto lg:min-h-[640px]">
            <img
              src={interior}
              alt={apartment.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <button
              onClick={onClose}
              className="absolute top-5 right-5 size-10 rounded-full glass-card flex items-center justify-center text-graphite hover:text-brass transition-colors"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
            <div className="absolute bottom-5 left-5 glass-card rounded-lg px-4 py-3">
              <p className="eyebrow text-graphite/60">Building {apartment.building}</p>
              <p className="font-serif text-lg text-graphite">Unit {apartment.number}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <p className="eyebrow text-brass">Featured Residence</p>
              <StatusPill status={apartment.status} />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-graphite leading-[1.05]">
              {apartment.name}
            </h2>
            <p className="text-graphite/70 mt-5 leading-relaxed text-[15px]">
              {apartment.description}
            </p>

            <div className="hairline my-7" />

            <div className="grid grid-cols-2 gap-y-5 text-sm tabular-nums">
              <Spec label="Surface area" value={`${apartment.area} m²`} />
              <Spec label="Rooms" value={String(apartment.rooms)} />
              <Spec label="Floor" value={`${apartment.floor} of 8`} />
              <Spec label="Orientation" value={apartment.orientation} />
              <Spec label="Building" value={apartment.building} />
              <Spec label="Completion" value="Q4 2025" />
            </div>

            <div className="hairline my-7" />

            <div>
              <p className="eyebrow text-graphite/50 mb-3">Features</p>
              <ul className="grid grid-cols-2 gap-y-2 text-[13px] text-graphite/80">
                {apartment.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="size-1 rounded-full bg-brass mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hairline my-7" />

            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="eyebrow text-graphite/50">Asking price</p>
                <p className="font-serif text-4xl text-graphite mt-1 tabular-nums">
                  {formatPrice(apartment.price)}
                </p>
              </div>
              <img
                src={floorplan}
                alt="Floor plan"
                className="hidden md:block w-28 h-28 object-cover rounded-lg border border-graphite/10"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/contact"
                className="flex-1 text-center py-4 bg-graphite text-canvas eyebrow hover:bg-brass transition-colors rounded-md"
              >
                Request offer
              </a>
              <a
                href="/contact"
                className="flex-1 text-center py-4 border border-graphite/20 text-graphite eyebrow hover:border-brass hover:text-brass transition-colors rounded-md"
              >
                Schedule visit
              </a>
            </div>

            {related.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow text-graphite/50 mb-4">Similar residences</p>
                <div className="grid grid-cols-3 gap-3">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onSelect(r)}
                      className="text-left p-3 rounded-lg border border-graphite/10 hover:border-brass/40 transition-colors"
                    >
                      <p className="text-xs text-graphite/60 tabular-nums">{r.number}</p>
                      <p className="font-serif text-base text-graphite mt-0.5">{r.area} m²</p>
                      <p className="eyebrow text-brass mt-1">{formatPrice(r.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-graphite/50 mb-1">{label}</p>
      <p className="text-graphite">{value}</p>
    </div>
  );
}
