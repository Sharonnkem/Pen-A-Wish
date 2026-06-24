type CelebrationShareInput = {
  celebrantName: string;
  eventType: string;
  publicUrl: string;
  title: string;
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

export function getCelebrationPreviewImageUrl(
  profileImageUrl?: string | null,
  coverImageUrl?: string | null
) {
  return profileImageUrl ?? coverImageUrl ?? getDefaultSharePreviewImageUrl();
}

export function buildCelebrationShareMessage({
  celebrantName,
  eventType,
  publicUrl,
  title
}: CelebrationShareInput) {
  return [
    `🎉 Leave a wish for ${celebrantName}'s ${title}.`,
    `A ${eventType.toLowerCase()} Wish Wall filled with love and memories.`,
    "Tap the link to join in:",
    publicUrl
  ].join("\n");
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
