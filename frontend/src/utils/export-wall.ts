import { appConfig } from "../config/app";
import type { WishWallSettings } from "../types/wish-wall";

const textEncoder = new TextEncoder();
type PdfPart = string | Uint8Array<ArrayBuffer>;

type ExportWish = {
  message: string;
  senderName: string;
};

type WishWallExportData = {
  celebrantName: string;
  eventDate: string;
  eventTitle: string;
  wishes: ExportWish[];
};

function getTypographyFontStack(key: WishWallSettings["typography"]["headingFont"]) {
  switch (key) {
    case "mono":
      return '"Courier New", Courier, monospace';
    case "sans":
      return '"Jost", system-ui, sans-serif';
    case "handwritten":
      return '"Caveat", cursive';
    case "display":
    case "serif":
    default:
      return '"Cormorant Garamond", Georgia, serif';
  }
}

const defaultWishWallExportSettings: WishWallSettings = {
  background: {
    color: "#fffaf4",
    gradientEnd: "#f8eee4",
    gradientStart: "#fffaf4",
    imageUrl: null,
    mode: "gradient"
  },
  cardStyle: {
    density: "relaxed",
    radius: "large",
    style: "polaroid"
  },
  export: {
    showHeader: true,
    showMetadata: true,
    showReactions: true,
    showStats: true
  },
  layout: {
    columns: 3,
    mode: "masonry"
  },
  themePreset: "paper",
  typography: {
    bodyFont: "sans",
    headingFont: "serif"
  }
};

function sanitizeFilenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function openBlobFallback(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [text];
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

async function loadImageDataUrl(url: string) {
  const tryFetchImage = async (imageUrl: string) => {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) {
      throw new Error("Unable to load the selected background image for export.");
    }
    return response;
  };

  let response: Response;

  try {
    response = await tryFetchImage(url);
  } catch {
    const proxyUrl = `${appConfig.apiBaseUrl}/uploads/proxy-image?url=${encodeURIComponent(url)}`;
    response = await fetch(proxyUrl, { credentials: "include" });

    if (!response.ok) {
      throw new Error("Unable to load the selected background image for export.");
    }
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected background image."));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToUint8Array(dataUrl: string) {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getByteLength(value: string) {
  return textEncoder.encode(value).length;
}

function buildPdfFromJpeg(jpegDataUrl: string, width: number, height: number) {
  const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
  const formatNumber = (value: number) => value.toFixed(2);
  const pageWidth = Math.round(width);
  const pageHeight = Math.round(height);
  const contentStream = `q\n${formatNumber(pageWidth)} 0 0 ${formatNumber(pageHeight)} 0 0 cm\n/Im0 Do\nQ\n`;
  const objectOffsets: number[] = [0];
  const parts: PdfPart[] = [];
  let byteOffset = 0;

  const append = (part: PdfPart) => {
    parts.push(part);
    if (typeof part === "string") {
      byteOffset += getByteLength(part);
      return;
    }

    byteOffset += part.byteLength;
  };

  const appendObject = (index: number, body: PdfPart, prefix?: string, suffix?: string) => {
    objectOffsets[index] = byteOffset;
    append(`${index} 0 obj\n`);

    if (prefix) {
      append(prefix);
    }

    append(body);

    if (suffix) {
      append(suffix);
    }

    append("\nendobj\n");
  };

  append("%PDF-1.4\n");
  appendObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  appendObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  appendObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatNumber(pageWidth)} ${formatNumber(pageHeight)}] /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`
  );
  appendObject(
    4,
    new Uint8Array(jpegBytes),
    `<< /Type /XObject /Subtype /Image /Width ${pageWidth} /Height ${pageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
    "\nendstream"
  );
  appendObject(
    5,
    contentStream,
    `<< /Length ${getByteLength(contentStream)} >>\nstream\n`,
    "endstream"
  );

  const xrefOffset = byteOffset;
  append("xref\n0 6\n");
  append("0000000000 65535 f \n");

  for (let index = 1; index <= 5; index += 1) {
    append(`${objectOffsets[index].toString().padStart(10, "0")} 00000 n \n`);
  }

  append("trailer\n<< /Size 6 /Root 1 0 R >>\n");
  append(`startxref\n${xrefOffset}\n%%EOF`);

  return new Blob(parts, { type: "application/pdf" });
}

