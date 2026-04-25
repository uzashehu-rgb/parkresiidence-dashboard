import { createFileRoute } from "@tanstack/react-router";
import exterior from "@/assets/exterior-1.jpg";
import interior from "@/assets/interior-1.jpg";
import landscape from "@/assets/landscape-1.jpg";
import balcony from "@/assets/balcony-1.jpg";
import lobby from "@/assets/lobby-1.jpg";
import { siteConfig } from "@/lib/site";

const IMAGES = [
  {
    src: exterior,
    alt: "Exterior facade",
    category: "Architecture",
    span: "md:col-span-8 md:row-span-2",
  },
  { src: balcony, alt: "Private balcony", category: "Detail", span: "md:col-span-4" },
  { src: interior, alt: "Living room", category: "Interior", span: "md:col-span-4" },
  { src: landscape, alt: "Landscape garden", category: "Surroundings", span: "md:col-span-6" },
  { src: lobby, alt: "Lobby", category: "Common areas", span: "md:col-span-6" },
];

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: `Gallery - ${siteConfig.name}` },
      {
        name: "description",
        content: `Architectural renders, interiors, surroundings and lifestyle visuals from ${siteConfig.name}.`,
      },
      { property: "og:title", content: `Gallery - ${siteConfig.name}` },
      { property: "og:description", content: `A visual archive of ${siteConfig.name}.` },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <div className="px-6 md:px-12 py-16 md:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-16">
          <p className="eyebrow text-brass mb-4">Visual Archive</p>
          <h1 className="editorial-h text-5xl md:text-7xl text-graphite text-balance">
            The light, the material, <em className="italic">the season.</em>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[260px] gap-4">
          {IMAGES.map((img) => (
            <figure
              key={img.alt}
              className={`relative col-span-1 ${img.span} group overflow-hidden rounded-xl`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <figcaption className="absolute bottom-4 left-4 glass-card rounded-md px-3 py-1.5 eyebrow text-graphite/80">
                {img.category}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
