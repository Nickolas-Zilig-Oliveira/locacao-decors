"use server";

import { getCurrentTenant } from "@/lib/data/admin";

export type SuggestItemDetailsResult =
  | { ok: true; name: string; description: string }
  | { ok: false; error: string };

/**
 * Looks at the item's photo and suggests a short name + description,
 * using Google's Gemini API (free tier). Requires GEMINI_API_KEY to be
 * set — get one at https://aistudio.google.com/apikey and add it to the
 * project's environment variables (Vercel: Project Settings → Environment
 * Variables). Without it, this just returns a friendly error.
 */
export async function suggestItemDetails(imageUrl: string): Promise<SuggestItemDetailsResult> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, error: "Não autorizado." };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "Sugestão por IA ainda não está ativada. Peça pra Ziligz configurar a chave da IA.",
    };
  }

  if (!imageUrl) {
    return { ok: false, error: "Envie uma foto primeiro." };
  }

  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return { ok: false, error: "Não foi possível ler a foto." };
    const imgBuf = await imgRes.arrayBuffer();
    const base64 = Buffer.from(imgBuf).toString("base64");
    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

    const prompt = `Você é especialista em marketing para uma loja de locação de decoração de festas (kits de balões, painéis, enfeites etc). Olhe a foto do item e sugira, em português do Brasil:
- "name": um nome curto e atrativo pro item (máximo 40 caracteres, sem aspas, sem emoji)
- "description": uma descrição de venda, 2 a 3 frases curtas (máximo 280 caracteres), destacando tema/ocasião e o que está incluso, em tom convidativo

Responda SOMENTE com um JSON válido no formato {"name": "...", "description": "..."}, sem markdown, sem texto antes ou depois.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) {
      console.error("Gemini API error", res.status, await res.text());
      return { ok: false, error: "A IA não respondeu. Tente novamente em instantes." };
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { ok: false, error: "A IA não retornou uma sugestão. Tente de novo." };

    let parsed: { name?: unknown; description?: unknown };
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "Resposta inesperada da IA. Tente de novo." };
    }

    const name = typeof parsed.name === "string" ? parsed.name.trim().slice(0, 60) : "";
    const description = typeof parsed.description === "string" ? parsed.description.trim().slice(0, 500) : "";
    if (!name || !description) {
      return { ok: false, error: "A IA não conseguiu sugerir dessa foto. Tente outra." };
    }

    return { ok: true, name, description };
  } catch {
    return { ok: false, error: "Erro ao gerar sugestão. Tente novamente." };
  }
}
