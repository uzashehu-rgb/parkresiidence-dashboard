import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { siteConfig } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${siteConfig.name} - Secure Dashboard Access` },
      {
        name: "description",
        content: `Qasje e sigurt dhe moderne ne dashboard per ${siteConfig.name}.`,
      },
      { property: "og:title", content: `${siteConfig.name} Dashboard` },
      {
        property: "og:description",
        content: "Nje hyrje e qarte drejt dashboard-it te mbrojtur te projektit.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f2eb] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(210,179,107,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(36,33,29,0.12),_transparent_30%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(36,33,29,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(36,33,29,0.045)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#ded7c9] bg-white/88 shadow-[0_30px_120px_-60px_rgba(36,33,29,0.6)] backdrop-blur-xl">
        <div className="grid gap-12 px-6 py-8 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-14 lg:py-16">
          <div className="flex flex-col justify-between gap-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e3d6bf] bg-[#fbf6eb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b5a16]">
                <Sparkles className="size-3.5" />
                Park Residence
              </span>
              <h1 className="mt-6 font-serif text-4xl leading-[0.94] text-zinc-950 sm:text-5xl lg:text-7xl">
                Hyrje e thjeshte.
                <br />
                Dashboard i mbrojtur.
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
                Nje hyrje e vetme per menaxhimin e projektit, inventarit te banesave dhe
                operacioneve te brendshme. Qasja ne dashboard mbrohet me autentikim dhe role te
                ndara.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="/login?next=%2Fdashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#24211d] px-6 text-sm font-semibold text-white transition hover:bg-[#373029]"
              >
                Hape dashboard-in
                <ArrowRight className="size-4" />
              </a>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Qasje vetem per perdorues te autorizuar
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[26px] border border-[#ebe3d6] bg-[#fbfaf7] p-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#24211d] text-[#d2b36b]">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">Role-based access</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Super admini menaxhon gjithcka. Sales users kane qasje vetem te seksioni i
                    banesave.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[#ebe3d6] bg-white p-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbf6eb] text-[#7b5a16]">
                  <LockKeyhole className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">Session e mbrojtur</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Kerkesat e dashboard-it kalojne vetem me sesion valid. Pa login, perdoruesi
                    ridrejtohet automatikisht te hyrja.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[#ded7c9] bg-[#24211d] p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d2b36b]">
                Dashboard Access
              </p>
              <p className="mt-4 font-serif text-3xl leading-none">Nje hyrje. Nje drejtim.</p>
              <p className="mt-4 text-sm leading-6 text-white/72">
                Faqja publike tani mbetet minimaliste dhe e fokusuar vetem te hyrja ne panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
