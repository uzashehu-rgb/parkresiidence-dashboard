import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-brass">404</p>
        <h1 className="font-serif text-6xl text-graphite mt-4">Page not found</h1>
        <p className="mt-4 text-sm text-graphite/60">
          The page you're looking for has moved or never existed.
        </p>
        <Link
          to="/"
          className="inline-flex mt-8 px-6 py-3 bg-graphite text-canvas eyebrow hover:bg-brass transition-colors rounded-md"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteConfig.name },
      {
        name: "description",
        content: siteConfig.description,
      },
      { property: "og:title", content: siteConfig.name },
      { property: "og:description", content: siteConfig.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isDashboard = pathname.startsWith("/dashboard");
  const hideSiteChrome = isDashboard || pathname === "/login" || pathname === "/";

  return (
    <>
      {!hideSiteChrome && <SiteHeader />}
      <main className={hideSiteChrome ? "" : "pt-28 md:pt-32"}>
        <Outlet />
      </main>
      {!hideSiteChrome && <SiteFooter />}
    </>
  );
}
