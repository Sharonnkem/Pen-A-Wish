import { useEffect, useMemo, useState } from "react";

import { Button } from "../common/Button";
import { Modal } from "../modals/Modal";
import { createCroppedImageFile } from "../../utils/image";

type ImageCropModalProps = {
  aspectRatio: number;
  backgroundColor?: string;
  description: string;
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void> | void;
  title: string;
};

export function ImageCropModal({
  aspectRatio,
  backgroundColor = "#fffaf4",
  description,
  file,
  isOpen,
  onClose,
  onConfirm,
  title
}: ImageCropModalProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setZoom(1);
    setPanX(0);
    setPanY(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const objectPosition = useMemo(
    () => `${50 + panX / 2}% ${50 + panY / 2}%`,
    [panX, panY]
  );

  async function handleApply() {
    if (!file) {
      return;
    }

    setIsCropping(true);

    try {
      const croppedFile = await createCroppedImageFile(
        file,
        { aspectRatio, panX, panY, zoom },
        backgroundColor
      );
      await onConfirm(croppedFile);
      onClose();
    } finally {
      setIsCropping(false);
    }
  }

  return (
    <Modal
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!file || isCropping} onClick={() => void handleApply()}>
            {isCropping ? "Applying crop..." : "Use cropped image"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div
          className="overflow-hidden rounded-[28px] border border-plum-700/10 bg-white/75 shadow-[0_18px_40px_rgba(67,34,53,0.08)]"
          style={{ aspectRatio: String(aspectRatio) }}
        >
          {previewUrl ? (
            <img
              alt="Selected image preview"
              className="h-full w-full object-cover transition-transform duration-150 ease-out"
              crossOrigin="anonymous"
              src={previewUrl}
              style={{
                objectPosition,
                transform: `scale(${zoom})`
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-charcoal-900/58">
              Choose an image to adjust it before saving.
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-charcoal-900/70">
            Zoom
            <input
              aria-label="Zoom image"
              className="accent-plum-700"
              min="0.85"
              max="2.4"
              step="0.01"
              type="range"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>

          <label className="grid gap-2 text-sm text-charcoal-900/70">
            Crop left / right
            <input
              aria-label="Crop left and right"
              className="accent-plum-700"
              min="-100"
              max="100"
              step="1"
              type="range"
              value={panX}
              onChange={(event) => setPanX(Number(event.target.value))}
            />
          </label>

          <label className="grid gap-2 text-sm text-charcoal-900/70">
            Crop up / down
            <input
              aria-label="Crop up and down"
              className="accent-plum-700"
              min="-100"
              max="100"
              step="1"
              type="range"
              value={panY}
              onChange={(event) => setPanY(Number(event.target.value))}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
