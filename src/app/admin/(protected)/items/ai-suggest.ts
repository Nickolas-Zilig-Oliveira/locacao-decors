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
export async function suggestItemDetails(
  imageUrl: string,
  currentName?: string
): Promise<SuggestItemDetailsResult> {
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

    const trimmedName = currentName?.trim();
    const prompt = trimmedName
      ? `Você é especialista em marketing para uma loja de locação de decoração de festas (kits de balões, painéis, enfeites etc). O item já se chama "${trimmedName}". Olhe a foto e, combinando com esse nome, escreva em português do Brasil:
- "name": repita exatamente o nome "${trimmedName}" (não mude, só devolva igual)
- "description": uma descrição de venda, 2 a 3 frases curtas (máximo 280 caracteres), que combine com o nome "${trimmedName}" e com o que aparece na foto, destacando tema/ocasião e o que está incluso, em tom convidativo

Responda SOMENTE com um JSON válido no formato {"name": "...", "description": "..."}, sem markdown, sem texto antes ou depois.`
      : `Você é especialista em marketing para uma loja de locação de decoração de festas (kits de balões, painéis, enfeites etc). Olhe a foto do item e sugira, em português do Brasil:
- "name": um nome curto e atrativo pro item (máximo 40 caracteres, sem aspas, sem emoji)
- "description": uma descrição de venda, 2 a 3 frases curtas (máximo 280 caracteres), destacando tema/ocasião e o que está incluso, em tom convidativo

Responda SOMENTE com um JSON válido no formato {"name": "...", "description": "..."}, sem markdown, sem texto antes ou depois.`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    // The free Gemini tier sometimes answers "overloaded"/"rate limited" for a moment.
    // Retry the fast model once, then fall back to the standard one before giving up.
    const attempts = ["gemini-flash-lite-latest", "gemini-flash-lite-latest", "gemini-flash-latest"];
    let res: Response | null = null;
    for (let i = 0; i < attempts.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 900));
      try {
        const attempt = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${attempts[i]}:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(15000) }
        );
        if (attempt.ok) {
          res = attempt;
          break;
        }
        console.error("Gemini API error", attempts[i], attempt.status, await attempt.text());
        if (![408, 429, 500, 502, 503, 504].includes(attempt.status)) break;
      } catch (err) {
        console.error("Gemini request failed", attempts[i], err);
      }
    }

    if (!res) {
      return { ok: false, error: "A IA está ocupada agora. Toque em sugerir de novo em alguns segundos." };
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
