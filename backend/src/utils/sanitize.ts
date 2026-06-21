export function sanitizePlainText(value: string) {
  const withoutTags = value.replace(/<[^>]*>/g, " ");
  const normalizedLines = withoutTags
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return normalizedLines.trim();
}
