import { useState } from "react";

const FAQS = [
  {
    q: "When can I move in?",
    a: "First handovers begin in Q4 2025. Reserved residences are allocated keys in the order of reservation.",
  },
  {
    q: "What is included in the purchase price?",
    a: "Prices include the residence as built — European oak flooring, integrated kitchen, sanitary fittings in Carrara marble, smart climate control, and access to all private amenities. Underground parking and storage are sold separately.",
  },
  {
    q: "Can the layouts be customised?",
    a: "Yes. Until structural completion, our architects can propose modifications to internal partitions, finishes, and fitted kitchens. A bespoke service is available for ground-up customisation of larger residences.",
  },
  {
    q: "What is the reservation process?",
    a: "A reservation is held for 30 days against a deposit of 5% of the purchase price. Within that window, contracts are exchanged with our notary. Reservations may be made on-site or remotely.",
  },
  {
    q: "Are the amenities included?",
    a: "Yes — every resident has full access to the pool, gym, cellar, lounge, and concierge service, included in a modest annual service charge that also covers landscaping and 24-hour security.",
  },
  {
    q: "Is financing available?",
    a: "Our sales team works with a panel of three private banks who can arrange financing at competitive terms. We are happy to make introductions on request.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-6 md:px-12 py-32 bg-canvas">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-16">
          <p className="eyebrow text-brass mb-4">Frequently Asked</p>
          <h2 className="editorial-h text-4xl md:text-6xl text-graphite text-balance">
            Questions <em className="italic">we are asked.</em>
          </h2>
        </div>
        <div className="divide-y divide-graphite/10 border-y border-graphite/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex justify-between items-center gap-6 py-7 text-left group"
                >
                  <h3 className="font-serif text-xl md:text-2xl text-graphite group-hover:text-brass transition-colors">
                    {f.q}
                  </h3>
                  <span
                    className={`shrink-0 size-9 rounded-full border border-graphite/15 flex items-center justify-center transition-all ${
                      isOpen ? "bg-graphite text-canvas border-graphite rotate-45" : "text-graphite group-hover:border-brass group-hover:text-brass"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-graphite/70 leading-relaxed pb-7 pr-12 max-w-3xl">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
