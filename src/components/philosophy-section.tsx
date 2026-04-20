import balcony from "@/assets/balcony-1.jpg";
import landscape from "@/assets/landscape-1.jpg";

const PRINCIPLES = [
  { n: "01", title: "Materiality first", body: "Render, oak, travertine, brass — chosen to age into character, not out of it." },
  { n: "02", title: "Light as a tenant", body: "Loggias, deep reveals, and triple aspects bring daylight into every room of every residence." },
  { n: "03", title: "Silence engineered", body: "Cross-laminated timber slabs and acoustic glazing make the building quieter than the park outside." },
  { n: "04", title: "Park-first planning", body: "Two volumes step back from the property line, returning a hectare of garden to the neighbourhood." },
];

export function PhilosophySection() {
  return (
    <section className="px-6 md:px-12 py-32 bg-mist/40">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-6 mb-20 items-end">
          <div className="col-span-12 md:col-span-7">
            <p className="eyebrow text-brass mb-4">Design Philosophy</p>
            <h2 className="editorial-h text-4xl md:text-6xl text-graphite text-balance">
              Four principles, <em className="italic">no compromises.</em>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-stretch">
          <div className="col-span-12 md:col-span-5 grid grid-cols-1 md:grid-rows-2 gap-4">
            <img
              src={balcony}
              alt="Balcony detail"
              loading="lazy"
              className="w-full h-64 md:h-full object-cover rounded-2xl"
            />
            <img
              src={landscape}
              alt="Landscape"
              loading="lazy"
              className="w-full h-64 md:h-full object-cover rounded-2xl"
            />
          </div>
          <div className="col-span-12 md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="border-t border-graphite/15 pt-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-serif text-3xl text-brass tabular-nums italic">{p.n}</span>
                  <h3 className="font-serif text-2xl text-graphite">{p.title}</h3>
                </div>
                <p className="text-graphite/65 text-[15px] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
