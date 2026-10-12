// Usage: node frontend/dev/screenshot.mjs [out.png] [query] [width]
// Serves the repo root and screenshots frontend/dev/index.html with the local Edge/Chrome.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = normalize(join(import.meta.dirname, "..", ".."));
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = createServer(async (req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (!path.startsWith(root)) return res.writeHead(403).end();
  let body;
  try {
    body = await readFile(path);
  } catch {
    return res.writeHead(404).end();
  }
  res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
  res.end(body);
}).listen(0);
const port = server.address().port;

const [out = "frontend/dev/card.png", query = "", width = "720", script = ""] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
page.on("pageerror", (e) => console.error("pageerror:", e.message));
page.on("console", (m) => m.type() === "error" && console.error("console:", m.text()));
await page.goto(`http://localhost:${port}/frontend/dev/index.html?${query}`);
await page.waitForTimeout(600);
if (script) {
  const mod = await import(pathToFileURL(resolve(script)).href);
  await mod.default(page);
  await page.waitForTimeout(200);
}
await page.locator("#cards").screenshot({ path: out });
await browser.close();
server.close();
console.log("saved", out);
