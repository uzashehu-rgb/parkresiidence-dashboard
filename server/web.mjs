import http from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import startServer from "../dist/server/server.js";

const HOST = process.env.WEB_HOST ?? "0.0.0.0";
const PORT = Number(process.env.WEB_PORT ?? 3000);

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

const server = http.createServer(async (req, res) => {
  try {
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
