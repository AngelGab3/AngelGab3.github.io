#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT_DIR, "_site");
const OUT_DIR = path.join(ROOT_DIR, "docs", "screenshots");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      let filePath = path.join(SITE_DIR, urlPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
        filePath = filePath + ".html";
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function openPage(browser, baseUrl, route, opts) {
  const context = await browser.newContext({ viewport: opts.viewport });
  await context.addInitScript((theme) => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("site-lang", "en");
  }, opts.theme);

  const page = await context.newPage();
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" }).catch(() => {});
  if (route.includes("proyectos")) {
    await page.waitForFunction(() => document.querySelectorAll("mjx-container").length > 0, { timeout: 6000 }).catch(() => {});
  }
  await page.waitForTimeout(950);
  return { context, page };
}

async function main() {
  if (!fs.existsSync(SITE_DIR)) {
    throw new Error("Missing _site/ directory. Run `bundle exec jekyll build` first.");
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Hero Dark & Light (1440x860)
    for (const theme of ["dark", "light"]) {
      const { context, page } = await openPage(browser, baseUrl, "/", {
        viewport: { width: 1440, height: 860 },
        theme,
      });
      await page.mouse.move(920, 320);
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(OUT_DIR, `hero-${theme}.png`) });
      await context.close();
    }

    // 2. Three Interactive Hero Simulation Modes (1280x680)
    {
      const { context, page } = await openPage(browser, baseUrl, "/", {
        viewport: { width: 1280, height: 680 },
        theme: "dark",
      });
      await page.mouse.move(860, 300);
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(OUT_DIR, "sim-manifold.png"),
        clip: { x: 0, y: 56, width: 1280, height: 540 },
      });

      await page.click('.quantum-mode-btn[data-qmode="bloch"]');
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: path.join(OUT_DIR, "sim-bloch.png"),
        clip: { x: 0, y: 56, width: 1280, height: 540 },
      });

      await page.click('.quantum-mode-btn[data-qmode="symplectic"]');
      await page.waitForTimeout(900);
      await page.screenshot({
        path: path.join(OUT_DIR, "sim-symplectic.png"),
        clip: { x: 0, y: 56, width: 1280, height: 540 },
      });
      await context.close();
    }

    // 3. Bento Projects Grid — Dark & Light (1440x900)
    for (const theme of ["dark", "light"]) {
      const { context, page } = await openPage(browser, baseUrl, "/proyectos/", {
        viewport: { width: 1440, height: 900 },
        theme,
      });
      await page.waitForTimeout(550);
      await page.screenshot({ path: path.join(OUT_DIR, `projects-bento-${theme}.png`) });
      await context.close();
    }

    // 4. Hardware & Control Filtered Showcase (Gota Poblana + TMR Robotics)
    {
      const { context, page } = await openPage(browser, baseUrl, "/proyectos/", {
        viewport: { width: 1440, height: 820 },
        theme: "dark",
      });
      await page.click('.bento-filter-btn[data-filter="robotica-y-hardware"]');
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(OUT_DIR, "projects-hardware-dark.png"),
        clip: { x: 0, y: 56, width: 1440, height: 670 },
      });
      await context.close();
    }

    // 5. Mobile Responsive Shots (390x844)
    for (const item of [
      { route: "/", file: "mobile-home-dark.png" },
      { route: "/proyectos/", file: "mobile-projects-dark.png" },
    ]) {
      const { context, page } = await openPage(browser, baseUrl, item.route, {
        viewport: { width: 390, height: 844 },
        theme: "dark",
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT_DIR, item.file) });
      await context.close();
    }

    console.log("Captured README screenshots in docs/screenshots/");
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
