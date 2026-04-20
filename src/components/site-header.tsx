import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Project" },
  { to: "/residences", label: "Residences" },
  { to: "/about", label: "Architecture" },
  { to: "/gallery", label: "Gallery" },
  { to: "/location", label: "Location" },
  { to: "/contact", label: "Inquire" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 md:py-8">
      <div className="mx-auto max-w-[1600px] flex justify-between items-center">
        <Link to="/" className="flex flex-col leading-none group">
          <span className="font-serif italic text-2xl tracking-tight text-graphite">Aethelgard</span>
          <span className="eyebrow text-graphite/60 mt-1">Park Residence</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10 xl:gap-14 text-[11px] uppercase tracking-[0.22em] font-medium text-graphite">
          {links.slice(1, -1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-brass transition-colors duration-300"
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

        <Link
          to="/contact"
          className="lg:hidden eyebrow text-brass border border-brass/30 px-4 py-2 rounded-full"
        >
          Inquire
        </Link>
      </div>
    </header>
  );
}
