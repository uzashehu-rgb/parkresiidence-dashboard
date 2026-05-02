import { useId, useState } from "react";
import { Download, Eye, Upload, X } from "lucide-react";

import type {
  Apartment,
  ApartmentLayoutShape,
  ApartmentPayload,
  ApartmentStatus,
  Client,
  ClientPayload,
  ExpenseCategory,
  Invoice,
  InvoicePayload,
  Payment,
  PaymentPayload,
  PhotoPayload,
} from "@/lib/dashboard-types";
import {
  Field,
  SubmitButton,
  fieldClass,
  fileToDataUrl,
  layoutShapeDescriptions,
  layoutShapeLabels,
  shapeGlyphClass,
  statusLabels,
  today,
} from "./dashboard-ui";

function getFileName(value: string) {
  if (!value) return "";
  if (value.startsWith("data:")) return "uploaded-image";

  try {
    const url = new URL(value);
    return decodeURIComponent(url.pathname.split("/").filter(Boolean).at(-1) ?? "uploaded-image");
  } catch {
    return value.split("/").filter(Boolean).at(-1) ?? "uploaded-image";
  }
}

function UploadField({
  label,
  hint,
  imageUrl,
  fileName,
  onFileChange,
  onClear,
}: {
  label: string;
  hint: string;
  imageUrl: string;
  fileName: string;
  onFileChange: (file: File | undefined) => Promise<void> | void;
  onClear: () => void;
}) {
  const inputId = useId();
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    void onFileChange(file);
    setDragActive(false);
  }

  return (
    <div className="grid gap-3">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFiles(event.currentTarget.files)}
      />
      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className={`grid cursor-pointer gap-2 rounded-md border border-dashed px-4 py-4 text-sm transition ${
          dragActive
            ? "border-[#8f6a2e] bg-[#fbf6eb] text-[#7b5a16]"
            : "border-[#cfc4b2] bg-white text-zinc-600"
        }`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Upload className="size-4" />
            {label}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            Drag & drop
          </span>
        </span>
        <span className="text-xs text-zinc-500">{hint}</span>
      </label>

      {imageUrl && (
        <div className="overflow-hidden rounded-md border border-[#ded7c9] bg-white">
          <img src={imageUrl} alt={fileName || label} className="max-h-56 w-full object-cover" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ebe3d6] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                {fileName || "uploaded-image"}
              </p>
              <p className="text-xs text-zinc-500">Preview e gatshme per ruajtje</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#ded7c9] px-3 text-sm font-medium text-zinc-700 transition hover:bg-[#f8f4ec]"
              >
                <Eye className="size-4" />
                Preview
              </a>
              <a
                href={imageUrl}
                download={fileName || undefined}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#ded7c9] px-3 text-sm font-medium text-zinc-700 transition hover:bg-[#f8f4ec]"
              >
                <Download className="size-4" />
                Download
              </a>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#f0d4d1] text-red-600 transition hover:bg-red-50"
                aria-label="Hiq foton"
                title="Hiq foton"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InvoiceForm({
  categories,
  initial,
  saving,
  onSubmit,
}: {
  categories: ExpenseCategory[];
  initial: Invoice | null;
  saving: boolean;
  onSubmit: (payload: InvoicePayload) => void;
}) {
  const [form, setForm] = useState({
    categoryId: String(initial?.categoryId ?? categories[0]?.id ?? ""),
    invoiceDate: initial?.invoiceDate.slice(0, 10) ?? today(),
    amount: String(initial?.amount ?? ""),
    supplier: initial?.supplier ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    fileName: getFileName(initial?.imageUrl ?? ""),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const imageUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, imageUrl, fileName: file.name }));
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          categoryId: Number(form.categoryId),
          invoiceDate: form.invoiceDate,
          amount: Number(form.amount),
          supplier: form.supplier,
          description: form.description,
          imageUrl: form.imageUrl || null,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data">
          <input
            required
            type="date"
            value={form.invoiceDate}
            onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Shuma">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Kategoria">
          <select
            required
            value={form.categoryId}
            onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            className={fieldClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Furnitori">
          <input
            required
            value={form.supplier}
            onChange={(event) => setForm({ ...form, supplier: event.target.value })}
            className={fieldClass}
          />
        </Field>
      </div>
      <Field label="Pershkrimi">
        <textarea
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          className={`${fieldClass} min-h-24 py-3`}
        />
      </Field>
      <UploadField
        label="Upload foto te fatures"
        hint="Kliko ose lesho fotografine ketu. Fatura do te kete preview dhe download pasi te ruhet."
        imageUrl={form.imageUrl}
        fileName={form.fileName}
        onFileChange={handleFile}
        onClear={() => setForm((current) => ({ ...current, imageUrl: "", fileName: "" }))}
      />
      <SubmitButton saving={saving} label={initial ? "Ruaj ndryshimet" : "Shto fature"} />
    </form>
  );
}

export function ApartmentForm({
  initial,
  saving,
  onSubmit,
}: {
  initial: Apartment | null;
  saving: boolean;
  onSubmit: (payload: ApartmentPayload) => void;
}) {
  const [form, setForm] = useState({
    code: initial?.code ?? "",
    floor: String(initial?.floor ?? ""),
    area: String(initial?.area ?? ""),
    price: String(initial?.price ?? ""),
    status: initial?.status ?? "available",
    layoutShape: initial?.layoutShape ?? "standard",
    description: initial?.description ?? "",
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          code: form.code,
          floor: Number(form.floor),
          area: Number(form.area),
          price: Number(form.price),
          status: form.status as ApartmentStatus,
          layoutShape: form.layoutShape as ApartmentLayoutShape,
          description: form.description,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kodi / emri">
          <input
            required
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Statusi">
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as ApartmentStatus })
            }
            className={fieldClass}
          >
            {(Object.keys(statusLabels) as ApartmentStatus[]).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kati">
          <input
            required
            type="number"
            value={form.floor}
            onChange={(event) => setForm({ ...form, floor: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Siperfaqja m2">
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={form.area}
            onChange={(event) => setForm({ ...form, area: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Cmimi">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            className={fieldClass}
          />
        </Field>
      </div>
      <Field label="Forma e baneses">
        <div className="grid gap-2 sm:grid-cols-4">
          {(Object.keys(layoutShapeLabels) as ApartmentLayoutShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => setForm({ ...form, layoutShape: shape })}
              className={`rounded-md border p-3 text-left transition ${
                form.layoutShape === shape
                  ? "border-[#24211d] bg-white shadow-[0_14px_30px_-24px_rgba(36,33,29,0.9)]"
                  : "border-[#d8d2c6] bg-[#fbfaf7] hover:bg-white"
              }`}
            >
              <span
                className={`mb-3 block h-8 w-10 border border-current text-[#8f6a2e] ${shapeGlyphClass(shape)}`}
              />
              <span className="block text-sm font-semibold text-zinc-900">
                {layoutShapeLabels[shape]}
              </span>
              <span className="mt-1 block text-xs text-zinc-500">
                {layoutShapeDescriptions[shape]}
              </span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Pershkrimi">
        <textarea
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          className={`${fieldClass} min-h-24 py-3`}
        />
      </Field>
      <SubmitButton saving={saving} label={initial ? "Ruaj banesen" : "Shto banese"} />
    </form>
  );
}

export function ClientForm({
  apartments,
  initial,
  saving,
  onSubmit,
}: {
  apartments: Apartment[];
  initial?: Client | null;
  saving: boolean;
  onSubmit: (payload: ClientPayload) => void;
}) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    notes: initial?.notes ?? "",
    apartmentId: initial?.apartmentId ? String(initial.apartmentId) : "",
    contractPrice: initial?.contractPrice ? String(initial.contractPrice) : "",
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          apartmentId: form.apartmentId ? Number(form.apartmentId) : null,
          contractPrice: form.contractPrice ? Number(form.contractPrice) : null,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Emri">
          <input
            required
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Telefoni">
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Banesa">
          <select
            value={form.apartmentId}
            onChange={(event) => {
              const apartment = apartments.find((item) => item.id === Number(event.target.value));
              setForm({
                ...form,
                apartmentId: event.target.value,
                contractPrice: apartment ? String(apartment.price) : form.contractPrice,
              });
            }}
            className={fieldClass}
          >
            <option value="">Pa lidhje</option>
            {apartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.code} · {statusLabels[apartment.status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cmimi i kontrates">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.contractPrice}
            onChange={(event) => setForm({ ...form, contractPrice: event.target.value })}
            className={fieldClass}
          />
        </Field>
      </div>
      <Field label="Shenime">
        <textarea
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          className={`${fieldClass} min-h-24 py-3`}
        />
      </Field>
      <SubmitButton saving={saving} label={initial ? "Ruaj klientin" : "Shto klient"} />
    </form>
  );
}

export function PaymentForm({
  clients,
  apartments,
  initial,
  saving,
  onSubmit,
}: {
  clients: Client[];
  apartments: Apartment[];
  initial?: Payment | null;
  saving: boolean;
  onSubmit: (payload: PaymentPayload) => void;
}) {
  const linkedClients = clients.filter((client) => client.apartmentId);
  const [form, setForm] = useState({
    clientId: String(initial?.clientId ?? linkedClients[0]?.id ?? ""),
    apartmentId: String(initial?.apartmentId ?? linkedClients[0]?.apartmentId ?? ""),
    amount: String(initial?.amount ?? ""),
    paymentDate: initial?.paymentDate.slice(0, 10) ?? today(),
    paymentMethod: initial?.paymentMethod ?? "bank",
    note: initial?.note ?? "",
  });

  function setClient(clientId: string) {
    const client = clients.find((item) => item.id === Number(clientId));
    setForm({
      ...form,
      clientId,
      apartmentId: client?.apartmentId ? String(client.apartmentId) : form.apartmentId,
    });
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          clientId: Number(form.clientId),
          apartmentId: Number(form.apartmentId),
          amount: Number(form.amount),
          paymentDate: form.paymentDate,
          paymentMethod: form.paymentMethod,
          note: form.note,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Klienti">
          <select
            required
            value={form.clientId}
            onChange={(event) => setClient(event.target.value)}
            className={fieldClass}
          >
            <option value="">Zgjedh klientin</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Banesa">
          <select
            required
            value={form.apartmentId}
            onChange={(event) => setForm({ ...form, apartmentId: event.target.value })}
            className={fieldClass}
          >
            <option value="">Zgjedh banesen</option>
            {apartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Shuma">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Data">
          <input
            required
            type="date"
            value={form.paymentDate}
            onChange={(event) => setForm({ ...form, paymentDate: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Metoda">
          <select
            value={form.paymentMethod}
            onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
            className={fieldClass}
          >
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </Field>
      </div>
      <Field label="Pershkrimi">
        <textarea
          value={form.note}
          onChange={(event) => setForm({ ...form, note: event.target.value })}
          className={`${fieldClass} min-h-24 py-3`}
        />
      </Field>
      <SubmitButton saving={saving} label={initial ? "Ruaj pagesen" : "Regjistro pagese"} />
    </form>
  );
}

export function PhotoForm({
  apartments,
  saving,
  onSubmit,
}: {
  apartments: Apartment[];
  saving: boolean;
  onSubmit: (payload: PhotoPayload) => void;
}) {
  const [form, setForm] = useState({
    apartmentId: "",
    imageUrl: "",
    fileName: "",
    description: "",
    photoDate: today(),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const imageUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, imageUrl, fileName: file.name }));
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          apartmentId: form.apartmentId ? Number(form.apartmentId) : null,
          imageUrl: form.imageUrl || null,
          description: form.description,
          photoDate: form.photoDate,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data">
          <input
            required
            type="date"
            value={form.photoDate}
            onChange={(event) => setForm({ ...form, photoDate: event.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Banesa">
          <select
            value={form.apartmentId}
            onChange={(event) => setForm({ ...form, apartmentId: event.target.value })}
            className={fieldClass}
          >
            <option value="">Projekt i plote</option>
            {apartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.code}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Pershkrimi">
        <textarea
          required
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          className={`${fieldClass} min-h-24 py-3`}
        />
      </Field>
      <UploadField
        label="Upload foto ndertimi"
        hint="Kliko ose lesho fotografine ketu. Vetem imazhet pranohen."
        imageUrl={form.imageUrl}
        fileName={form.fileName}
        onFileChange={handleFile}
        onClear={() => setForm((current) => ({ ...current, imageUrl: "", fileName: "" }))}
      />
      <SubmitButton saving={saving} label="Shto foto" />
    </form>
  );
}
