import type { Request, Response } from "express";

import { AppError } from "../utils/app-error.js";

function getProxyUrl(request: Request) {
  const urlValue = String(request.query.url ?? "").trim();

  if (!urlValue) {
    throw new AppError("Image URL is required", 400);
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(urlValue);
  } catch {
    throw new AppError("Invalid image URL", 400);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new AppError("Unsupported image URL", 400);
  }

  return parsedUrl;
}

export async function proxyImage(request: Request, response: Response) {
  const parsedUrl = getProxyUrl(request);
  const imageResponse = await fetch(parsedUrl.toString());

  if (!imageResponse.ok) {
    throw new AppError("Unable to load image", imageResponse.status);
  }

  const contentType = imageResponse.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    throw new AppError("The supplied URL is not an image", 400);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  response.setHeader("Content-Type", contentType);
  response.setHeader("Cache-Control", "public, max-age=86400");
  response.send(buffer);
}
