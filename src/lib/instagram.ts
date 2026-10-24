export function instagramLink(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://instagram.com/${trimmed.replace(/^@/, "")}`;
}
