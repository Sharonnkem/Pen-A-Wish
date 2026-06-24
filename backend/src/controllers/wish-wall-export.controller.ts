import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";

import {
  wishWallExportService,
  type WishWallExportFormat,
  type WishWallExportSource
} from "../services/wish-wall-export.service.js";
import { getRequiredRouteParam } from "../utils/route-param.js";

function getFormat(value: unknown): WishWallExportFormat {
  const format = String(value ?? "PNG").toUpperCase();

  if (format === "JPG" || format === "PNG" || format === "PDF") {
    return format;
  }

  return "PNG";
}

function getSource(value: unknown): WishWallExportSource {
  const source = String(value ?? "wishes").toLowerCase();

  if (source === "guestbook") {
    return "guestbook";
  }

  return "wishes";
}

function getFrontendUrl(request: AuthenticatedRequest) {
  const origin = request.headers.origin;

  if (origin && typeof origin === "string") {
    return origin;
  }

  const referer = request.headers.referer;

  if (referer && typeof referer === "string") {
    try {
      return new URL(referer).origin;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export async function exportWishWall(request: AuthenticatedRequest, response: Response) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const format = getFormat(request.query.format);
  const source = getSource(request.query.source);
  const frontendUrl = getFrontendUrl(request);
  const exported = await wishWallExportService.exportWishWall(
    eventId,
    format,
    request.authUser,
    source,
    frontendUrl
  );

  response.setHeader("Content-Type", exported.contentType);
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${exported.fileName}-${source}.${format.toLowerCase()}"`
  );
  response.status(200).send(exported.buffer);
}
