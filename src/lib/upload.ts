import { createClient } from "@/lib/supabase/client";

// Phone cameras produce big files (12–50 MP). Everything is shrunk in the browser
// before it is uploaded, so the source limit only guards against absurd files.
const MAX_SOURCE_BYTES = 80 * 1024 * 1024;

export const PHOTO_OPEN_ERROR =
  "Não consegui abrir essa foto. Tente outra, ou tire um print dela e envie o print.";

/** Quick sanity check. The real validation is whether the browser can decode it (see prepareImage). */
export function validateImageFile(file: File): string | null {
  if (!file.size) return "Essa foto veio vazia. Escolha ou tire outra.";
  if (file.size > MAX_SOURCE_BYTES) return "A foto é grande demais (máximo 80 MB). Escolha outra.";
  return null;
}

type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    for (const options of [{ imageOrientation: "from-image" as const }, undefined]) {
      try {
        const bitmap = await (options ? createImageBitmap(file, options) : createImageBitmap(file));
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
      } catch {
        // try the next strategy
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } catch {
    throw new Error(PHOTO_OPEN_ERROR);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

/**
 * Opens a photo from the phone, fixes its rotation and shrinks it so cropping and
 * uploading are fast and never run out of memory. Returns a JPEG (or a PNG when
 * `keepAlpha` is set and the source can be transparent).
 */
export async function prepareImage(
  file: File,
  opts: { maxSide?: number; keepAlpha?: boolean } = {}
): Promise<File> {
  const maxSide = opts.maxSide ?? 2400;
  const decoded = await decode(file);
  try {
    const { width, height } = decoded;
    if (!width || !height) throw new Error(PHOTO_OPEN_ERROR);

    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(PHOTO_OPEN_ERROR);

    const png = Boolean(opts.keepAlpha) && /png|webp|gif/i.test(file.type);
    if (!png) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

    const type = png ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
    if (!blob) throw new Error(PHOTO_OPEN_ERROR);
    return new File([blob], png ? "foto.png" : "foto.jpg", { type });
  } finally {
    decoded.close();
  }
}

/** Uploads to the public photos bucket, retrying on flaky mobile connections. Returns the public URL. */
export async function uploadPhoto(blob: Blob, folder: string, prefix = ""): Promise<string> {
  const supabase = createClient();
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const path = `${folder}/${prefix}${crypto.randomUUID()}.${ext}`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.storage.from("item-photos").upload(path, blob, {
      contentType: blob.type || "image/jpeg",
      cacheControl: "31536000",
    });
    if (!error) return supabase.storage.from("item-photos").getPublicUrl(path).data.publicUrl;
    lastError = error;
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  console.error("photo upload failed", lastError);
  throw new Error("Não consegui enviar a foto. Confira a internet e tente de novo.");
}
