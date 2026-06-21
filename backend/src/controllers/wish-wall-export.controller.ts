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

export async function exportWishWall(request: AuthenticatedRequest, response: Response) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const format = getFormat(request.query.format);
  const source = getSource(request.query.source);
  const exported = await wishWallExportService.exportWishWall(
    eventId,
    format,
    request.authUser,
    source
  );

  response.setHeader("Content-Type", exported.contentType);
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${exported.fileName}-${source}.${format.toLowerCase()}"`
  );
  response.status(200).send(exported.buffer);
}
