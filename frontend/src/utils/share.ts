import { appConfig } from "../config/app";

type CelebrationShareInput = {
  celebrantName: string;
  eventType: string;
  publicUrl: string;
  title: string;
};

type CelebrationShareMediaInput = CelebrationShareInput & {
  sharePreviewImageUrl: string;
};

export function getPublicEventUrl(slug: string) {
  if (typeof window === "undefined") {
    return `/events/${slug}`;
  }

  return `${window.location.origin}/events/${slug}`;
}

export function getDefaultSharePreviewImageUrl() {
  if (typeof window === "undefined") {
    return "/pen-a-wish-og.svg";
  }

  return `${window.location.origin}/pen-a-wish-og.svg`;
}

function getBackendOrigin() {
  const shareBaseUrl = appConfig.shareBaseUrl.replace(/\/$/, "");
  const apiBaseUrl = appConfig.apiBaseUrl.replace(/\/$/, "");

  if (/^https?:\/\//i.test(shareBaseUrl)) {
    return shareBaseUrl.replace(/\/api$/, "");
  }

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return apiBaseUrl.replace(/\/api$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function getCelebrationShareUrl(slug: string) {
  const backendOrigin = getBackendOrigin();

  if (!backendOrigin) {
    return getPublicEventUrl(slug);
  }

  return `${backendOrigin}/share/events/${slug}`;
}

export function getCelebrationPreviewImageUrl(
  profileImageUrl?: string | null,
  coverImageUrl?: string | null
) {
  return profileImageUrl ?? coverImageUrl ?? getDefaultSharePreviewImageUrl();
}

export function getCelebrationSharePreviewImageUrl(slug: string) {
  const backendOrigin = getBackendOrigin();

  if (!backendOrigin) {
    return getDefaultSharePreviewImageUrl();
  }

  return `${backendOrigin}/share/events/${slug}/image.png`;
}

export function buildCelebrationShareMessage({
  celebrantName,
  eventType,
  publicUrl,
  title
}: CelebrationShareInput) {
  return [
    `🎉 You’re invited to leave a special wish for ${celebrantName}'s ${title}.`,
    `This ${eventType.toLowerCase()} celebration has a beautiful Wish Wall filled with love, memories, and kind words.`,
    "Tap the link to leave your wish:",
    publicUrl
  ].join("\n");
}

function getShareFileName(title: string) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${safe || "pen-a-wish"}-status.png`;
}

export async function shareCelebrationInvite(input: CelebrationShareMediaInput) {
  const shareMessage = buildCelebrationShareMessage(input);

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      const response = await fetch(input.sharePreviewImageUrl, { cache: "no-store" });

      if (response.ok) {
        const imageBlob = await response.blob();
        const shareFile = new File([imageBlob], getShareFileName(input.title), {
          type: imageBlob.type || "image/png"
        });
        const navigatorWithFiles = navigator as Navigator & {
          canShare?: (data?: ShareData & { files?: File[] }) => boolean;
          share: (data: ShareData & { files?: File[] }) => Promise<void>;
        };

        if (!navigatorWithFiles.canShare || navigatorWithFiles.canShare({ files: [shareFile] })) {
          await navigatorWithFiles.share({
            files: [shareFile],
            text: shareMessage,
            title: input.title,
            url: input.publicUrl
          });
          return true;
        }
      }
    } catch {
      // Fall back to text-only sharing below.
    }

    await navigator.share({
      text: shareMessage,
      title: input.title,
      url: input.publicUrl
    });
    return true;
  }

  return false;
}

export function buildCelebrationShareLinks(message: string, publicUrl: string) {
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(publicUrl);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    x: `https://twitter.com/intent/tweet?text=${encodedMessage}`
  } as const;
}

export function openShareUrl(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
