import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.UI_BASE_URL || "http://localhost:3001";
const outDir = process.env.OUT_DIR || __dirname;

const routes = [
  ["01-landing", "/"],
  ["02-sign-in", "/sign-in"],
  ["03-sign-up", "/sign-up"],
  ["04-dashboard-overview", "/dashboard"],
  ["05-dashboard-subscribers", "/dashboard/subscribers"],
  ["06-dashboard-sessions", "/dashboard/sessions"],
  ["07-dashboard-offer-analytics", "/dashboard/offer-analytics"],
  ["08-dashboard-feedback", "/dashboard/feedback"],
  ["09-dashboard-integration", "/dashboard/integration"],
  ["10-dashboard-settings", "/dashboard/settings"],
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [name, routePath] of routes) {
  const url = BASE + routePath;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1500);
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("OK", name, "->", page.url());
  } catch (e) {
    console.error("FAIL", name, e.message);
  }
}

await browser.close();
