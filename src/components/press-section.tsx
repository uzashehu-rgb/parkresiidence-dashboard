const QUOTES = [
  {
    quote:
      "Aethelgard is a rare exercise in restraint — a building that trusts its residents to notice the details.",
    author: "Architectural Review",
    role: "Editorial, March 2025",
  },
  {
    quote:
      "The most considered residential project we've covered this year. Every material seems chosen for the second decade, not the first.",
    author: "Casa Vogue Europe",
    role: "Spring Issue 2025",
  },
  {
    quote:
      "We chose Aethelgard for the silence. It is the first apartment that has felt, immediately, like home.",
    author: "Mlle. Hartmann",
    role: "Resident, Building A",
  },
];

export function PressSection() {
  return (
    <section className="px-6 md:px-12 py-32 bg-graphite text-canvas">
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center mb-16">
          <p className="eyebrow text-brass mb-4">In the Press</p>
          <h2 className="editorial-h text-4xl md:text-5xl">
            What others <em className="italic">are saying.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((q) => (
            <figure
              key={q.author}
              className="border border-canvas/10 rounded-2xl p-8 md:p-10 backdrop-blur-sm bg-canvas/[0.02]"
            >
              <svg width="28" height="20" viewBox="0 0 28 20" className="text-brass mb-6" fill="currentColor">
                <path d="M0 20V12C0 5.5 4.5 0 11 0V4C7 4 4 7.5 4 12H8V20H0ZM16 20V12C16 5.5 20.5 0 27 0V4C23 4 20 7.5 20 12H24V20H16Z" />
              </svg>
              <blockquote className="font-serif text-xl md:text-2xl text-canvas leading-snug text-balance">
                {q.quote}
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-canvas/10">
                <p className="font-serif text-canvas">{q.author}</p>
                <p className="eyebrow text-canvas/50 mt-1">{q.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
