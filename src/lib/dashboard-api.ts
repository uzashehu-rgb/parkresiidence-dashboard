import type {
  ApartmentPayload,
  ClientPayload,
  DashboardData,
  InvoicePayload,
  PaymentPayload,
  PhotoPayload,
} from "./dashboard-types";

const API_BASE =
  import.meta.env.VITE_DASHBOARD_API_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:8787/api" : "/api");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getDashboard() {
  return request<DashboardData>("/dashboard");
}

export function createInvoice(payload: InvoicePayload) {
  return request<DashboardData>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInvoice(id: number, payload: InvoicePayload) {
  return request<DashboardData>(`/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteInvoice(id: number) {
  return request<DashboardData>(`/invoices/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

export function createApartment(payload: ApartmentPayload) {
  return request<DashboardData>("/apartments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateApartment(id: number, payload: ApartmentPayload) {
  return request<DashboardData>(`/apartments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createClient(payload: ClientPayload) {
  return request<DashboardData>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClient(id: number, payload: ClientPayload) {
  return request<DashboardData>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteClient(id: number) {
  return request<DashboardData>(`/clients/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

export function createPayment(payload: PaymentPayload) {
  return request<DashboardData>("/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePayment(id: number, payload: PaymentPayload) {
  return request<DashboardData>(`/payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePayment(id: number) {
  return request<DashboardData>(`/payments/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

export function createPhoto(payload: PhotoPayload) {
  return request<DashboardData>("/photos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
