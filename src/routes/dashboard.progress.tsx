import { createFileRoute } from "@tanstack/react-router";
import { Camera, Download, Eye, ImagePlus } from "lucide-react";
import { useState } from "react";

import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { PhotoForm } from "@/components/dashboard/dashboard-forms";
import {
  ActionButton,
  DashboardModal,
  PageIntro,
  Panel,
  PanelHeader,
  formatDate,
} from "@/components/dashboard/dashboard-ui";
import { createPhoto } from "@/lib/dashboard-api";
import type { ConstructionPhoto } from "@/lib/dashboard-types";
import exterior from "@/assets/exterior-1.jpg";
import balcony from "@/assets/balcony-1.jpg";
import interior from "@/assets/interior-1.jpg";
import landscape from "@/assets/landscape-1.jpg";

export const Route = createFileRoute("/dashboard/progress")({
  component: ProgressPage,
});

const fallbackImages = [exterior, balcony, interior, landscape];

function ProgressPage() {
  const { data, saving, runMutation } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);
  const [previewing, setPreviewing] = useState<{
    photo: ConstructionPhoto;
    url: string;
  } | null>(null);

  async function closeAfter(action: () => Promise<boolean>) {
    const ok = await action();
    if (ok) setModalOpen(false);
  }

  return (
    <>
      <PageIntro
        eyebrow="Progresi"
        title="Foto dhe timeline i ndertimit."
        description="Dokumentim i punimeve sipas dates, projektit dhe banesave specifike."
        action={
          <ActionButton icon={ImagePlus} label="Shto foto" onClick={() => setModalOpen(true)} />
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel>
          <PanelHeader eyebrow="Gallery" title="Fotot e fundit" icon={Camera} />
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.constructionPhotos.map((photo, index) => {
              const previewUrl = photo.imageUrl || fallbackImages[index % fallbackImages.length];

              return (
                <article
                  key={photo.id}
                  className="overflow-hidden rounded-md border border-[#ded7c9] bg-[#fbfaf7]"
                >
                  <div className="group relative aspect-[4/3] bg-[#ebe3d6]">
                    <img
                      src={previewUrl}
                      alt={photo.description}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-3 top-3 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPreviewing({ photo, url: previewUrl })}
                        className="inline-flex size-9 items-center justify-center rounded-md bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white"
                        aria-label={`Preview ${photo.description}`}
                        title="Preview"
                      >
                        <Eye className="size-4" />
                      </button>
                      <a
                        href={previewUrl}
                        download
                        className="inline-flex size-9 items-center justify-center rounded-md bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white"
                        aria-label={`Download ${photo.description}`}
                        title="Download"
                      >
                        <Download className="size-4" />
                      </a>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-medium leading-6">
                      {photo.description}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatDate(photo.photoDate)} · {photo.apartmentCode ?? "Projekt"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel className="h-fit">
          <PanelHeader eyebrow="Timeline" title="Aktiviteti" />
          <div className="space-y-5 p-4">
            {data.constructionPhotos.map((photo) => (
              <div key={photo.id} className="relative pl-6">
                <span className="absolute left-0 top-1.5 size-2.5 rounded-full bg-[#c69c58]" />
                <span className="absolute bottom-[-22px] left-[4px] top-5 w-px bg-[#ded7c9]" />
                <p className="text-sm font-medium leading-6">{photo.description}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(photo.photoDate)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <DashboardModal
        title="Shto foto progresi"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <PhotoForm
          apartments={data.apartments}
          saving={saving}
          onSubmit={(payload) => void closeAfter(() => runMutation(() => createPhoto(payload)))}
        />
      </DashboardModal>

      <DashboardModal
        title={previewing ? `Foto progresi - ${formatDate(previewing.photo.photoDate)}` : "Preview"}
        open={!!previewing}
        onClose={() => setPreviewing(null)}
      >
        {previewing && (
          <div className="grid gap-4">
            <img
              src={previewing.url}
              alt={previewing.photo.description}
              className="max-h-[68vh] w-full rounded-md border border-[#ded7c9] bg-white object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-zinc-600">
                <p className="font-medium text-zinc-950">{previewing.photo.description}</p>
                <p>
                  {formatDate(previewing.photo.photoDate)} ·{" "}
                  {previewing.photo.apartmentCode ?? "Projekt"}
                </p>
              </div>
              <a
                href={previewing.url}
                download
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ded7c9] bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-[#f8f4ec]"
              >
                <Download className="size-4" />
                Download
              </a>
            </div>
          </div>
        )}
      </DashboardModal>
    </>
  );
}
