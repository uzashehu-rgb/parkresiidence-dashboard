import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { type Apartment, projectStats } from "@/data/apartments";
import { AvailabilityLegend } from "@/components/availability-legend";
import { ApartmentCard } from "@/components/apartment-card";
import { ApartmentDetailModal } from "@/components/apartment-detail-modal";
import { useFilteredApartments } from "@/hooks/use-filtered-apartments";
import { ApartmentFilters } from "@/components/apartment-filters";
import { AmenitiesSection } from "@/components/amenities-section";
import { TimelineSection } from "@/components/timeline-section";
import { PressSection } from "@/components/press-section";
import { FaqSection } from "@/components/faq-section";
import { PhilosophySection } from "@/components/philosophy-section";
import exterior from "@/assets/exterior-1.jpg";
import landscape from "@/assets/landscape-1.jpg";
import interior from "@/assets/interior-1.jpg";
import { siteConfig } from "@/lib/site";

const BuildingViewer = lazy(() =>
  import("@/components/building-viewer").then((m) => ({ default: m.BuildingViewer })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${siteConfig.name} - Find your apartment in a new dimension` },
      {
        name: "description",
        content: `Explore an interactive 3D model of ${siteConfig.name}. Eighteen private apartments, real-time availability, refined architecture.`,
      },
      { property: "og:title", content: siteConfig.name },
      {
        property: "og:description",
        content:
          "Interactive 3D apartment selection. Eighteen private residences in landscaped parkland.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [selected, setSelected] = useState<Apartment | null>(null);
  const { filters, setFilters, filtered, visibleIds } = useFilteredApartments();

  return (
    <>
      <Hero visibleIds={visibleIds} onSelect={setSelected} />
      <ExplorerSection
        filters={filters}
        setFilters={setFilters}
        filtered={filtered}
        onSelect={setSelected}
      />
      <FeaturedSection onSelect={setSelected} />
      <PhilosophySection />
      <AboutSection />
      <AmenitiesSection />
      <TimelineSection />
      <GalleryStrip />
      <PressSection />
      <FaqSection />
      <ContactCta />
      <ApartmentDetailModal
        apartment={selected}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
      />
    </>
  );
}

function Hero({
  visibleIds,
  onSelect,
}: {
  visibleIds: Set<string>;
  onSelect: (a: Apartment) => void;
}) {
  return (
    <section className="relative px-6 md:px-12 pt-8 pb-12">
      <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-6 items-end">
        {/* Left editorial */}
        <div className="col-span-12 lg:col-span-3 space-y-10 order-2 lg:order-1">
          <div className="space-y-4 animate-fade-up">
            <span className="eyebrow text-leaf">Concept No. 01</span>
            <h2 className="font-serif text-3xl md:text-4xl leading-[1.05] text-graphite text-balance">
              A monolith of <em className="italic">sculptural light</em>
            </h2>
            <p className="text-sm text-graphite/65 leading-relaxed max-w-[32ch]">
              Designed as a singular piece of structural art. Two volumes, eighteen residences, set
              within 1.4 hectares of mature parkland.
            </p>
          </div>
          <div className="space-y-4 pt-8 border-t border-graphite/10">
            <Stat label="Available" value={String(projectStats.available).padStart(2, "0")} />
            <Stat label="Reserved" value={String(projectStats.reserved).padStart(2, "0")} />
            <Stat label="Completion" value={projectStats.completion} />
          </div>
        </div>

        {/* Center 3D */}
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <div className="text-center mb-6">
            <p className="eyebrow text-brass mb-4">Interactive Residences</p>
            <h1 className="editorial-h text-5xl md:text-6xl lg:text-7xl text-graphite text-balance">
              Find your apartment <br />
              <em className="italic">in a new dimension.</em>
            </h1>
          </div>
          <div className="relative w-full aspect-square md:aspect-[4/3] bg-gradient-to-b from-mist/40 to-canvas rounded-2xl overflow-hidden border border-graphite/10">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="eyebrow text-graphite/40 animate-pulse">Loading residences…</div>
                </div>
              }
            >
              <BuildingViewer visibleIds={visibleIds} onSelectApartment={onSelect} />
            </Suspense>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-full px-5 py-2 eyebrow text-graphite/60 pointer-events-none">
              Drag to rotate · scroll to zoom
            </div>
          </div>
          <AvailabilityLegend className="mt-8 justify-center" />

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a
              href="#explorer"
              className="px-8 py-4 bg-graphite text-canvas eyebrow hover:bg-brass transition-colors rounded-md text-center"
            >
              Explore Residences
            </a>
            <Link
              to="/contact"
              className="px-8 py-4 border border-graphite/25 text-graphite eyebrow hover:border-brass hover:text-brass transition-colors rounded-md text-center"
            >
              Book a Visit
            </Link>
          </div>
        </div>

        {/* Right stats */}
        <div className="col-span-12 lg:col-span-3 lg:text-right space-y-12 order-3">
          <Editorial value="II" label="Architectural Volumes" />
          <Editorial value={String(projectStats.units)} label="Private Residences" />
          <Editorial value="1.4ha" label="Landscaped Parkland" />
          <p className="text-xs text-graphite/55 leading-loose max-w-[24ch] lg:ml-auto pt-6 border-t border-graphite/10">
            A commitment to materiality, craft, and the quiet luxury of silence.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="eyebrow text-graphite/50">{label}</span>
      <span className="font-serif text-lg italic text-graphite tabular-nums">{value}</span>
    </div>
  );
}

function Editorial({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-5xl md:text-6xl text-graphite tabular-nums leading-none">
        {value}
      </p>
      <p className="eyebrow text-graphite/50 mt-2">{label}</p>
    </div>
  );
}

function ExplorerSection({
  filters,
  setFilters,
  filtered,
  onSelect,
}: {
  filters: Parameters<typeof ApartmentFilters>[0]["filters"];
  setFilters: Parameters<typeof ApartmentFilters>[0]["onChange"];
  filtered: Apartment[];
  onSelect: (a: Apartment) => void;
}) {
  return (
    <section id="explorer" className="px-6 md:px-12 py-32 bg-canvas">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-6 mb-12 items-end">
          <div className="col-span-12 md:col-span-7">
            <p className="eyebrow text-brass mb-4">The Collection</p>
            <h2 className="editorial-h text-4xl md:text-6xl text-graphite text-balance">
              Eighteen residences, <em className="italic">none alike.</em>
            </h2>
          </div>
          <p className="col-span-12 md:col-span-5 text-graphite/65 text-sm md:text-base leading-relaxed md:text-right">
            Filter by orientation, area or floor. The 3D model above updates live with your
            selection.
          </p>
        </div>

        <ApartmentFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {filtered.slice(0, 9).map((a) => (
            <ApartmentCard key={a.id} apartment={a} onClick={() => onSelect(a)} />
          ))}
        </div>

        {filtered.length > 9 && (
          <div className="text-center mt-12">
            <Link
              to="/residences"
              className="inline-flex eyebrow text-brass border-b border-brass/40 pb-1 hover:border-brass transition-colors"
            >
              View all {filtered.length} residences →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedSection({ onSelect }: { onSelect: (a: Apartment) => void }) {
  // pulled inline to avoid prop drilling
  const { filtered } = useFilteredApartments({ status: "available" });
  const featured = filtered.slice(0, 3);
  return (
    <section className="px-6 md:px-12 py-32 bg-mist/40">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-16">
          <p className="eyebrow text-brass mb-4">Currently Available</p>
          <h2 className="editorial-h text-4xl md:text-5xl text-graphite">
            <em className="italic">Three</em> residences worth your attention
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((a) => (
            <ApartmentCard key={a.id} apartment={a} onClick={() => onSelect(a)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="px-6 md:px-12 py-32 bg-canvas">
      <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-8 items-center">
        <div className="col-span-12 md:col-span-6">
          <img
            src={exterior}
            alt={`${siteConfig.name} exterior`}
            width={1600}
            height={1100}
            loading="lazy"
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>
        <div className="col-span-12 md:col-span-6 md:pl-12 space-y-8">
          <p className="eyebrow text-brass">About the Project</p>
          <h2 className="editorial-h text-4xl md:text-5xl text-graphite text-balance">
            Architecture as <em className="italic">an act of restraint.</em>
          </h2>
          <p className="text-graphite/70 leading-relaxed">
            Two sculptural volumes in warm white render frame a private courtyard of mature lindens
            and reflective water. Every line, every material was chosen to age slowly and
            beautifully — travertine, hand-rubbed brass, and European oak.
          </p>
          <div className="grid grid-cols-2 gap-y-8 gap-x-12 pt-6 border-t border-graphite/10">
            <Editorial
              value={String(projectStats.buildings).padStart(2, "0")}
              label="Architectural volumes"
            />
            <Editorial value={String(projectStats.units)} label="Private residences" />
            <Editorial value={projectStats.greenSpaces} label="Landscaped parkland" />
            <Editorial value={String(projectStats.parking)} label="Underground spaces" />
          </div>
          <Link
            to="/about"
            className="inline-flex eyebrow text-brass border-b border-brass/40 pb-1 hover:border-brass"
          >
            Discover the architecture →
          </Link>
        </div>
      </div>
    </section>
  );
}

function GalleryStrip() {
  return (
    <section className="px-6 md:px-12 py-32 bg-graphite text-canvas">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-16">
          <p className="eyebrow text-brass mb-4">Visual Archive</p>
          <h2 className="editorial-h text-4xl md:text-5xl">
            <em className="italic">Light</em>, material, season.
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <img
            src={interior}
            alt="Interior"
            loading="lazy"
            width={1400}
            height={1000}
            className="col-span-12 md:col-span-7 w-full h-[420px] object-cover rounded-xl"
          />
          <img
            src={landscape}
            alt="Landscape"
            loading="lazy"
            width={1400}
            height={1000}
            className="col-span-12 md:col-span-5 w-full h-[420px] object-cover rounded-xl"
          />
        </div>
        <div className="text-center mt-12">
          <Link
            to="/gallery"
            className="eyebrow text-brass border-b border-brass/40 pb-1 hover:border-brass"
          >
            Browse the full gallery →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section className="px-6 md:px-12 py-32 bg-canvas">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow text-brass mb-6">Private viewing</p>
        <h2 className="editorial-h text-4xl md:text-6xl text-graphite text-balance">
          Walk the residences <em className="italic">in person.</em>
        </h2>
        <p className="text-graphite/65 mt-6 leading-relaxed max-w-xl mx-auto">
          Visits are arranged privately, by appointment, with a senior member of the sales team. We
          answer in under one business day.
        </p>
        <Link
          to="/contact"
          className="inline-flex mt-10 px-10 py-4 bg-graphite text-canvas eyebrow hover:bg-brass transition-colors rounded-md"
        >
          Request a private visit
        </Link>
      </div>
    </section>
  );
}
