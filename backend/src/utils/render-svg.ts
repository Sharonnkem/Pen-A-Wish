import { chromium } from "playwright";

export async function renderSvgToPngBuffer(svg: string) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  });

  try {
    const page = await browser.newPage({
      deviceScaleFactor: 2,
      viewport: { height: 1600, width: 1132 }
    });

    const svgUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;background:#ffffff;}</style></head><body><img id="share" src="${svgUrl}" style="display:block;width:1132px;height:1600px;object-fit:contain;" /></body></html>`,
      { waitUntil: "load" }
    );

    const image = page.locator("#share");
    await image.waitFor({ state: "visible" });

    return await image.screenshot({ type: "png" });
  } finally {
    await browser.close();
  }
}
