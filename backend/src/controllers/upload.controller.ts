import type { Request, Response } from "express";

import { AppError } from "../utils/app-error.js";
import { successResponse } from "../utils/api-response.js";
import { uploadService } from "../services/upload.service.js";
import { uploadImageSchema } from "../validators/event.validator.js";

export async function uploadImage(request: Request, response: Response) {
  const payload = uploadImageSchema.parse(request.body);

  if (!request.file) {
    throw new AppError("Image file is required", 400);
  }

  const uploaded = await uploadService.uploadImage({
    buffer: request.file.buffer,
    folder: payload.folder,
    mimetype: request.file.mimetype
  });

  response.status(201).json(
    successResponse("Image uploaded successfully", {
      folder: payload.folder,
      publicId: uploaded.publicId,
      url: uploaded.url
    })
  );
}

