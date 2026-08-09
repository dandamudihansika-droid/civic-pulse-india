import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ??
  "https://qudpqkszelininuiqavu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ??
  "sb_publishable_r5lNmQvNtJMzk_qyqtHFuA_pFxyNbEy";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type IssueCategory = "road" | "streetlight" | "garbage" | "water";
export type IssueStatus = "unverified" | "verified" | "in_progress" | "resolved";

export type Issue = {
  id: string;
  category: string;
  title: string | null;
  description: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  status: string;
  upvote_count: number;
  severity: string | null;
  reported_at: string;
  photo_url: string | null;
};

export const CATEGORIES: {
  key: IssueCategory;
  label: string;
  color: string;
}[] = [
  { key: "road", label: "Road / Pothole", color: "#E8A855" },
  { key: "streetlight", label: "Streetlight", color: "#F4C542" },
  { key: "garbage", label: "Garbage", color: "#B5651D" },
  { key: "water", label: "Water / Drainage", color: "#1B6B5C" },
];

export const categoryColor = (category: string) =>
  CATEGORIES.find((c) => c.key === category)?.color ?? "#E8A855";

export const categoryLabel = (category: string) =>
  CATEGORIES.find((c) => c.key === category)?.label ?? category;

export const STATUS_META: Record<string, { label: string; color: string }> = {
  unverified: { label: "Unverified", color: "#8B8880" },
  verified: { label: "Verified", color: "#1B6B5C" },
  in_progress: { label: "In Progress", color: "#E8A855" },
  resolved: { label: "Resolved", color: "#6F9E7F" },
};

export async function fetchIssues(): Promise<Issue[]> {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .order("reported_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as Issue[];
}

export const ADMIN_PASSCODE =
  (import.meta.env["VITE_ADMIN_PASSCODE"] as string | undefined) ?? "civicpulse2026";
