import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/lib/site";

const PLACES = [
  { name: "Linden Park", distance: "0 m", category: "Adjacent" },
  { name: "International School", distance: "400 m", category: "Education" },
  { name: "Galerie Maison", distance: "650 m", category: "Culture" },
  { name: "Boulangerie & Café", distance: "120 m", category: "Lifestyle" },
  { name: "Metro Station", distance: "550 m", category: "Transit" },
  { name: "City Centre", distance: "8 min", category: "City" },
];

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: `Location - ${siteConfig.name}` },
      {
        name: "description",
        content:
          "Adjacent to Linden Park, with quick access to the city centre, schools, and culture.",
      },
      { property: "og:title", content: `Location - ${siteConfig.name}` },
      {
        property: "og:description",
        content: `Where ${siteConfig.name} sits, and what surrounds it.`,
      },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  return (
    <div className="px-6 md:px-12 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-16">
          <p className="eyebrow text-brass mb-4">Location</p>
          <h1 className="editorial-h text-5xl md:text-7xl text-graphite text-balance">
            Where the city <em className="italic">meets the park.</em>
          </h1>
          <p className="text-graphite/65 mt-6 max-w-xl mx-auto leading-relaxed">
            {siteConfig.name} sits on the northern edge of Linden Park, eight minutes from the city
            centre.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Custom stylized map */}
          <div className="col-span-12 lg:col-span-8 relative aspect-[4/3] rounded-2xl overflow-hidden border border-graphite/10 bg-mist">
            <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="oklch(0.22 0.004 60 / 0.06)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#grid)" />
              {/* Park */}
              <ellipse cx="350" cy="320" rx="220" ry="160" fill="oklch(0.48 0.025 145 / 0.25)" />
              <ellipse cx="350" cy="320" rx="180" ry="120" fill="oklch(0.48 0.025 145 / 0.35)" />
              {/* Roads */}
              <path
                d="M 0 200 Q 400 240 800 180"
                stroke="oklch(0.22 0.004 60 / 0.18)"
                strokeWidth="14"
                fill="none"
              />
              <path
                d="M 0 460 Q 400 420 800 480"
                stroke="oklch(0.22 0.004 60 / 0.18)"
                strokeWidth="14"
                fill="none"
              />
              <path
                d="M 600 0 L 620 600"
                stroke="oklch(0.22 0.004 60 / 0.18)"
                strokeWidth="14"
                fill="none"
              />
              {/* Project pin */}
              <g transform="translate(440, 200)">
                <circle r="38" fill="oklch(0.72 0.06 75 / 0.15)" />
                <circle r="20" fill="oklch(0.72 0.06 75 / 0.3)" />
                <circle r="9" fill="oklch(0.72 0.06 75)" />
                <circle r="9" fill="oklch(0.72 0.06 75)">
                  <animate attributeName="r" values="9;18;9" dur="2.4s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.8;0;0.8"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
              <text
                x="490"
                y="195"
                fontFamily="Cormorant Garamond"
                fontSize="22"
                fill="oklch(0.22 0.004 60)"
                fontStyle="italic"
              >
                {siteConfig.name}
              </text>
              <text
                x="370"
                y="320"
                fontFamily="Cormorant Garamond"
                fontSize="18"
                fill="oklch(0.48 0.025 145)"
                textAnchor="middle"
              >
                Linden Park
              </text>
            </svg>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-card border border-graphite/10 rounded-2xl p-8">
            <p className="eyebrow text-brass mb-6">In the neighbourhood</p>
            <ul className="divide-y divide-graphite/10">
              {PLACES.map((p) => (
                <li key={p.name} className="py-4 flex justify-between items-baseline">
                  <div>
                    <p className="font-serif text-lg text-graphite">{p.name}</p>
                    <p className="eyebrow text-graphite/45 mt-0.5">{p.category}</p>
                  </div>
                  <span className="eyebrow text-brass tabular-nums">{p.distance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
