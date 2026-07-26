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

function renderConfetti() {
  const pieces = [
    { x: 70, y: 78, fill: "#9d5d47", rotate: -28, size: 18, kind: "rect" },
    { x: 132, y: 58, fill: "#d67a71", rotate: 18, size: 12, kind: "circle" },
    { x: 214, y: 102, fill: "#f0b24d", rotate: 0, size: 15, kind: "circle" },
    { x: 338, y: 74, fill: "#8e5bd8", rotate: 32, size: 16, kind: "rect" },
    { x: 430, y: 110, fill: "#f4c95d", rotate: -14, size: 10, kind: "star" },
    { x: 520, y: 62, fill: "#ef87b6", rotate: 22, size: 15, kind: "rect" },
    { x: 602, y: 82, fill: "#e9c27f", rotate: -20, size: 10, kind: "star" },
    { x: 718, y: 64, fill: "#8d62d6", rotate: 15, size: 16, kind: "rect" },
    { x: 834, y: 96, fill: "#5ed0ff", rotate: -16, size: 14, kind: "circle" },
    { x: 916, y: 70, fill: "#ff8f4d", rotate: 30, size: 16, kind: "circle" },
    { x: 1024, y: 108, fill: "#e06eaf", rotate: 6, size: 11, kind: "star" },
    { x: 1098, y: 78, fill: "#f6be47", rotate: -22, size: 18, kind: "rect" }
  ];

  return pieces
    .map((piece) => {
      if (piece.kind === "circle") {
        return `<circle cx="${piece.x}" cy="${piece.y}" r="${piece.size / 2}" fill="${piece.fill}" opacity="0.9" />`;
      }

      if (piece.kind === "star") {
        return `<path d="M ${piece.x} ${piece.y - piece.size / 2} L ${piece.x + piece.size * 0.18} ${piece.y - piece.size * 0.18} L ${piece.x + piece.size / 2} ${piece.y - piece.size * 0.1} L ${piece.x + piece.size * 0.22} ${piece.y + piece.size * 0.08} L ${piece.x + piece.size * 0.32} ${piece.y + piece.size * 0.55} L ${piece.x} ${piece.y + piece.size * 0.22} L ${piece.x - piece.size * 0.32} ${piece.y + piece.size * 0.55} L ${piece.x - piece.size * 0.22} ${piece.y + piece.size * 0.08} L ${piece.x - piece.size / 2} ${piece.y - piece.size * 0.1} L ${piece.x - piece.size * 0.18} ${piece.y - piece.size * 0.18} Z" fill="${piece.fill}" opacity="0.8" />`;
      }

      return `<rect x="${piece.x - piece.size / 2}" y="${piece.y - piece.size / 2}" width="${piece.size}" height="${piece.size * 1.4}" rx="${piece.size / 5}" fill="${piece.fill}" opacity="0.92" transform="rotate(${piece.rotate} ${piece.x} ${piece.y})" />`;
    })
    .join("");
}