async function renderFallbackWishWallToCanvas(
  input: WishWallExportData,
  settings: WishWallSettings = defaultWishWallExportSettings
) {
  const width = 1800;
  const wishes = input.wishes.slice(0, 12);
  const columns =
    settings.layout.mode === "stack"
      ? 1
      : settings.layout.columns;
  const sidePadding = 92;
  const gap = 32;
  const cardWidth = Math.floor((width - sidePadding * 2 - (columns - 1) * gap) / columns);
  const cardMinHeight = settings.cardStyle.density === "compact" ? 208 : 228;
  const rows = Math.ceil(Math.max(wishes.length, 1) / columns);
  const height = 620 + rows * (cardMinHeight + 32) + 140;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  context.save();
  const gradient = context.createLinearGradient(0, 0, 0, height);
  if (settings.background.mode === "solid") {
    gradient.addColorStop(0, settings.background.color);
    gradient.addColorStop(1, settings.background.color);
  } else if (settings.background.mode === "image") {
    gradient.addColorStop(0, settings.background.gradientStart);
    gradient.addColorStop(1, settings.background.gradientEnd);
  } else {
    gradient.addColorStop(0, settings.background.gradientStart);
    gradient.addColorStop(1, settings.background.gradientEnd);
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (settings.background.mode === "image" && settings.background.imageUrl) {
    try {
      const imageDataUrl = await loadImageDataUrl(settings.background.imageUrl);
      const backgroundImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () =>
          reject(new Error("Unable to load the selected background image for export."));
        image.src = imageDataUrl;
      });

      context.save();
      context.globalAlpha = 0.24;
      context.drawImage(backgroundImage, 0, 0, width, height);
      context.restore();
    } catch {
      // Fall back to the gradient background if the image cannot be inlined.
    }
  }

  context.fillStyle = "rgba(67,34,53,0.06)";
  for (let y = 0; y < height; y += 28) {
    context.fillRect(0, y, width, 1);
  }

  const halo = context.createRadialGradient(width * 0.68, 180, 40, width * 0.68, 180, 560);
  halo.addColorStop(
    0,
    settings.themePreset === "garden"
      ? "rgba(201, 228, 209, 0.38)"
      : settings.themePreset === "midnight"
        ? "rgba(95, 50, 74, 0.26)"
        : "rgba(247, 217, 220, 0.38)"
  );
  halo.addColorStop(1, "rgba(247, 217, 220, 0)");
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#432235";
  roundRect(context, 52, 42, width - 104, 10, 6);
  context.fill();

  context.fillStyle = "#5f324a";
  context.font = `700 30px ${getTypographyFontStack(settings.typography.headingFont)}`;
  context.fillText("Pen A Wish", 92, 116);

  context.fillStyle = "#1f1d1f";
  context.font = `700 76px ${getTypographyFontStack(settings.typography.headingFont)}`;
  context.fillText(input.eventTitle, 92, 188);

  context.font = `400 28px ${getTypographyFontStack(settings.typography.bodyFont)}`;
  context.fillStyle = "rgba(31,29,31,0.74)";
  context.fillText(`Celebrant: ${input.celebrantName}`, 92, 240);
  context.fillText(`Event date: ${new Date(input.eventDate).toLocaleDateString()}`, 92, 280);

  const startY = 282;
  const cardHeight = cardMinHeight;
  const palette = [
    { paper: "#ffffff", tint: "#f7eaf0", pin: "#d49ab2", accent: "#f2b9cb", rotate: -0.05 },
    { paper: "#fffdf8", tint: "#f8ede1", pin: "#d8b06d", accent: "#f0d39a", rotate: 0.04 },
    { paper: "#fefefe", tint: "#eaf2f0", pin: "#8eb7a7", accent: "#b3d3c7", rotate: -0.03 },
    { paper: "#ffffff", tint: "#f3ecf8", pin: "#9b8bc9", accent: "#c7bbec", rotate: 0.05 }
  ];

  wishes.forEach((wish, index) => {
    const style = palette[index % palette.length];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const baseX = sidePadding + column * (cardWidth + gap);
    const baseY = startY + row * (cardHeight + gap);
    const cardX = baseX + (column === 1 ? 10 : -8);
    const cardY = baseY + (row % 2 === 0 ? 0 : 8);

    context.save();
    context.translate(cardX + cardWidth / 2, cardY + cardHeight / 2);
    context.rotate(style.rotate);
    context.translate(-cardWidth / 2, -cardHeight / 2);

    context.shadowColor = "rgba(67,34,53,0.16)";
    context.shadowBlur = 30;
    context.shadowOffsetY = 16;

    const cardGradient = context.createLinearGradient(0, 0, 0, cardHeight);
    cardGradient.addColorStop(0, style.paper);
    cardGradient.addColorStop(1, style.tint);
    context.fillStyle = cardGradient;
    roundRect(context, 0, 0, cardWidth, cardHeight, 30);
    context.fill();

    context.restore();

    context.save();
    context.translate(cardX + cardWidth / 2, cardY + cardHeight / 2);
    context.rotate(style.rotate);
    context.translate(-cardWidth / 2, -cardHeight / 2);

    context.strokeStyle = "rgba(67,34,53,0.10)";
    context.lineWidth = 2;
    roundRect(context, 0, 0, cardWidth, cardHeight, 30);
    context.stroke();

    context.fillStyle = "rgba(255,255,255,0.55)";
    roundRect(context, 18, 14, cardWidth - 36, 24, 12);
    context.fill();

    context.fillStyle = "rgba(255,255,255,0.92)";
    context.beginPath();
    context.arc(30, 30, 18, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(67,34,53,0.10)";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#5f324a";
    context.font = "700 18px Jost, system-ui, sans-serif";
    context.fillText("×", 24, 36);

    context.fillStyle = style.pin;
    context.beginPath();
    context.arc(cardWidth - 28, 30, 7, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = style.accent;
    roundRect(context, 24, 34, 64, 8, 4);
    context.fill();

    context.fillStyle = "#5f324a";
    context.font = `700 26px ${getTypographyFontStack(settings.typography.headingFont)}`;
    context.fillText(wish.senderName, 24, 78);

    context.fillStyle = "rgba(31,29,31,0.76)";
    context.font = `italic 300 20px ${getTypographyFontStack(settings.typography.bodyFont)}`;
    const messageLines = wrapText(context, wish.message, cardWidth - 48);
    messageLines.slice(0, 5).forEach((line, lineIndex) => {
      context.fillText(line, 24, 118 + lineIndex * 30);
    });

    context.fillStyle = "rgba(67,34,53,0.44)";
    context.font = `italic 400 16px ${getTypographyFontStack(settings.typography.bodyFont)}`;
    context.fillText("Pen A Wish", 24, cardHeight - 26);

    context.restore();
  });

  return { canvas, height, width };
}

async function createWallCanvas(
  fallbackData?: WishWallExportData,
  settings?: WishWallSettings
) {
  if (!fallbackData) {
    throw new Error("The Wish Wall export data is unavailable.");
  }

  return await renderFallbackWishWallToCanvas(fallbackData, settings);
}

export async function exportWall(input: {
    eventTitle: string;
    format: "JPG" | "PDF" | "PNG";
    fallbackData?: WishWallExportData;
    settings?: WishWallSettings;
}) {
  const safeTitle = sanitizeFilenamePart(input.eventTitle || "wish-wall");
  const fileBaseName = `${safeTitle || "wish-wall"}-${input.format.toLowerCase()}`;
  const { canvas, height, width } = await createWallCanvas(input.fallbackData, input.settings);

  if (input.format === "PNG") {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!blob) {
      throw new Error("Unable to create PNG export.");
    }

    downloadBlob(blob, `${fileBaseName}.png`);
    openBlobFallback(blob, `${fileBaseName}.png`);
    return;
  }

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.94);

  if (input.format === "JPG") {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.94)
    );

    if (!blob) {
      throw new Error("Unable to create JPG export.");
    }

    downloadBlob(blob, `${fileBaseName}.jpg`);
    openBlobFallback(blob, `${fileBaseName}.jpg`);
    return;
  }

  const pdfBlob = buildPdfFromJpeg(jpegDataUrl, width, height);
  downloadBlob(pdfBlob, `${fileBaseName}.pdf`);
  openBlobFallback(pdfBlob, `${fileBaseName}.pdf`);
}
