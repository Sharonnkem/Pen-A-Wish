type StatusShareSvgInput = {
  celebrantName: string;
  coverImageUrl?: string | null;
  eventType: string;
  publicUrl: string;
  profileImageUrl?: string | null;
  title: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value: string, maxLength: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 4);
}

export function buildStatusShareSvg(input: StatusShareSvgInput) {
  const celebrantName = escapeXml(input.celebrantName);
  const title = escapeXml(input.title);
  const eventType = escapeXml(input.eventType);
  const publicUrl = escapeXml(input.publicUrl);
  const photoUrl = escapeXml(input.profileImageUrl ?? input.coverImageUrl ?? "");
  const initials = escapeXml(
    input.celebrantName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "PAW"
  );
  const messageLines = wrapText(
    `Leave a wish for ${input.celebrantName}.`,
    24
  );

  const messageSvgLines = messageLines
    .map(
      (line, index) =>
        `<text x="566" y="${980 + index * 30}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#fff8f0" opacity="0.94">${escapeXml(line)}</text>`
    )
    .join("");
  const backgroundPhotoSvg = photoUrl
    ? `<image href="${photoUrl}" x="0" y="0" width="1132" height="1600" preserveAspectRatio="xMidYMid slice" opacity="0.96" clip-path="url(#bgClip)" />`
    : "";
  const portraitPhotoSvg = photoUrl
    ? `<image href="${photoUrl}" x="326" y="170" width="480" height="480" preserveAspectRatio="xMidYMid slice" clip-path="url(#portraitClip)" />`
    : `<text x="566" y="442" text-anchor="middle" font-family="Georgia, serif" font-size="94" fill="#fff8f0">${initials}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1132" height="1600" viewBox="0 0 1132 1600" role="img" aria-label="${celebrantName} celebration share card">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#120d12"/>
      <stop offset="100%" stop-color="#2a1e28"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.12)"/>
      <stop offset="50%" stop-color="rgba(0,0,0,0.34)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.68)"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.06)"/>
    </linearGradient>
    <linearGradient id="pill" x1="0" y1="0" x2="1" y1="0">
      <stop offset="0%" stop-color="#7a4a88"/>
      <stop offset="100%" stop-color="#b57a92"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#120d12" flood-opacity="0.35" />
    </filter>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <clipPath id="portraitClip">
      <circle cx="566" cy="410" r="178" />
    </clipPath>
    <clipPath id="bgClip">
      <rect x="40" y="40" width="1052" height="1520" rx="48" />
    </clipPath>
  </defs>

  <rect width="1132" height="1600" fill="url(#bg)" />
  ${backgroundPhotoSvg}
  <rect width="1132" height="1600" fill="url(#overlay)" />

  <rect x="40" y="40" width="1052" height="1520" rx="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
    <rect x="154" y="154" width="824" height="1292" rx="44" fill="url(#panel)" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" filter="url(#shadow)" />

  <circle cx="566" cy="410" r="250" fill="rgba(255,255,255,0.12)" filter="url(#glow)" />
  ${portraitPhotoSvg}
  <circle cx="566" cy="410" r="240" fill="none" stroke="rgba(255,247,240,0.82)" stroke-width="7" />
  <circle cx="566" cy="410" r="258" fill="none" stroke="rgba(255,210,140,0.35)" stroke-width="2" />

  <text x="566" y="744" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="8" fill="#ffe9d6">SHARE GOODWILL</text>
  <text x="566" y="826" text-anchor="middle" font-family="Georgia, serif" font-size="74" font-style="italic" fill="#fffaf4">${celebrantName}</text>
  <text x="566" y="884" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="rgba(255,247,239,0.92)">${title}</text>

  ${messageSvgLines}

  <rect x="368" y="1080" width="396" height="68" rx="34" fill="rgba(255,255,255,0.16)" stroke="rgba(255,247,239,0.18)" stroke-width="1.5" />
  <text x="566" y="1122" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#fff8f0">${publicUrl}</text>

  <circle cx="184" cy="286" r="12" fill="#f4b74f" opacity="0.95" />
  <circle cx="936" cy="330" r="14" fill="#ef87b6" opacity="0.95" />
  <circle cx="918" cy="1320" r="14" fill="#5ed0ff" opacity="0.95" />
  <circle cx="214" cy="1310" r="14" fill="#f0b24d" opacity="0.95" />
</svg>`;
}
