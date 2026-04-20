import pool from "@/assets/amenity-pool.jpg";
import gym from "@/assets/amenity-gym.jpg";
import cellar from "@/assets/amenity-cellar.jpg";
import lobby from "@/assets/lobby-1.jpg";

const AMENITIES = [
  {
    img: pool,
    title: "25-metre indoor pool",
    eyebrow: "Wellness",
    body: "A serene, naturally lit pool with a reading nook and steam room.",
  },
  {
    img: gym,
    title: "Private fitness suite",
    eyebrow: "Movement",
    body: "Premium equipment, oak floors, and full-height views of the park canopy.",
  },
  {
    img: cellar,
    title: "Climate-controlled cellar",
    eyebrow: "Hospitality",
    body: "Twelve private lockers and a tasting table for entertaining residents.",
  },
  {
    img: lobby,
    title: "Concierge & residents' lounge",
    eyebrow: "Service",
    body: "A 24-hour concierge desk and a curated lounge for receiving guests.",
  },
];

export function AmenitiesSection() {
  return (
    <section className="px-6 md:px-12 py-32 bg-canvas">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-6 mb-16 items-end">
          <div className="col-span-12 md:col-span-7">
            <p className="eyebrow text-brass mb-4">Private amenities</p>
            <h2 className="editorial-h text-4xl md:text-6xl text-graphite text-balance">
              A second home, <em className="italic">downstairs.</em>
            </h2>
          </div>
          <p className="col-span-12 md:col-span-5 text-graphite/65 text-sm md:text-base leading-relaxed md:text-right">
            Every residence enjoys exclusive access to 1,200 m² of private amenities —
            designed with the same restraint as the apartments themselves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {AMENITIES.map((a, i) => (
            <article
              key={a.title}
              className={`group relative overflow-hidden rounded-2xl bg-card border border-graphite/10 ${
                i === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className={`relative ${i === 0 ? "aspect-[2.4/1]" : "aspect-[4/3]"} overflow-hidden`}>
                <img
                  src={a.img}
                  alt={a.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 via-graphite/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9 text-canvas">
                  <p className="eyebrow text-brass mb-2">{a.eyebrow}</p>
                  <h3 className="font-serif text-2xl md:text-3xl mb-2 text-balance">{a.title}</h3>
                  <p className="text-sm text-canvas/75 max-w-md leading-relaxed">{a.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
