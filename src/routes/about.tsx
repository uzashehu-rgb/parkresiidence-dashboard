import { createFileRoute } from "@tanstack/react-router";
import { projectStats } from "@/data/apartments";
import exterior from "@/assets/exterior-1.jpg";
import landscape from "@/assets/landscape-1.jpg";
import interior from "@/assets/interior-1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Architecture — Aethelgard" },
      {
        name: "description",
        content:
          "Two sculptural volumes in warm white render, set within 1.4 hectares of mature parkland. The architecture of Aethelgard.",
      },
      { property: "og:title", content: "Architecture — Aethelgard" },
      {
        property: "og:description",
        content: "Restrained, material, slow architecture. Discover the design language of Aethelgard.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-canvas">
      <section className="px-6 md:px-12 py-20 md:py-32">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="eyebrow text-brass mb-4">The Architecture</p>
          <h1 className="editorial-h text-5xl md:text-7xl text-graphite text-balance">
            <em className="italic">Restraint</em> as a form of luxury.
          </h1>
          <p className="text-graphite/65 mt-8 leading-relaxed max-w-2xl mx-auto">
            Aethelgard is the work of a single architectural studio, a single landscape
            designer, and a small circle of European makers. It is not a development.
            It is a residence — singular, considered, slow.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-32">
        <div className="mx-auto max-w-[1600px]">
          <img
            src={exterior}
            alt="Aethelgard exterior"
            width={1600}
            height={1100}
            loading="lazy"
            className="w-full h-[60vh] object-cover rounded-2xl"
          />
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 bg-mist/40">
        <div className="mx-auto max-w-[1600px] grid grid-cols-2 md:grid-cols-4 gap-12">
          <Stat value={String(projectStats.buildings).padStart(2, "0")} label="Volumes" />
          <Stat value={String(projectStats.units)} label="Residences" />
          <Stat value={projectStats.greenSpaces} label="Parkland" />
          <Stat value={String(projectStats.parking)} label="Parking spaces" />
        </div>
      </section>

      <section className="px-6 md:px-12 py-32">
        <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-5 space-y-6">
            <p className="eyebrow text-brass">Materials</p>
            <h2 className="editorial-h text-4xl md:text-5xl text-graphite">
              Built to <em className="italic">age slowly.</em>
            </h2>
            <ul className="space-y-3 text-graphite/75 text-sm leading-relaxed">
              {[
                "Hand-rubbed warm white render facade",
                "Travertine and burnished brass detailing",
                "European oak flooring throughout",
                "Floor-to-ceiling thermal-broken glazing",
                "Underfloor heating, smart climate control",
                "Private landscaped courtyard with mature lindens",
              ].map((m) => (
                <li key={m} className="flex items-start gap-3">
                  <span className="size-1 rounded-full bg-brass mt-2.5 shrink-0" /> {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
            <img src={interior} alt="Interior" loading="lazy" width={1400} height={1000}
                 className="w-full h-72 md:h-96 object-cover rounded-xl" />
            <img src={landscape} alt="Landscape" loading="lazy" width={1400} height={1000}
                 className="w-full h-72 md:h-96 object-cover rounded-xl mt-12" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-serif text-5xl md:text-6xl text-graphite tabular-nums leading-none">{value}</p>
      <p className="eyebrow text-graphite/50 mt-3">{label}</p>
    </div>
  );
}
