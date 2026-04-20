import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { to: "/residences", label: "Residences" },
  { to: "/about", label: "Architecture" },
  { to: "/gallery", label: "Gallery" },
  { to: "/location", label: "Location" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-canvas/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-graphite/8 py-3 md:py-4"
            : "bg-transparent py-6 md:py-8"
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 flex justify-between items-center">
          <Link to="/" className="flex flex-col leading-none group">
            <span
              className={`font-serif italic tracking-tight text-graphite transition-all ${
                scrolled ? "text-xl" : "text-2xl"
              }`}
            >
              Aethelgard
            </span>
            <span className="eyebrow text-graphite/60 mt-1">Park Residence</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10 xl:gap-14 text-[11px] uppercase tracking-[0.22em] font-medium text-graphite">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-brass transition-colors duration-300 relative"
                activeProps={{ className: "text-brass" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="h-6 w-px bg-graphite/15" />
            <Link
              to="/contact"
              className="text-brass flex items-center gap-2 group"
            >
              Inquire
              <span className="block size-1 rounded-full bg-brass group-hover:scale-150 transition-transform" />
            </Link>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden flex flex-col gap-1.5 p-2 -mr-2"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-px bg-graphite transition-transform ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-graphite transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-graphite transition-transform ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-canvas/95 backdrop-blur-xl" onClick={() => setOpen(false)} />
        <nav className="relative h-full flex flex-col justify-center items-center gap-8 px-6">
          {[...links, { to: "/contact", label: "Inquire" }].map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="font-serif text-4xl text-graphite hover:text-brass transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
