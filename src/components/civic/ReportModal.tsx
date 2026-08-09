import { useCallback, useEffect, useRef, useState } from "react";
import {
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  X,
  Plus,
  MapPin,
  Loader2,
  ImagePlus,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, supabase, type IssueCategory } from "@/lib/supabase";
import { analyzeIssuePhoto } from "@/lib/gemini";
import { useLanguage } from "@/context/LanguageContext";
import { categoryLabelI18n } from "@/i18n/translations";

const ICONS: Record<IssueCategory, typeof Construction> = {
  road: Construction,
  streetlight: Lightbulb,
  garbage: Trash2,
  water: Droplets,
};

const SEVERITIES = ["low", "medium", "high"] as const;

export function ReportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const [category, setCategory] = useState<IssueCategory>("road");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error(t.geolocationUnavailable);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = +pos.coords.latitude.toFixed(6);
        const lng = +pos.coords.longitude.toFixed(6);
        setCoords({ lat, lng });
        setLocating(false);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
          );
          const json = await res.json();
          setCity(
            json?.address?.city ??
              json?.address?.town ??
              json?.address?.state_district ??
              json?.address?.state ??
              null,
          );
        } catch {
          /* best effort */
        }
      },
      () => {
        setLocating(false);
        toast.error(t.locationDenied);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, [t]);

  useEffect(() => {
    if (open && !coords) capture();
  }, [open, coords, capture]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setSeverity("medium");
    setCategory("road");
    setAiApplied(false);
  };

  async function runAiAnalysis(selectedFile: File) {
    setAnalyzing(true);
    try {
      const result = await analyzeIssuePhoto(selectedFile);
      setCategory(result.category);
      setTitle(result.title);
      setDescription(result.description);
      setSeverity(result.severity);
      setAiApplied(true);
      toast.success(t.aiApplied);
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

async function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

  async function handleFileSelect(f: File | null) {
    if (!f?.type.startsWith("image/")) return;
    const compressed = await compressImage(f);
    setFile(compressed);
    setAiApplied(false);
    await runAiAnalysis(compressed);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error(t.photoRequiredError);
      return;
    }
    if (!coords) {
      toast.error(t.gpsRequiredError);
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${
        file.name.split(".").pop() ?? "jpg"
      }`;
      const { error: upErr } = await supabase.storage
        .from("issue-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!upErr) {
        photo_url = supabase.storage.from("issue-photos").getPublicUrl(path).data.publicUrl;
      }

      const { data: inserted, error } = await supabase
        .from("issues")
        .insert({
          category,
          title: title.trim() || `${categoryLabelI18n(category, lang)} issue`,
          description: description.trim() || null,
          city,
          latitude: coords.lat,
          longitude: coords.lng,
          status: "unverified",
          upvote_count: 0,
          severity,
          reported_at: new Date().toISOString(),
          photo_url,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (inserted?.id != null) {
        try {
          const raw = localStorage.getItem("cp_my_reports");
          const ids: (string | number)[] = raw ? JSON.parse(raw) : [];
          ids.unshift(inserted.id);
          localStorage.setItem("cp_my_reports", JSON.stringify(ids.slice(0, 50)));
        } catch {
          /* best effort */
        }
      }

      toast.success(t.reportSubmitted);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit the report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="glass-strong animate-in fade-in zoom-in-95 relative flex h-[100svh] w-full max-w-lg flex-col overflow-hidden duration-300 sm:h-auto sm:max-h-[88svh] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-xl font-semibold">{t.reportModalTitle}</h3>
            <p className="mt-1 text-xs text-foreground/50">{t.reportModalSubtitle}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-white/10 p-2 text-foreground/60 transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div>
            <Label>{t.category}</Label>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((c) => {
                const Icon = ICONS[c.key];
                const active = category === c.key;
                return (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className="flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-[11px] font-medium transition-all duration-300 hover:scale-[1.04]"
                    style={{
                      borderColor: active ? `${c.color}88` : "rgba(242,240,235,0.1)",
                      background: active ? `${c.color}1f` : "rgba(255,255,255,0.03)",
                      boxShadow: active ? `0 10px 30px -12px ${c.color}` : "none",
                      color: active ? c.color : "rgba(242,240,235,0.65)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {categoryLabelI18n(c.key, lang).split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Label>{t.title}</Label>
              {aiApplied && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#E8A855]/40 bg-[#E8A855]/10 px-2 py-0.5 text-[10px] text-[#E8A855]">
                  <Sparkles className="h-3 w-3" />
                  {t.aiSuggested}
                </span>
              )}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm outline-none transition-colors placeholder:text-foreground/30 focus:border-[#E8A855]/60"
            />
          </div>

          <div>
            <Label>{t.description}</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t.descriptionPlaceholder}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm outline-none transition-colors placeholder:text-foreground/30 focus:border-[#E8A855]/60"
            />
          </div>

          <div>
            <Label>{t.severity}</Label>
            <div className="mt-2 flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                    severity === s
                      ? "border-[#1B6B5C]/70 bg-[#1B6B5C]/25 text-[#7FD3BE]"
                      : "border-white/10 bg-white/4 text-foreground/55"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>{t.photoRequired}</Label>
              {file && (
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => file && runAiAnalysis(file)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#E8A855] underline underline-offset-4 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t.aiAnalyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      {t.aiAnalyze}
                    </>
                  )}
                </button>
              )}
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void handleFileSelect(f);
              }}
              onClick={() => inputRef.current?.click()}
              className="mt-2 cursor-pointer overflow-hidden rounded-2xl border border-dashed transition-colors"
              style={{
                borderColor: dragging ? "#E8A855" : "rgba(242,240,235,0.18)",
                background: dragging ? "rgba(232,168,85,0.08)" : "rgba(255,255,255,0.03)",
              }}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Selected evidence" className="h-40 w-full object-cover" />
                  {analyzing && (
                    <div className="absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-xs text-[#E8A855]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.aiAnalyzing}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <ImagePlus className="h-6 w-6 text-[#E8A855]" />
                  <span className="text-xs text-foreground/60">{t.photoHint}</span>
                  <span className="text-[10px] text-[#E8A855]/70">
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    AI auto-fills details from your photo
                  </span>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => void handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px]"
              style={{
                borderColor: coords ? "rgba(27,107,92,0.6)" : "rgba(242,240,235,0.14)",
                background: coords ? "rgba(27,107,92,0.18)" : "rgba(255,255,255,0.03)",
                color: coords ? "#7FD3BE" : "rgba(242,240,235,0.55)",
              }}
            >
              {locating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : coords ? (
                <Check className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              {locating
                ? t.capturingGps
                : coords
                  ? `${coords.lat}, ${coords.lng}${city ? ` · ${city}` : ""}`
                  : t.locationNotCaptured}
            </span>
            {!coords && !locating && (
              <button
                type="button"
                onClick={capture}
                className="text-[11px] text-[#E8A855] underline underline-offset-4"
              >
                {t.retry}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || analyzing}
            className="glow-amber flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-[#1a1408] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t.submitting : t.submitReport}
          </button>
        </form>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-[0.14em] text-foreground/45 uppercase">
      {children}
    </span>
  );
}

export function ReportFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Report an issue"
      className="glow-amber fixed right-5 bottom-5 z-[900] flex items-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-[#1a1408] transition-transform duration-300 hover:scale-105 sm:right-8 sm:bottom-8"
      style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">Report</span>
    </button>
  );
}
