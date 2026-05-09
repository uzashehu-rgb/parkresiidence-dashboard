import fs from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

import startServer from "../dist/server/server.js";

const HOST = process.env.WEB_HOST ?? "0.0.0.0";
const PORT = Number(process.env.WEB_PORT ?? 3000);
const CLIENT_DIST_DIR = path.resolve(fileURLToPath(new URL("../dist/client/", import.meta.url)));

const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function toRequest(req) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }

    if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const init = {
    method: req.method,
    headers,
  };

  if (req.method && !["GET", "HEAD"].includes(req.method)) {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function writeResponse(res, response, method) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body || method === "HEAD") {
    res.end();
    return;
  }

  await pipeline(Readable.fromWeb(response.body), res);
}

function getContentType(filePath) {
  return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

async function tryServeStaticAsset(req, res) {
  const method = req.method ?? "GET";
  if (!["GET", "HEAD"].includes(method)) {
    return false;
  }

  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
  const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
  if (!relativePath) {
    return false;
  }

  const filePath = path.resolve(CLIENT_DIST_DIR, relativePath);
  const clientRootPrefix = `${CLIENT_DIST_DIR}${path.sep}`;
  if (filePath !== CLIENT_DIST_DIR && !filePath.startsWith(clientRootPrefix)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return true;
  }

  let fileInfo;
  try {
    fileInfo = await stat(filePath);
  } catch {
    return false;
  }

  if (!fileInfo.isFile()) {
    return false;
  }

  res.writeHead(200, {
    "Cache-Control": requestUrl.pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600",
    "Content-Length": fileInfo.size,
    "Content-Type": getContentType(filePath),
  });

  if (method === "HEAD") {
    res.end();
    return true;
  }

  await pipeline(fs.createReadStream(filePath), res);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    if (await tryServeStaticAsset(req, res)) {
      return;
    }

    const response = await startServer.fetch(toRequest(req));
    await writeResponse(res, response, req.method ?? "GET");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected web server error";
    console.error(message);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Residence Explorer web running on http://${HOST}:${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
