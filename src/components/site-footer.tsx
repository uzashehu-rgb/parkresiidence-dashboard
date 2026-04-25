import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-graphite/10 bg-canvas mt-32">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <span className="font-serif italic text-3xl text-graphite">{siteConfig.monogram}</span>
          <p className="eyebrow text-graphite/60 mt-1">{siteConfig.name}</p>
          <p className="mt-8 text-sm text-graphite/70 max-w-sm leading-relaxed">
            A private collection of eighteen residences set within 1.4 hectares of landscaped
            parkland. Designed for those who value silence, light, and craft.
          </p>
        </div>

        <div>
          <p className="eyebrow text-graphite/50 mb-5">Explore</p>
          <ul className="space-y-3 text-sm text-graphite">
            <li>
              <Link to="/residences" className="hover:text-brass">
                Residences
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brass">
                Architecture
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-brass">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/location" className="hover:text-brass">
                Location
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-graphite/50 mb-5">Sales Office</p>
          <ul className="space-y-3 text-sm text-graphite">
            <li>{siteConfig.contact.phoneDisplay}</li>
            <li>{siteConfig.contact.email}</li>
            <li className="text-graphite/60">{siteConfig.contact.hours}</li>
            <li className="pt-2">
              <Link to="/contact" className="text-brass hover:underline">
                Book a private visit →
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-graphite/10">
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-3 eyebrow text-graphite/40">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span>Designed for a quieter life</span>
        </div>
      </div>
    </footer>
  );
}
