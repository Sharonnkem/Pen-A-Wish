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

export function buildCelebrationShareMessage({
  celebrantName,
  eventType,
  publicUrl,
  title
}: CelebrationShareInput) {
  return [
    `🎉 You’re invited to leave a special wish for ${celebrantName}'s ${title}!`,
    `This ${eventType.toLowerCase()} celebration has a beautiful Wish Wall filled with love, memories, and kind words.`,
    "Tap the link to leave your wish:",
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
