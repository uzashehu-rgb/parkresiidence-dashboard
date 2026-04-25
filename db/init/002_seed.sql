insert into projects (id, name, description)
values
  (1, 'Park Residence', 'Dashboard lokal per menaxhim te banesave, faturave, klienteve dhe progresit te ndertimit.')
on conflict (id) do nothing;

insert into expense_categories (id, name)
values
  (1, 'beton'),
  (2, 'hekur'),
  (3, 'punetore'),
  (4, 'tjera')
on conflict (id) do nothing;

insert into invoices (project_id, category_id, invoice_date, amount, supplier, description, image_url)
values
  (1, 1, '2026-01-12', 18500.00, 'BetonPro Sh.p.k.', 'Plaka e bodrumit dhe themelet', null),
  (1, 2, '2026-01-28', 9600.00, 'Metal Kosova', 'Armature per kolonat kryesore', null),
  (1, 3, '2026-02-10', 7200.00, 'Ekipi Ndertimi A', 'Pagesa javore per punetore', null),
  (1, 1, '2026-02-21', 14200.00, 'BetonPro Sh.p.k.', 'Betonim kati perdhese', null),
  (1, 4, '2026-03-03', 3100.00, 'Logistika Liria', 'Transport dhe makineri te vogla', null),
  (1, 2, '2026-03-18', 11800.00, 'Metal Kosova', 'Hekur shtese per shkallet', null),
  (1, 3, '2026-04-05', 8300.00, 'Ekipi Ndertimi B', 'Punetore per fasade dhe instalime', null),
  (1, 4, '2026-04-14', 2450.00, 'ElektroPlan', 'Materiale elektrike fillestare', null)
on conflict do nothing;

insert into apartments (project_id, code, floor, area, price, status, layout_shape, description)
values
  (1, 'A-101', 1, 72.40, 108600.00, 'sold', 'standard', 'Dy dhoma gjumi, orientim jug-lindje.'),
  (1, 'A-102', 1, 64.10, 96150.00, 'reserved', 'studio', 'Plan kompakt me ballkon te gjere.'),
  (1, 'A-201', 2, 84.80, 135680.00, 'available', 'corner', 'Pamje nga parku dhe ambient ditor i hapur.'),
  (1, 'A-202', 2, 58.70, 88050.00, 'available', 'studio', 'Zgjidhje ideale per investim.'),
  (1, 'B-301', 3, 91.30, 155210.00, 'reserved', 'corner', 'Korner apartment me drite natyrale.'),
  (1, 'B-302', 3, 76.00, 125400.00, 'sold', 'standard', 'Plan familjar me depo dhe dy banjo.'),
  (1, 'B-401', 4, 102.20, 183960.00, 'available', 'penthouse', 'Penthouse kompakt me terrace private.'),
  (1, 'B-402', 4, 69.50, 118150.00, 'available', 'standard', 'Orientim perendimor dhe qasje te shpejte ne lift.')
on conflict (project_id, code) do nothing;

insert into clients (id, full_name, phone, email, notes)
values
  (1, 'Arben Krasniqi', '+383 44 111 222', 'arben@example.com', 'Kontrate e nenshkruar per A-101.'),
  (2, 'Elira Berisha', '+383 45 333 444', 'elira@example.com', 'Rezervim aktiv, pret planin e kesteve.'),
  (3, 'Driton Gashi', '+383 49 555 666', 'driton@example.com', 'Interesim per katin e trete.'),
  (4, 'Nora Hoti', '+383 43 777 888', 'nora@example.com', 'Pagese fillestare e kryer.')
on conflict (id) do nothing;

insert into apartment_clients (apartment_id, client_id, contract_price, reserved_at)
values
  (1, 1, 108600.00, '2026-01-20'),
  (2, 2, 96150.00, '2026-03-11'),
  (5, 3, 155210.00, '2026-04-02'),
  (6, 4, 125400.00, '2026-02-16')
on conflict do nothing;

insert into payments (apartment_id, client_id, amount, payment_date, payment_method, note)
values
  (1, 1, 25000.00, '2026-01-25', 'bank', 'Parapagim'),
  (1, 1, 30000.00, '2026-03-01', 'bank', 'Kesti i pare'),
  (2, 2, 10000.00, '2026-03-15', 'cash', 'Rezervim'),
  (6, 4, 40000.00, '2026-02-20', 'bank', 'Parapagim'),
  (6, 4, 25000.00, '2026-04-06', 'bank', 'Kesti i dyte'),
  (5, 3, 15000.00, '2026-04-08', 'bank', 'Rezervim')
on conflict do nothing;

insert into payment_schedules (apartment_id, client_id, due_date, amount_due, status, note)
values
  (1, 1, '2026-03-15', 20000.00, 'paid', 'Kest i mbuluar nga pagesa e marsit'),
  (1, 1, '2026-04-15', 18000.00, 'late', 'Afat i kaluar'),
  (2, 2, '2026-04-10', 15000.00, 'late', 'Duhet kontaktuar klienti'),
  (5, 3, '2026-05-02', 25000.00, 'pending', 'Kesti pas rezervimit'),
  (6, 4, '2026-04-25', 20000.00, 'pending', 'Kesti i radhes')
on conflict do nothing;

insert into construction_photos (project_id, apartment_id, image_url, description, photo_date)
values
  (1, null, null, 'Perfunduar struktura e katit te dyte.', '2026-03-26'),
  (1, 5, null, 'Kontroll i instalimeve ne B-301.', '2026-04-09'),
  (1, null, null, 'Filluar pergatitja per fasaden jugore.', '2026-04-16')
on conflict do nothing;

insert into activity_logs (entity_type, entity_id, action, description, created_at)
values
  ('invoice', 8, 'created', 'U shtua fature per materiale elektrike.', '2026-04-14 09:30:00+00'),
  ('apartment', 5, 'status_changed', 'B-301 u ndryshua ne e rezervuar.', '2026-04-02 11:10:00+00'),
  ('payment', 6, 'created', 'U regjistrua pagese nga Driton Gashi.', '2026-04-08 14:20:00+00'),
  ('construction_photo', 3, 'created', 'U shtua foto e re nga fasada.', '2026-04-16 16:45:00+00')
on conflict do nothing;

select setval('projects_id_seq', coalesce((select max(id) from projects), 1), true);
select setval('expense_categories_id_seq', coalesce((select max(id) from expense_categories), 1), true);
select setval('invoices_id_seq', coalesce((select max(id) from invoices), 1), true);
select setval('apartments_id_seq', coalesce((select max(id) from apartments), 1), true);
select setval('clients_id_seq', coalesce((select max(id) from clients), 1), true);
select setval('apartment_clients_id_seq', coalesce((select max(id) from apartment_clients), 1), true);
select setval('payments_id_seq', coalesce((select max(id) from payments), 1), true);
select setval('payment_schedules_id_seq', coalesce((select max(id) from payment_schedules), 1), true);
select setval('construction_photos_id_seq', coalesce((select max(id) from construction_photos), 1), true);
select setval('activity_logs_id_seq', coalesce((select max(id) from activity_logs), 1), true);