function renderArrows() {
  return `
    <g fill="none" stroke="#f4b74f" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 402 1110 C 340 1090, 300 1078, 258 1072" stroke-width="10" />
      <path d="M 258 1072 L 274 1059" stroke-width="10" />
      <path d="M 258 1072 L 275 1084" stroke-width="10" />

      <path d="M 797 1108 C 858 1088, 898 1078, 938 1072" stroke-width="10" />
      <path d="M 938 1072 L 921 1058" stroke-width="10" />
      <path d="M 938 1072 L 921 1085" stroke-width="10" />

      <path d="M 566 1128 C 566 1094, 566 1080, 566 1068" stroke-width="10" />
      <path d="M 566 1068 L 553 1086" stroke-width="10" />
      <path d="M 566 1068 L 579 1086" stroke-width="10" />
    </g>
  `;
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
    `Leave a message, share your goodwill and make this moment even more special.`,
    26
  );

  const messageSvgLines = messageLines
    .map(
      (line, index) =>
        `<text x="566" y="${952 + index * 34}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#5a4b59">${escapeXml(line)}</text>`
    )
    .join("");

  const ribbonWidth = Math.min(500, Math.max(320, 20 * title.length));

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1132" height="1600" viewBox="0 0 1132 1600" role="img" aria-label="${celebrantName} celebration share card">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf4"/>
        <stop offset="100%" stop-color="#f7eee5"/>
      </linearGradient>
      <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffdf8"/>
        <stop offset="100%" stop-color="#fff4ea"/>
      </linearGradient>
      <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6a3a76"/>
        <stop offset="100%" stop-color="#4f2e63"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#33242d" flood-opacity="0.12" />
      </filter>
      <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath id="fullBgClip">
        <rect x="40" y="40" width="1052" height="1520" rx="48" />
      </clipPath>
    </defs>

    <rect width="1132" height="1600" fill="url(#bg)" />
    ${photoUrl ? `<image href="${photoUrl}" x="40" y="40" width="1052" height="1520" preserveAspectRatio="xMidYMid slice" clip-path="url(#fullBgClip)" opacity="0.9" />` : ""}
    <rect x="40" y="40" width="1052" height="1520" rx="48" fill="#fff6ee" opacity="${photoUrl ? "0.68" : "0.96"}" />
    <rect x="40" y="40" width="1052" height="1520" rx="48" fill="url(#card)" opacity="0.42" filter="url(#shadow)" />
    <g opacity="0.95">${renderConfetti()}</g>

    <text x="566" y="238" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="8" fill="#5a4960">YOU&apos;RE INVITED TO</text>
    <text x="566" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="96" font-style="italic" fill="#5f3a76">Share Goodwill.</text>
    <text x="566" y="424" text-anchor="middle" font-family="Georgia, serif" font-size="96" font-style="italic" fill="#f0b84f">Spread Joy.</text>

    <circle cx="566" cy="628" r="186" fill="#fffdf8" stroke="#f0d7a3" stroke-width="6" filter="url(#softGlow)" />
    <circle cx="566" cy="628" r="154" fill="#ffffff" fill-opacity="0.36" stroke="#ffffff" stroke-width="8" opacity="0.95" />
    <circle cx="566" cy="628" r="128" fill="#fff8f0" fill-opacity="0.72" stroke="#f0d7a3" stroke-width="4" />
    <text x="566" y="652" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#5f324a">${initials}</text>

    <path d="M 390 815 C 440 760, 692 760, 742 815 L 742 853 C 692 898, 440 898, 390 853 Z" fill="url(#ribbon)" />
    <path d="M 390 815 L 364 836 L 390 853" fill="#4f2e63" />
    <path d="M 742 815 L 768 836 L 742 853" fill="#4f2e63" />
    <text x="566" y="840" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="4" fill="#fff7ef">A WISH WALL FOR</text>

    <text x="566" y="956" text-anchor="middle" font-family="Georgia, serif" font-size="74" fill="#5f3a76">${celebrantName}</text>
    <line x1="440" y1="1012" x2="692" y2="1012" stroke="#e4c57d" stroke-width="3" />
    <circle cx="566" cy="1012" r="8" fill="#e4c57d" />

    ${messageSvgLines}

    <g transform="translate(0,0)">
      <rect x="288" y="1242" width="${ribbonWidth}" height="118" rx="59" fill="#ede4f4" stroke="#d6cae2" stroke-width="3" filter="url(#shadow)" />
      <text x="566" y="1312" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#4f2e63">${publicUrl}</text>
      <circle cx="450" cy="1302" r="18" fill="#ffffff" opacity="0.5" />
      <circle cx="478" cy="1290" r="12" fill="#ffffff" opacity="0.35" />
      ${renderArrows()}
    </g>
  </svg>`;
}
