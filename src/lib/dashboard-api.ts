import type {
  ApartmentPayload,
  AuthSession,
  ClientPayload,
  CreateUserPayload,
  DashboardData,
  DashboardViewer,
  InvoicePayload,
  ManagedUser,
  PaymentPayload,
  PhotoPayload,
} from "./dashboard-types";

const API_BASE =
  import.meta.env.VITE_DASHBOARD_API_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:8787/api" : "/api");

const AUTH_TOKEN_KEY = "park-residence-session-token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options: { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init?.headers);
  const useAuth = options.auth !== false;
  const token = useAuth ? getAuthToken() : null;

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? `Request failed with ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

export function login(email: string, password: string) {
  return request<AuthSession>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { auth: false },
  );
}

export function getSession() {
  return request<DashboardViewer>("/auth/session");
}

export function logout() {
  return request<{ ok: true }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getDashboard() {
  return request<DashboardData>("/dashboard");
}

export function listUsers() {
  return request<{ users: ManagedUser[] }>("/users");
}

export function createUser(payload: CreateUserPayload) {
  return request<{ users: ManagedUser[] }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
