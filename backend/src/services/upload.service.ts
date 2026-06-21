import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/app-error.js";

const allowedFolders = new Set(["avatars", "events", "covers"]);

export const uploadService = {
  async uploadImage(input: {
    buffer: Buffer;
    folder: string;
    mimetype: string;
  }) {
    if (!allowedFolders.has(input.folder)) {
      throw new AppError("Upload folder is invalid", 400);
    }

    if (!input.mimetype.startsWith("image/")) {
      throw new AppError("Only image uploads are allowed", 400);
    }

    const base64 = input.buffer.toString("base64");
    const dataUri = `data:${input.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `pen-a-wish/${input.folder}`,
      resource_type: "image"
    });

    return {
      publicId: result.public_id,
      url: result.secure_url
    };
  }
};
