import http from "node:http";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const HOST = process.env.API_HOST ?? "127.0.0.1";
const PORT = Number(process.env.API_PORT ?? 8787);
const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://residence:residence@127.0.0.1:54329/residence_explorer";
const PUBLIC_API_ORIGIN = toOrigin(process.env.PUBLIC_API_ORIGIN);
const UPLOADS_ROOT = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"),
);
const UPLOADS_PREFIX = "/uploads";
const MAX_BODY_SIZE_BYTES = 15_000_000;
const MAX_IMAGE_SIZE_BYTES = 8_000_000;

const mimeExtensions = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const extensionTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const pool = new Pool({ connectionString: DATABASE_URL });

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

await mkdir(UPLOADS_ROOT, { recursive: true });

function sendJson(res, status, payload) {
  res.writeHead(status, {
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, message) {
  res.writeHead(status, {
    ...corsHeaders,
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end(message);
}

function sendNoContent(res) {
  res.writeHead(204, corsHeaders);
  res.end();
}

function toOrigin(value) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function requiredText(payload, key) {
  const value = toText(payload[key]);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function requiredNumber(payload, key) {
  const value = Number(payload[key]);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a number`);
  return value;
}

function nullableNumber(payload, key) {
  if (payload[key] === null || payload[key] === undefined || payload[key] === "") return null;
  const value = Number(payload[key]);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a number`);
  return value;
}

function requiredDate(payload, key) {
  const value = requiredText(payload, key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${key} must be YYYY-MM-DD`);
  return value;
}

function normalizeStatus(status) {
  const value = toText(status) || "available";
  if (!["available", "reserved", "sold"].includes(value)) {
    throw new Error("status must be available, reserved, or sold");
  }
  return value;
}

function normalizeLayoutShape(layoutShape) {
  const value = toText(layoutShape) || "standard";
  if (!["standard", "corner", "studio", "penthouse"].includes(value)) {
    throw new Error("layoutShape must be standard, corner, studio, or penthouse");
  }
  return value;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE_BYTES) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isDataUrl(value) {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value);
}

function extractStoredUploadPath(value, requestOrigin) {
  const text = toText(value);
  if (!text) return null;
  if (text.startsWith(`${UPLOADS_PREFIX}/`)) return text;

  if (!isHttpUrl(text)) return null;

  try {
    const url = new URL(text);
    if (!url.pathname.startsWith(`${UPLOADS_PREFIX}/`)) return null;

    const allowedOrigins = [requestOrigin, PUBLIC_API_ORIGIN].filter(Boolean);
    if (!allowedOrigins.length || allowedOrigins.includes(url.origin)) {
      return url.pathname;
    }
  } catch {
    return null;
  }

  return null;
}

function toPublicImageUrl(requestOrigin, value) {
  const text = toText(value);
  if (!text) return null;
  if (isHttpUrl(text) || text.startsWith("data:")) return text;

  const storedPath = extractStoredUploadPath(text, requestOrigin);
  if (!storedPath) return text;

  const origin = PUBLIC_API_ORIGIN ?? toOrigin(requestOrigin);
  return origin ? new URL(storedPath, origin).toString() : storedPath;
}

function parseImagePayload(dataUrl) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i.exec(dataUrl);
  if (!match) throw new Error("imageUrl must be a valid base64 image");

  const mimeType = match[1].toLowerCase();
  const extension = mimeExtensions[mimeType];
  if (!extension) {
    throw new Error("Unsupported image format");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) throw new Error("imageUrl is empty");
  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Uploaded image is too large");
  }

  return { buffer, extension };
}

async function storeImageDataUrl(dataUrl, bucket) {
  const { buffer, extension } = parseImagePayload(dataUrl);
  const directory = path.join(UPLOADS_ROOT, bucket);
  await mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(directory, filename);
  await writeFile(filePath, buffer);
  return `${UPLOADS_PREFIX}/${bucket}/${filename}`;
}

async function prepareImageUrl(rawValue, { bucket, requestOrigin, currentValue = null } = {}) {
  if (rawValue === undefined) {
    return { value: currentValue, createdPath: null, removeAfterCommit: null };
  }

  const value = toText(rawValue);
  const currentStoredPath = extractStoredUploadPath(currentValue, requestOrigin);

  if (!value) {
    return {
      value: null,
      createdPath: null,
      removeAfterCommit: currentStoredPath,
    };
  }

  const existingStoredPath = extractStoredUploadPath(value, requestOrigin);
  if (existingStoredPath) {
    return {
      value: existingStoredPath,
      createdPath: null,
      removeAfterCommit:
        currentStoredPath && currentStoredPath !== existingStoredPath ? currentStoredPath : null,
    };
  }

  if (isHttpUrl(value)) {
    return {
      value,
      createdPath: null,
      removeAfterCommit: currentStoredPath,
    };
  }

  if (!isDataUrl(value)) {
    throw new Error("imageUrl must be an uploaded image or absolute URL");
  }

  const createdPath = await storeImageDataUrl(value, bucket);
  return {
    value: createdPath,
    createdPath,
    removeAfterCommit:
      currentStoredPath && currentStoredPath !== createdPath ? currentStoredPath : null,
  };
}

async function removeStoredUpload(value) {
  const storedPath = extractStoredUploadPath(value);
  if (!storedPath) return;

  const filePath = path.resolve(UPLOADS_ROOT, `.${storedPath.slice(UPLOADS_PREFIX.length)}`);
  if (!filePath.startsWith(UPLOADS_ROOT)) return;

  await unlink(filePath).catch(() => undefined);
}

function resolveUploadPath(pathname) {
  if (!pathname.startsWith(`${UPLOADS_PREFIX}/`)) return null;
  const filePath = path.resolve(UPLOADS_ROOT, `.${pathname.slice(UPLOADS_PREFIX.length)}`);
  if (!filePath.startsWith(UPLOADS_ROOT)) return null;
  return filePath;
}

async function sendUpload(res, pathname, method) {
  const filePath = resolveUploadPath(pathname);
  if (!filePath) {
    sendText(res, 404, "Not found");
    return;
  }

  let info;
  try {
    info = await stat(filePath);
  } catch {
    sendText(res, 404, "Not found");
    return;
  }

  if (!info.isFile()) {
    sendText(res, 404, "Not found");
    return;
  }

  const contentType =
    extensionTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

  res.writeHead(200, {
    ...corsHeaders,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(info.size),
    "Content-Type": contentType,
  });

  if (method === "HEAD") {
    res.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      sendText(res, 500, "Failed to read file");
      return;
    }

    res.destroy();
  });
  stream.pipe(res);
}

async function withTransaction(handler) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await handler(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function logActivity(client, entityType, entityId, action, description) {
  await client.query(
    `insert into activity_logs (entity_type, entity_id, action, description)
     values ($1, $2, $3, $4)`,
    [entityType, entityId, action, description],
  );
}

async function ensureProjectId(client = pool) {
  const current = await client.query(`select id::int from projects order by id limit 1`);
  if (current.rows[0]) return current.rows[0].id;

  const created = await client.query(
    `insert into projects (name, description)
     values ('Residence Explorer', 'Dashboard lokal pa auth.')
     returning id::int`,
  );
  return created.rows[0].id;
}

async function getDashboardPayload(requestOrigin) {
  const projectId = await ensureProjectId();

  const [
    project,
    categories,
    invoices,
    apartments,
    clients,
    payments,
    schedules,
    photos,
    activity,
  ] = await Promise.all([
    pool.query(
      `select id::int, name, description, created_at as "createdAt"
       from projects
       where id = $1`,
      [projectId],
    ),
    pool.query(`select id::int, name from expense_categories order by id`),
    pool.query(
      `select
        i.id::int,
        i.project_id::int as "projectId",
        i.category_id::int as "categoryId",
        c.name as "categoryName",
        to_char(i.invoice_date, 'YYYY-MM-DD') as "invoiceDate",
        i.amount::float as amount,
        i.supplier,
        i.description,
        i.image_url as "imageUrl",
        i.created_at as "createdAt"
       from invoices i
       join expense_categories c on c.id = i.category_id
       where i.project_id = $1
       order by i.invoice_date desc, i.id desc`,
      [projectId],
    ),
    pool.query(
      `select
        id::int,
        project_id::int as "projectId",
        code,
        floor,
        area::float as area,
        price::float as price,
        status,
        coalesce(layout_shape, 'standard') as "layoutShape",
        description,
        created_at as "createdAt"
       from apartments
       where project_id = $1
       order by code`,
      [projectId],
    ),
    pool.query(
      `select
        c.id::int,
        c.full_name as "fullName",
        c.phone,
        c.email,
        c.notes,
        c.created_at as "createdAt",
        a.id::int as "apartmentId",
        a.code as "apartmentCode",
        ac.contract_price::float as "contractPrice",
        to_char(ac.reserved_at, 'YYYY-MM-DD') as "reservedAt",
        coalesce(paid.total_paid, 0)::float as "paidAmount",
        greatest(coalesce(ac.contract_price, 0) - coalesce(paid.total_paid, 0), 0)::float as "remainingAmount"
       from clients c
       left join lateral (
         select *
         from apartment_clients ac
         where ac.client_id = c.id
         order by ac.created_at desc
         limit 1
       ) ac on true
       left join apartments a on a.id = ac.apartment_id
       left join lateral (
         select sum(p.amount) as total_paid
         from payments p
         where p.client_id = c.id
           and (ac.apartment_id is null or p.apartment_id = ac.apartment_id)
       ) paid on true
       order by c.created_at desc, c.id desc`,
    ),
    pool.query(
      `select
        p.id::int,
        p.apartment_id::int as "apartmentId",
        a.code as "apartmentCode",
        p.client_id::int as "clientId",
        c.full_name as "clientName",
        p.amount::float as amount,
        to_char(p.payment_date, 'YYYY-MM-DD') as "paymentDate",
        p.payment_method as "paymentMethod",
        p.note,
        p.created_at as "createdAt"
       from payments p
       join apartments a on a.id = p.apartment_id
       join clients c on c.id = p.client_id
       order by p.payment_date desc, p.id desc`,
    ),
    pool.query(
      `select
        ps.id::int,
        ps.apartment_id::int as "apartmentId",
        a.code as "apartmentCode",
        ps.client_id::int as "clientId",
        c.full_name as "clientName",
        to_char(ps.due_date, 'YYYY-MM-DD') as "dueDate",
        ps.amount_due::float as "amountDue",
        case
          when ps.status <> 'paid' and ps.due_date < current_date then 'late'
          else ps.status
        end as status,
        ps.note,
        ps.created_at as "createdAt"
       from payment_schedules ps
       join apartments a on a.id = ps.apartment_id
       join clients c on c.id = ps.client_id
       order by ps.due_date asc, ps.id asc`,
    ),
    pool.query(
      `select
        cp.id::int,
        cp.project_id::int as "projectId",
        cp.apartment_id::int as "apartmentId",
        a.code as "apartmentCode",
        cp.image_url as "imageUrl",
        cp.description,
        to_char(cp.photo_date, 'YYYY-MM-DD') as "photoDate",
        cp.created_at as "createdAt"
       from construction_photos cp
       left join apartments a on a.id = cp.apartment_id
       where cp.project_id = $1
       order by cp.photo_date desc, cp.id desc`,
      [projectId],
    ),
    pool.query(
      `select
        id::int,
        entity_type as "entityType",
        entity_id::int as "entityId",
        action,
        description,
        created_at as "createdAt"
       from activity_logs
       order by created_at desc, id desc
       limit 40`,
    ),
  ]);

  const invoiceRows = invoices.rows.map((invoice) => ({
    ...invoice,
    imageUrl: toPublicImageUrl(requestOrigin, invoice.imageUrl),
  }));
  const paymentRows = payments.rows;
  const apartmentRows = apartments.rows;
  const scheduleRows = schedules.rows;
  const clientRows = clients.rows;
  const photoRows = photos.rows.map((photo) => ({
    ...photo,
    imageUrl: toPublicImageUrl(requestOrigin, photo.imageUrl),
  }));

  const totalExpenses = invoiceRows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const totalPayments = paymentRows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const statusCounts = apartmentRows.reduce(
    (acc, row) => {
      acc[row.status] += 1;
      return acc;
    },
    { available: 0, reserved: 0, sold: 0 },
  );
  const overduePayments = scheduleRows.filter((row) => row.status === "late").length;

  const expensesByCategory = categories.rows.map((category) => ({
    categoryId: category.id,
    categoryName: category.name,
    total: invoiceRows
      .filter((invoice) => invoice.categoryId === category.id)
      .reduce((sum, invoice) => sum + toNumber(invoice.amount), 0),
  }));

  const monthlyMap = new Map();
  for (const invoice of invoiceRows) {
    const month = String(invoice.invoiceDate).slice(0, 7);
    const current = monthlyMap.get(month) ?? { month, expenses: 0, payments: 0 };
    current.expenses += toNumber(invoice.amount);
    monthlyMap.set(month, current);
  }
  for (const payment of paymentRows) {
    const month = String(payment.paymentDate).slice(0, 7);
    const current = monthlyMap.get(month) ?? { month, expenses: 0, payments: 0 };
    current.payments += toNumber(payment.amount);
    monthlyMap.set(month, current);
  }

  const clientsWithDebt = clientRows
    .filter((client) => toNumber(client.remainingAmount) > 0)
    .sort((a, b) => toNumber(b.remainingAmount) - toNumber(a.remainingAmount))
    .slice(0, 8);

  return {
    project: project.rows[0],
    categories: categories.rows,
    invoices: invoiceRows,
    apartments: apartmentRows,
    clients: clientRows,
    payments: paymentRows,
    paymentSchedules: scheduleRows,
    constructionPhotos: photoRows,
    activityLogs: activity.rows,
    summary: {
      totalExpenses,
      totalPayments,
      currentProfit: totalPayments - totalExpenses,
      apartmentCount: apartmentRows.length,
      availableApartments: statusCounts.available,
      reservedApartments: statusCounts.reserved,
      soldApartments: statusCounts.sold,
      overduePayments,
    },
    analytics: {
      expensesByCategory,
      monthlyCashflow: [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month)),
      clientsWithDebt,
      recentPayments: paymentRows.slice(0, 6),
    },
  };
}

async function createInvoice(payload, requestOrigin) {
  const imageAsset = await prepareImageUrl(payload.imageUrl, {
    bucket: "invoices",
    requestOrigin,
  });

  try {
    await withTransaction(async (client) => {
      const projectId = await ensureProjectId(client);
      const categoryId = requiredNumber(payload, "categoryId");
      const invoiceDate = requiredDate(payload, "invoiceDate");
      const amount = requiredNumber(payload, "amount");
      const supplier = requiredText(payload, "supplier");
      const description = toText(payload.description);

      const result = await client.query(
        `insert into invoices (project_id, category_id, invoice_date, amount, supplier, description, image_url)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning id::int`,
        [projectId, categoryId, invoiceDate, amount, supplier, description, imageAsset.value],
      );
      await logActivity(
        client,
        "invoice",
        result.rows[0].id,
        "created",
        `U shtua fature ${supplier} ne vlere ${amount.toLocaleString("en-US")}.`,
      );
    });
  } catch (error) {
    if (imageAsset.createdPath) {
      await removeStoredUpload(imageAsset.createdPath);
    }
    throw error;
  }

  return getDashboardPayload(requestOrigin);
}

async function updateInvoice(id, payload, requestOrigin) {
  const current = await pool.query(`select image_url from invoices where id = $1`, [id]);
  if (!current.rows[0]) throw new Error("Invoice not found");

  const imageAsset = await prepareImageUrl(payload.imageUrl, {
    bucket: "invoices",
    requestOrigin,
    currentValue: current.rows[0].image_url ?? null,
  });

  try {
    await withTransaction(async (client) => {
      const categoryId = requiredNumber(payload, "categoryId");
      const invoiceDate = requiredDate(payload, "invoiceDate");
      const amount = requiredNumber(payload, "amount");
      const supplier = requiredText(payload, "supplier");
      const description = toText(payload.description);

      await client.query(
        `update invoices
         set category_id = $1,
             invoice_date = $2,
             amount = $3,
             supplier = $4,
             description = $5,
             image_url = $6
         where id = $7`,
        [categoryId, invoiceDate, amount, supplier, description, imageAsset.value, id],
      );
      await logActivity(client, "invoice", id, "updated", `U perditesua fatura nga ${supplier}.`);
    });
  } catch (error) {
    if (imageAsset.createdPath) {
      await removeStoredUpload(imageAsset.createdPath);
    }
    throw error;
  }

  if (imageAsset.removeAfterCommit) {
    await removeStoredUpload(imageAsset.removeAfterCommit);
  }

  return getDashboardPayload(requestOrigin);
}

async function deleteInvoice(id, requestOrigin) {
  const current = await pool.query(`select image_url from invoices where id = $1`, [id]);
  const imageUrl = current.rows[0]?.image_url ?? null;

  await withTransaction(async (client) => {
    await client.query(`delete from invoices where id = $1`, [id]);
    await logActivity(client, "invoice", id, "deleted", "U fshi nje fature nga lista.");
  });

  if (imageUrl) {
    await removeStoredUpload(imageUrl);
  }

  return getDashboardPayload(requestOrigin);
}

async function createApartment(payload, requestOrigin) {
  await withTransaction(async (client) => {
    const projectId = await ensureProjectId(client);
    const code = requiredText(payload, "code").toUpperCase();
    const floor = requiredNumber(payload, "floor");
    const area = requiredNumber(payload, "area");
    const price = requiredNumber(payload, "price");
    const status = normalizeStatus(payload.status);
    const layoutShape = normalizeLayoutShape(payload.layoutShape);
    const description = toText(payload.description);

    const result = await client.query(
      `insert into apartments (project_id, code, floor, area, price, status, layout_shape, description)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id::int`,
      [projectId, code, floor, area, price, status, layoutShape, description],
    );
    await logActivity(client, "apartment", result.rows[0].id, "created", `U shtua banesa ${code}.`);
  });
  return getDashboardPayload(requestOrigin);
}

async function updateApartment(id, payload, requestOrigin) {
  await withTransaction(async (client) => {
    const code = requiredText(payload, "code").toUpperCase();
    const floor = requiredNumber(payload, "floor");
    const area = requiredNumber(payload, "area");
    const price = requiredNumber(payload, "price");
    const status = normalizeStatus(payload.status);
    const layoutShape = normalizeLayoutShape(payload.layoutShape);
    const description = toText(payload.description);

    await client.query(
      `update apartments
       set code = $1,
           floor = $2,
           area = $3,
           price = $4,
           status = $5,
           layout_shape = $6,
           description = $7
       where id = $8`,
      [code, floor, area, price, status, layoutShape, description, id],
    );
    await logActivity(
      client,
      "apartment",
      id,
      "status_changed",
      `${code} u ndryshua ne ${status}.`,
    );
  });
  return getDashboardPayload(requestOrigin);
}

async function createClient(payload, requestOrigin) {
  await withTransaction(async (client) => {
    const fullName = requiredText(payload, "fullName");
    const phone = toText(payload.phone);
    const email = toText(payload.email);
    const notes = toText(payload.notes);
    const apartmentId = nullableNumber(payload, "apartmentId");
    const contractPrice = nullableNumber(payload, "contractPrice");

    const result = await client.query(
      `insert into clients (full_name, phone, email, notes)
       values ($1, $2, $3, $4)
       returning id::int`,
      [fullName, phone, email, notes],
    );
    const clientId = result.rows[0].id;

    if (apartmentId && contractPrice !== null) {
      await client.query(
        `insert into apartment_clients (apartment_id, client_id, contract_price)
         values ($1, $2, $3)`,
        [apartmentId, clientId, contractPrice],
      );
      await client.query(
        `update apartments
         set status = case when status = 'sold' then status else 'reserved' end
         where id = $1`,
        [apartmentId],
      );
    }

    await logActivity(client, "client", clientId, "created", `U shtua klienti ${fullName}.`);
  });
  return getDashboardPayload(requestOrigin);
}

async function updateClient(id, payload, requestOrigin) {
  await withTransaction(async (client) => {
    const fullName = requiredText(payload, "fullName");
    const phone = toText(payload.phone);
    const email = toText(payload.email);
    const notes = toText(payload.notes);
    const apartmentId = nullableNumber(payload, "apartmentId");
    const contractPrice = nullableNumber(payload, "contractPrice");

    const previousLinks = await client.query(
      `select distinct apartment_id::int as id
       from apartment_clients
       where client_id = $1`,
      [id],
    );

    await client.query(
      `update clients
       set full_name = $1,
           phone = $2,
           email = $3,
           notes = $4
       where id = $5`,
      [fullName, phone, email, notes, id],
    );

    await client.query(`delete from apartment_clients where client_id = $1`, [id]);

    if (apartmentId && contractPrice !== null) {
      await client.query(
        `insert into apartment_clients (apartment_id, client_id, contract_price)
         values ($1, $2, $3)`,
        [apartmentId, id, contractPrice],
      );
      await client.query(
        `update apartments
         set status = case when status = 'sold' then status else 'reserved' end
         where id = $1`,
        [apartmentId],
      );
    }

    for (const row of previousLinks.rows) {
      if (row.id === apartmentId) continue;
      await client.query(
        `update apartments a
         set status = 'available'
         where a.id = $1
           and a.status = 'reserved'
           and not exists (
             select 1
             from apartment_clients ac
             where ac.apartment_id = a.id
           )`,
        [row.id],
      );
    }

    await logActivity(client, "client", id, "updated", `U perditesua klienti ${fullName}.`);
  });
  return getDashboardPayload(requestOrigin);
}

async function deleteClient(id, requestOrigin) {
  await withTransaction(async (client) => {
    const linkedApartments = await client.query(
      `select distinct apartment_id::int as id
       from apartment_clients
       where client_id = $1`,
      [id],
    );
    const current = await client.query(`select full_name from clients where id = $1`, [id]);
    const fullName = current.rows[0]?.full_name ?? "klient";

    await client.query(`delete from clients where id = $1`, [id]);

    for (const row of linkedApartments.rows) {
      await client.query(
        `update apartments a
         set status = 'available'
         where a.id = $1
           and a.status = 'reserved'
           and not exists (
             select 1
             from apartment_clients ac
             where ac.apartment_id = a.id
           )`,
        [row.id],
      );
    }

    await logActivity(client, "client", id, "deleted", `U fshi klienti ${fullName}.`);
  });
  return getDashboardPayload(requestOrigin);
}

async function createPayment(payload, requestOrigin) {
  await withTransaction(async (client) => {
    const apartmentId = requiredNumber(payload, "apartmentId");
    const clientId = requiredNumber(payload, "clientId");
    const amount = requiredNumber(payload, "amount");
    const paymentDate = requiredDate(payload, "paymentDate");
    const paymentMethod = requiredText(payload, "paymentMethod");
    const note = toText(payload.note);

    const result = await client.query(
      `insert into payments (apartment_id, client_id, amount, payment_date, payment_method, note)
       values ($1, $2, $3, $4, $5, $6)
       returning id::int`,
      [apartmentId, clientId, amount, paymentDate, paymentMethod, note],
    );
    await logActivity(
      client,
      "payment",
      result.rows[0].id,
      "created",
      `U regjistrua pagese ne vlere ${amount.toLocaleString("en-US")}.`,
    );
  });
  return getDashboardPayload(requestOrigin);
}

async function updatePayment(id, payload, requestOrigin) {
  await withTransaction(async (client) => {
    const apartmentId = requiredNumber(payload, "apartmentId");
    const clientId = requiredNumber(payload, "clientId");
    const amount = requiredNumber(payload, "amount");
    const paymentDate = requiredDate(payload, "paymentDate");
    const paymentMethod = requiredText(payload, "paymentMethod");
    const note = toText(payload.note);

    await client.query(
      `update payments
       set apartment_id = $1,
           client_id = $2,
           amount = $3,
           payment_date = $4,
           payment_method = $5,
           note = $6
       where id = $7`,
      [apartmentId, clientId, amount, paymentDate, paymentMethod, note, id],
    );
    await logActivity(
      client,
      "payment",
      id,
      "updated",
      `U perditesua pagesa ne vlere ${amount.toLocaleString("en-US")}.`,
    );
  });
  return getDashboardPayload(requestOrigin);
}

async function deletePayment(id, requestOrigin) {
  await withTransaction(async (client) => {
    await client.query(`delete from payments where id = $1`, [id]);
    await logActivity(client, "payment", id, "deleted", "U fshi nje pagese nga historiku.");
  });
  return getDashboardPayload(requestOrigin);
}

async function createSchedule(payload, requestOrigin) {
  await withTransaction(async (client) => {
    const apartmentId = requiredNumber(payload, "apartmentId");
    const clientId = requiredNumber(payload, "clientId");
    const dueDate = requiredDate(payload, "dueDate");
    const amountDue = requiredNumber(payload, "amountDue");
    const status = toText(payload.status) || "pending";
    if (!["pending", "paid", "late"].includes(status)) {
      throw new Error("schedule status must be pending, paid, or late");
    }
    const note = toText(payload.note);

    const result = await client.query(
      `insert into payment_schedules (apartment_id, client_id, due_date, amount_due, status, note)
       values ($1, $2, $3, $4, $5, $6)
       returning id::int`,
      [apartmentId, clientId, dueDate, amountDue, status, note],
    );
    await logActivity(
      client,
      "payment_schedule",
      result.rows[0].id,
      "created",
      "U shtua afat pagese.",
    );
  });
  return getDashboardPayload(requestOrigin);
}

async function createPhoto(payload, requestOrigin) {
  const imageAsset = await prepareImageUrl(payload.imageUrl, {
    bucket: "progress",
    requestOrigin,
  });
  if (!imageAsset.value) {
    throw new Error("imageUrl is required");
  }

  try {
    await withTransaction(async (client) => {
      const projectId = await ensureProjectId(client);
      const apartmentId = nullableNumber(payload, "apartmentId");
      const description = requiredText(payload, "description");
      const photoDate = requiredDate(payload, "photoDate");

      const result = await client.query(
        `insert into construction_photos (project_id, apartment_id, image_url, description, photo_date)
         values ($1, $2, $3, $4, $5)
         returning id::int`,
        [projectId, apartmentId, imageAsset.value, description, photoDate],
      );
      await logActivity(
        client,
        "construction_photo",
        result.rows[0].id,
        "created",
        "U shtua foto e re nga ndertimi.",
      );
    });
  } catch (error) {
    if (imageAsset.createdPath) {
      await removeStoredUpload(imageAsset.createdPath);
    }
    throw error;
  }

  return getDashboardPayload(requestOrigin);
}

function parseId(parts, index = 2) {
  const id = Number(parts[index]);
  if (!Number.isInteger(id) || id < 1) throw new Error("Invalid id");
  return id;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (
      (req.method === "GET" || req.method === "HEAD") &&
      url.pathname.startsWith(`${UPLOADS_PREFIX}/`)
    ) {
      await sendUpload(res, url.pathname, req.method);
      return;
    }

    if (parts[0] !== "api") {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    if (req.method === "GET" && parts[1] === "health") {
      await pool.query("select 1");
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && parts[1] === "dashboard") {
      sendJson(res, 200, await getDashboardPayload(url.origin));
      return;
    }

    const payload = ["POST", "PATCH", "DELETE"].includes(req.method ?? "")
      ? await readBody(req)
      : {};

    if (req.method === "POST" && parts[1] === "invoices") {
      sendJson(res, 201, await createInvoice(payload, url.origin));
      return;
    }
    if (req.method === "PATCH" && parts[1] === "invoices") {
      sendJson(res, 200, await updateInvoice(parseId(parts), payload, url.origin));
      return;
    }
    if (req.method === "DELETE" && parts[1] === "invoices") {
      sendJson(res, 200, await deleteInvoice(parseId(parts), url.origin));
      return;
    }
    if (req.method === "POST" && parts[1] === "apartments") {
      sendJson(res, 201, await createApartment(payload, url.origin));
      return;
    }
    if (req.method === "PATCH" && parts[1] === "apartments") {
      sendJson(res, 200, await updateApartment(parseId(parts), payload, url.origin));
      return;
    }
    if (req.method === "POST" && parts[1] === "clients") {
      sendJson(res, 201, await createClient(payload, url.origin));
      return;
    }
    if (req.method === "PATCH" && parts[1] === "clients") {
      sendJson(res, 200, await updateClient(parseId(parts), payload, url.origin));
      return;
    }
    if (req.method === "DELETE" && parts[1] === "clients") {
      sendJson(res, 200, await deleteClient(parseId(parts), url.origin));
      return;
    }
    if (req.method === "POST" && parts[1] === "payments") {
      sendJson(res, 201, await createPayment(payload, url.origin));
      return;
    }
    if (req.method === "PATCH" && parts[1] === "payments") {
      sendJson(res, 200, await updatePayment(parseId(parts), payload, url.origin));
      return;
    }
    if (req.method === "DELETE" && parts[1] === "payments") {
      sendJson(res, 200, await deletePayment(parseId(parts), url.origin));
      return;
    }
    if (req.method === "POST" && parts[1] === "payment-schedules") {
      sendJson(res, 201, await createSchedule(payload, url.origin));
      return;
    }
    if (req.method === "POST" && parts[1] === "photos") {
      sendJson(res, 201, await createPhoto(payload, url.origin));
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error(message);
    sendJson(res, 400, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Residence Explorer API running on http://${HOST}:${PORT}`);
});

process.on("SIGINT", async () => {
  await pool.end();
  server.close(() => process.exit(0));
});
