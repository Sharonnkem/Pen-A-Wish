import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/app-error.js";
import { Readable } from "node:stream";

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

    try {
      const result = await new Promise<{
        public_id: string;
        secure_url: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `pen-a-wish/${input.folder}`,
            resource_type: "image"
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error("Cloudinary did not return an upload result"));
              return;
            }

            resolve(result);
          }
        );

        Readable.from(input.buffer).pipe(uploadStream);
      });

      return {
        publicId: result.public_id,
        url: result.secure_url
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed";
      throw new AppError(`Cloudinary upload failed: ${message}`, 502);
    }
  }
};
