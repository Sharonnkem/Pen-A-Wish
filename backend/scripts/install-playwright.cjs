const { spawnSync } = require("node:child_process");

const shouldInstall =
  process.env.PLAYWRIGHT_INSTALL_CHROMIUM === "true" ||
  process.env.CI === "true" ||
  process.env.RENDER === "true";

if (!shouldInstall) {
  process.exit(0);
}

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = require("node:path").resolve(
    process.cwd(),
    ".playwright-browsers"
  );
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
