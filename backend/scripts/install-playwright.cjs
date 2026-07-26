const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

let chromiumExecutablePath = "";

try {
  const { chromium } = require("playwright");
  chromiumExecutablePath = chromium.executablePath();
} catch {
  chromiumExecutablePath = "";
}

const browsersPath =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  path.resolve(process.cwd(), ".playwright-browsers");

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = browsersPath;
}

const shouldInstall =
  process.env.PLAYWRIGHT_INSTALL_CHROMIUM === "true" ||
  process.env.CI === "true" ||
  process.env.RENDER === "true" ||
  !chromiumExecutablePath ||
  !existsSync(chromiumExecutablePath);

if (!shouldInstall) {
  process.exit(0);
}

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["playwright", "install", "chromium"],
  {
    stdio: "inherit",
    env: process.env
  }
);

process.exit(result.status ?? 1);
