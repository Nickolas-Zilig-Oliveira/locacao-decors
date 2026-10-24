const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB, matches the storage bucket limit

/** Client-side check mirroring the storage bucket's own limits, for a fast error message. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Envie uma imagem em JPG, PNG, WEBP ou GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "A imagem deve ter no máximo 8MB.";
  }
  return null;
}
