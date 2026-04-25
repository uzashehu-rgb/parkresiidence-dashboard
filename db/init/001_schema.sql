create table if not exists projects (
  id bigserial primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists expense_categories (
  id bigserial primary key,
  name text not null unique
);

create table if not exists invoices (
  id bigserial primary key,
  project_id bigint not null references projects(id) on delete cascade,
  category_id bigint not null references expense_categories(id),
  invoice_date date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  supplier text not null default '',
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists apartments (
  id bigserial primary key,
  project_id bigint not null references projects(id) on delete cascade,
  code text not null,
  floor integer not null default 1,
  area numeric(8, 2) not null check (area > 0),
  price numeric(12, 2) not null check (price >= 0),
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  layout_shape text not null default 'standard' check (layout_shape in ('standard', 'corner', 'studio', 'penthouse')),
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (project_id, code)
);

create table if not exists clients (
  id bigserial primary key,
  full_name text not null,
  phone text not null default '',
  email text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists apartment_clients (
  id bigserial primary key,
  apartment_id bigint not null references apartments(id) on delete cascade,
  client_id bigint not null references clients(id) on delete cascade,
  contract_price numeric(12, 2) not null check (contract_price >= 0),
  reserved_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id bigserial primary key,
  apartment_id bigint not null references apartments(id) on delete cascade,
  client_id bigint not null references clients(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_date date not null,
  payment_method text not null default 'bank',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists payment_schedules (
  id bigserial primary key,
  apartment_id bigint not null references apartments(id) on delete cascade,
  client_id bigint not null references clients(id) on delete cascade,
  due_date date not null,
  amount_due numeric(12, 2) not null check (amount_due >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'late')),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists construction_photos (
  id bigserial primary key,
  project_id bigint not null references projects(id) on delete cascade,
  apartment_id bigint references apartments(id) on delete set null,
  image_url text,
  description text not null default '',
  photo_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id bigserial primary key,
  entity_type text not null,
  entity_id bigint,
  action text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists invoices_project_date_idx on invoices(project_id, invoice_date desc);
create index if not exists invoices_category_idx on invoices(category_id);
create index if not exists apartments_project_status_idx on apartments(project_id, status);
create index if not exists apartment_clients_apartment_idx on apartment_clients(apartment_id);
create index if not exists payments_client_date_idx on payments(client_id, payment_date desc);
create index if not exists payment_schedules_due_status_idx on payment_schedules(due_date, status);
create index if not exists construction_photos_project_date_idx on construction_photos(project_id, photo_date desc);
create index if not exists activity_logs_created_idx on activity_logs(created_at desc);
