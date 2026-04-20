const PHASES = [
  { date: "Q1 2024", title: "Groundbreaking", body: "Excavation and foundation works completed under Studio Verde supervision.", done: true },
  { date: "Q3 2024", title: "Structural completion", body: "Both volumes topped out, facade work begins on Building A.", done: true },
  { date: "Q1 2025", title: "Facade & interiors", body: "Render facade, oak flooring, and brass detailing installation.", done: true },
  { date: "Q3 2025", title: "Landscaping & amenities", body: "Mature lindens transplanted, water feature commissioned, amenities outfitted.", done: false },
  { date: "Q4 2025", title: "Handover", body: "First keys delivered to residents.", done: false },
];

export function TimelineSection() {
  return (
    <section className="px-6 md:px-12 py-32 bg-mist/40">
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center mb-20">
          <p className="eyebrow text-brass mb-4">Construction Timeline</p>
          <h2 className="editorial-h text-4xl md:text-6xl text-graphite text-balance">
            On track for <em className="italic">Q4 2025.</em>
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] md:left-1/2 top-2 bottom-2 w-px bg-graphite/15 md:-translate-x-px" />

          <div className="space-y-14">
            {PHASES.map((p, i) => {
              const left = i % 2 === 0;
              return (
                <div key={p.date} className="relative grid md:grid-cols-2 md:gap-12 items-start">
                  {/* Dot */}
                  <div className="absolute left-0 md:left-1/2 top-1.5 -translate-x-[6px] md:-translate-x-1/2">
                    <div
                      className={`size-4 rounded-full border-2 ${
                        p.done
                          ? "bg-brass border-brass"
                          : "bg-canvas border-graphite/30"
                      }`}
                    />
                    {p.done && (
                      <div className="absolute inset-0 size-4 rounded-full bg-brass animate-brass-pulse" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`pl-8 md:pl-0 ${
                      left ? "md:pr-12 md:text-right" : "md:col-start-2 md:pl-12"
                    }`}
                  >
                    <p className="eyebrow text-brass mb-2">{p.date}</p>
                    <h3 className="font-serif text-2xl md:text-3xl text-graphite mb-2">{p.title}</h3>
                    <p className="text-sm text-graphite/65 leading-relaxed max-w-md md:inline-block">
                      {p.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
