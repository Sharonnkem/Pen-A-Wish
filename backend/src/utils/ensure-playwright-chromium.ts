import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

let chromiumReady = false;

export function ensurePlaywrightChromium() {
  if (chromiumReady) {
    return;
  }

  const executablePath = chromium.executablePath();

  if (executablePath && existsSync(executablePath)) {
    chromiumReady = true;
    return;
  }

  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve(process.cwd(), ".playwright-browsers");
  }

  const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["playwright", "install", "chromium"], {
    env: process.env,
    stdio: "inherit"
  });

  if ((result.status ?? 1) !== 0) {
    throw new Error("Unable to install Playwright Chromium for export rendering.");
  }

  chromiumReady = true;
}
