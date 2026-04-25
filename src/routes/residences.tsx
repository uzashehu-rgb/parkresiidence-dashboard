import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ApartmentFilters } from "@/components/apartment-filters";
import { ApartmentCard } from "@/components/apartment-card";
import { ApartmentTable } from "@/components/apartment-table";
import { ApartmentDetailModal } from "@/components/apartment-detail-modal";
import { useFilteredApartments } from "@/hooks/use-filtered-apartments";
import { type Apartment } from "@/data/apartments";
import { siteConfig } from "@/lib/site";

export const Route = createFileRoute("/residences")({
  head: () => ({
    meta: [
      { title: `Residences - ${siteConfig.name}` },
      {
        name: "description",
        content:
          "Explore all eighteen private residences. Filter by floor, area, orientation, and price.",
      },
      { property: "og:title", content: `The Residences - ${siteConfig.name}` },
      {
        property: "og:description",
        content: "Eighteen residences set within landscaped parkland. Live availability.",
      },
    ],
  }),
  component: ResidencesPage,
});

function ResidencesPage() {
  const [selected, setSelected] = useState<Apartment | null>(null);
  const [view, setView] = useState<"grid" | "table">("grid");
  const { filters, setFilters, filtered } = useFilteredApartments();

  return (
    <div className="px-6 md:px-12 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-14">
          <p className="eyebrow text-brass mb-4">The Collection</p>
          <h1 className="editorial-h text-5xl md:text-7xl text-graphite text-balance">
            All <em className="italic">{filtered.length}</em> residences
          </h1>
          <p className="text-graphite/65 mt-6 max-w-xl mx-auto leading-relaxed">
            From garden-level lofts to two-storey penthouses with private terraces.
          </p>
        </div>

        <ApartmentFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

        <div className="flex justify-end mt-8 mb-6 gap-2">
          <button
            onClick={() => setView("grid")}
            className={`eyebrow px-4 py-2 rounded-md border transition-colors ${
              view === "grid"
                ? "bg-graphite text-canvas border-graphite"
                : "border-graphite/15 text-graphite/60 hover:border-brass hover:text-brass"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={`eyebrow px-4 py-2 rounded-md border transition-colors ${
              view === "table"
                ? "bg-graphite text-canvas border-graphite"
                : "border-graphite/15 text-graphite/60 hover:border-brass hover:text-brass"
            }`}
          >
            Table
          </button>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <ApartmentCard key={a.id} apartment={a} onClick={() => setSelected(a)} />
            ))}
          </div>
        ) : (
          <ApartmentTable apartments={filtered} onSelect={setSelected} />
        )}
      </div>

      <ApartmentDetailModal
        apartment={selected}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
      />
    </div>
  );
}
