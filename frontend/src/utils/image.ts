export type ImageCropSettings = {
  aspectRatio: number;
  panX: number;
  panY: number;
  zoom: number;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = src;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFileName(file: File) {
  const name = file.name.replace(/\.[^.]+$/, "");
  const extension = file.type === "image/png" ? "png" : "jpg";
  return `${name}-cropped.${extension}`;
}

export async function createCroppedImageFile(
  file: File,
  settings: ImageCropSettings,
  backgroundColor = "#fffaf4"
) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(imageUrl);
    const outputWidth = 1600;
    const outputHeight = Math.round(outputWidth / settings.aspectRatio);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not available");
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const zoom = Math.max(0.85, settings.zoom);
    const fitScale = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
    const drawScale = fitScale * zoom;
    const scaledWidth = image.naturalWidth * drawScale;
    const scaledHeight = image.naturalHeight * drawScale;
    const shiftX = Math.max(0, scaledWidth - outputWidth);
    const shiftY = Math.max(0, scaledHeight - outputHeight);
    const offsetX = clamp((outputWidth - scaledWidth) / 2 + (settings.panX / 100) * (shiftX / 2), -shiftX, 0);
    const offsetY = clamp((outputHeight - scaledHeight) / 2 + (settings.panY / 100) * (shiftY / 2), -shiftY, 0);

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, outputWidth, outputHeight);
    context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Unable to generate cropped image"));
            return;
          }

          resolve(result);
        },
        mimeType,
        mimeType === "image/jpeg" ? 0.94 : undefined
      );
    });

    return new File([blob], getFileName(file), { type: mimeType });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
