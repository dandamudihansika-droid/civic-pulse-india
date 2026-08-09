import type { IssueCategory } from "@/lib/supabase";

export type IssueAnalysis = {
  category: IssueCategory;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  usedDemo: boolean;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function demoAnalysis(): IssueAnalysis {
  return {
    category: "road",
    title: "Road surface damage reported",
    description:
      "Visible infrastructure damage affecting local traffic and safety. Municipal repair recommended.",
    severity: "medium",
    usedDemo: true,
  };
}

export async function analyzeIssuePhoto(file: File): Promise<IssueAnalysis> {
  try {
    const imageBase64 = await fileToBase64(file);
    const response = await fetch("/api/analyze-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType: file.type || "image/jpeg" }),
    });

    if (!response.ok) throw new Error("Analysis unavailable");

    const data = (await response.json()) as {
      category?: IssueCategory;
      title?: string;
      description?: string;
      severity?: "low" | "medium" | "high";
      error?: string;
    };

    if (data.error) throw new Error(data.error);

    return {
      category: data.category ?? "road",
      title: data.title ?? "Civic infrastructure issue",
      description: data.description ?? "",
      severity: data.severity ?? "medium",
      usedDemo: false,
    };
  } catch {
    return demoAnalysis();
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env["VITE_GEMINI_API_KEY"]);
}
