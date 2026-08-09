/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from "http";

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
}

const PROMPT = `You analyze photos of civic infrastructure issues in India.
Return ONLY valid JSON with this exact shape:
{
  "category": "road" | "streetlight" | "garbage" | "water",
  "title": "short headline under 60 chars",
  "description": "2-3 sentences describing the issue for municipal authorities",
  "severity": "low" | "medium" | "high"
}
Pick the best category. Be specific and practical.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Gemini API key not configured" });
  }

  const { imageBase64, mimeType = "image/jpeg" } = (req.body ?? {}) as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!imageBase64) {
    return res.status(400).json({ error: "Missing imageBase64" });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({ error: errText });
    }

    const data = (await geminiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "Empty response from Gemini" });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: "Could not parse AI response" });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      category?: string;
      title?: string;
      description?: string;
      severity?: string;
    };

    const category = ["road", "streetlight", "garbage", "water"].includes(parsed.category ?? "")
      ? parsed.category
      : "road";
    const severity = ["low", "medium", "high"].includes(parsed.severity ?? "")
      ? parsed.severity
      : "medium";

    return res.status(200).json({
      category,
      title: parsed.title?.slice(0, 80) ?? "Civic infrastructure issue",
      description: parsed.description ?? "",
      severity,
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
