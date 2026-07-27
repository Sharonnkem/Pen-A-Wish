import type { Request, Response } from "express";

import { publicEventService } from "../services/public-event.service.js";
import { buildStatusShareSvg } from "../utils/status-share-svg.js";
import { renderSvgToPngBuffer } from "../utils/render-svg.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import { env } from "../config/env.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSharePreviewUrl(request: Request, slug: string) {
  const protocol = request.protocol;
  const host = request.get("host");
  return `${protocol}://${host}/share/events/${slug}/image.png`;
}

export async function getCelebrationSharePage(request: Request, response: Response) {
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const event = await publicEventService.getShareImageData(slug);
  const pageTitle = `${event.celebrantName} | Pen A Wish`;
  const description = `Leave a wish for ${event.celebrantName}'s ${event.title}.`;
  const shareImageUrl = getSharePreviewUrl(request, event.slug);
  const previewImageUrl = event.profileImageUrl ?? event.coverImageUrl ?? shareImageUrl;
  const redirectUrl = `${env.frontendUrl.replace(/\/$/, "")}/events/${event.slug}`;
  const escapedTitle = escapeHtml(pageTitle);
  const escapedDescription = escapeHtml(description);
  const escapedImage = escapeHtml(previewImageUrl);
  const escapedRedirect = escapeHtml(redirectUrl);

  response.type("html").send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapedTitle}</title>
      <meta name="description" content="${escapedDescription}" />
      <meta property="og:title" content="${escapedTitle}" />
      <meta property="og:description" content="${escapedDescription}" />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="${escapedRedirect}" />
      <meta property="og:image" content="${escapedImage}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escapedTitle}" />
      <meta name="twitter:description" content="${escapedDescription}" />
      <meta name="twitter:image" content="${escapedImage}" />
      <style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f6eee6;
          color: #432235;
          font-family: Georgia, "Times New Roman", serif;
          padding: 24px;
        }
        .card {
          width: min(420px, 100%);
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,250,244,0.96));
          box-shadow: 0 20px 60px rgba(67,34,53,0.14);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.78);
        }
        .image {
          display: block;
          width: 100%;
          height: auto;
        }
        .content {
          padding: 20px 22px 24px;
          text-align: center;
        }
        .eyebrow {
          font: 600 11px/1.4 Arial, sans-serif;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #a88a6b;
          margin: 0 0 10px;
        }
        .title {
          font-size: 28px;
          line-height: 1.1;
          margin: 0;
          color: #5f3a76;
        }
        .subtext {
          margin: 12px auto 0;
          max-width: 24ch;
          font: 400 16px/1.65 Arial, sans-serif;
          color: rgba(67,34,53,0.72);
        }
        .button {
          display: inline-block;
          margin-top: 18px;
          padding: 12px 18px;
          border-radius: 999px;
          background: #5f3a76;
          color: white;
          text-decoration: none;
          font: 600 14px/1 Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <main class="card">
        <img class="image" src="${escapedImage}" alt="${escapedTitle}" />
        <div class="content">
          <p class="eyebrow">Pen A Wish</p>
          <h1 class="title">${escapeHtml(event.celebrantName)}</h1>
          <p class="subtext">Leave a warm wish and visit the celebration page.</p>
          <a class="button" href="${escapedRedirect}">Open celebration</a>
        </div>
      </main>
    </body>
  </html>`);
}

export async function getCelebrationShareImage(request: Request, response: Response) {
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const event = await publicEventService.getShareImageData(slug);
  const publicUrl = `${env.frontendUrl.replace(/\/$/, "")}/events/${event.slug}`;
  const svg = buildStatusShareSvg({
    celebrantName: event.celebrantName,
    coverImageUrl: event.coverImageUrl,
    eventType: event.eventType,
    publicUrl,
    profileImageUrl: event.profileImageUrl,
    title: event.title
  });

  response.setHeader("Cache-Control", "public, max-age=1800");
  response.type("image/png");
  response.send(await renderSvgToPngBuffer(svg));
}
