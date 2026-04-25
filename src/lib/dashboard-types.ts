export type ApartmentStatus = "available" | "reserved" | "sold";
export type ApartmentLayoutShape = "standard" | "corner" | "studio" | "penthouse";
export type PaymentScheduleStatus = "pending" | "paid" | "late";

export type Project = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
};

export type ExpenseCategory = {
  id: number;
  name: string;
};

export type Invoice = {
  id: number;
  projectId: number;
  categoryId: number;
  categoryName: string;
  invoiceDate: string;
  amount: number;
  supplier: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
};

export type Apartment = {
  id: number;
  projectId: number;
  code: string;
  floor: number;
  area: number;
  price: number;
  status: ApartmentStatus;
  layoutShape: ApartmentLayoutShape;
  description: string;
  createdAt: string;
};

export type Client = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
  apartmentId: number | null;
  apartmentCode: string | null;
  contractPrice: number;
  reservedAt: string | null;
  paidAmount: number;
  remainingAmount: number;
};

export type Payment = {
  id: number;
  apartmentId: number;
  apartmentCode: string;
  clientId: number;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  note: string;
  createdAt: string;
};

export type PaymentSchedule = {
  id: number;
  apartmentId: number;
  apartmentCode: string;
  clientId: number;
  clientName: string;
  dueDate: string;
  amountDue: number;
  status: PaymentScheduleStatus;
  note: string;
  createdAt: string;
};

export type ConstructionPhoto = {
  id: number;
  projectId: number;
  apartmentId: number | null;
  apartmentCode: string | null;
  imageUrl: string | null;
  description: string;
  photoDate: string;
  createdAt: string;
};

export type ActivityLog = {
  id: number;
  entityType: string;
  entityId: number | null;
  action: string;
  description: string;
  createdAt: string;
};

export type DashboardSummary = {
  totalExpenses: number;
  totalPayments: number;
  currentProfit: number;
  apartmentCount: number;
  availableApartments: number;
  reservedApartments: number;
  soldApartments: number;
  overduePayments: number;
};

export type DashboardAnalytics = {
  expensesByCategory: Array<{
    categoryId: number;
    categoryName: string;
    total: number;
  }>;
  monthlyCashflow: Array<{
    month: string;
    expenses: number;
    payments: number;
  }>;
  clientsWithDebt: Client[];
  recentPayments: Payment[];
};

export type DashboardData = {
  project: Project;
  categories: ExpenseCategory[];
  invoices: Invoice[];
  apartments: Apartment[];
  clients: Client[];
  payments: Payment[];
  paymentSchedules: PaymentSchedule[];
  constructionPhotos: ConstructionPhoto[];
  activityLogs: ActivityLog[];
  summary: DashboardSummary;
  analytics: DashboardAnalytics;
};

export type InvoicePayload = {
  categoryId: number;
  invoiceDate: string;
  amount: number;
  supplier: string;
  description: string;
  imageUrl?: string | null;
};

export type ApartmentPayload = {
  code: string;
  floor: number;
  area: number;
  price: number;
  status: ApartmentStatus;
  layoutShape: ApartmentLayoutShape;
  description: string;
};

export type ClientPayload = {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  apartmentId?: number | null;
  contractPrice?: number | null;
};

export type PaymentPayload = {
  apartmentId: number;
  clientId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  note: string;
};

export type PhotoPayload = {
  apartmentId?: number | null;
  imageUrl?: string | null;
  description: string;
  photoDate: string;
};
