import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, STATUS_META, type Issue, type IssueCategory } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { categoryLabelI18n, statusLabel } from "@/i18n/translations";
import { Reveal } from "./Reveal";

const IssueMap = lazy(() => import("./IssueMap"));

const STATUS_FILTERS = ["unverified", "verified", "in_progress", "resolved"] as const;

export function MapSection({
  issues,
  newIds,
  onUpvote,
  focusIssueId,
  onReport,
}: {
  issues: Issue[];
  newIds: Set<string>;
  onUpvote: (issue: Issue) => void;
  focusIssueId?: string | null | undefined;
  onReport?: () => void;
}) {
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Set<IssueCategory>>(
    new Set(CATEGORIES.map((c) => c.key)),
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set(STATUS_FILTERS));
  useEffect(() => setMounted(true), []);

  const toggleCat = (key: IssueCategory) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleStatus = (key: string) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return issues.filter((i) => {
      const matchCat = activeCats.has(i.category as IssueCategory);
      const matchStatus = activeStatuses.has(i.status);
      if (!matchCat || !matchStatus) return false;
      if (!q) return true;
      const title = (i.title ?? "").toLowerCase();
      const city = (i.city ?? "").toLowerCase();
      const category = (i.category ?? "").toLowerCase();
      return title.includes(q) || city.includes(q) || category.includes(q);
    });
  }, [issues, activeCats, activeStatuses, searchQuery]);

  const showEmpty = filtered.length === 0;

  return (
    <section id="map" className="relative px-4 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">{t.mapTitle}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/55">
                {t.mapSubtitle}
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "hi" ? "शहर, शीर्षक या श्रेणी खोजें..." : "Search city, title or category..."}
                className="w-full rounded-full border border-white/10 bg-white/4 py-2.5 pl-10 pr-4 text-xs text-[#F2F0EB] placeholder:text-foreground/35 outline-none transition-colors focus:border-[#E8A855]/60"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] tracking-[0.14em] text-foreground/40 uppercase">
              {t.category}
            </span>
            {CATEGORIES.map((c) => {
              const active = activeCats.has(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCat(c.key)}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200"
                  style={{
                    borderColor: active ? `${c.color}80` : "rgba(242,240,235,0.12)",
                    background: active ? `${c.color}1a` : "rgba(255,255,255,0.02)",
                    color: active ? c.color : "rgba(242,240,235,0.4)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: active ? c.color : "rgba(242,240,235,0.25)",
                      boxShadow: active ? `0 0 8px ${c.color}` : "none",
                    }}
                  />
                  {categoryLabelI18n(c.key, lang)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] tracking-[0.14em] text-foreground/40 uppercase">
              {t.status}
            </span>
            {STATUS_FILTERS.map((s) => {
              const meta = STATUS_META[s]!;
              const active = activeStatuses.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200"
                  style={{
                    borderColor: active ? `${meta.color}80` : "rgba(242,240,235,0.12)",
                    background: active ? `${meta.color}1a` : "rgba(255,255,255,0.02)",
                    color: active ? meta.color : "rgba(242,240,235,0.4)",
                  }}
                >
                  {statusLabel(s, lang)}
                </button>
              );
            })}
            <span className="ml-auto text-xs text-foreground/40">
              {t.showing} {filtered.length} {t.of} {issues.length}
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="glass relative mt-6 overflow-hidden rounded-3xl p-2 sm:p-3">
            <div className="relative h-[26rem] overflow-hidden rounded-[1.25rem] sm:h-[34rem]">
              {mounted ? (
                <Suspense fallback={<MapSkeleton label={t.loadingMap} />}>
                  <IssueMap
                    issues={filtered}
                    newIds={newIds}
                    onUpvote={onUpvote}
                    focusIssueId={focusIssueId}
                  />
                </Suspense>
              ) : (
                <MapSkeleton label={t.loadingMap} />
              )}
              {showEmpty && (
                <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-[#0D0D0F]/75 backdrop-blur-sm">
                  <div className="pointer-events-auto max-w-xs px-6 text-center">
                    <p className="text-sm font-medium text-foreground/80">
                      {issues.length === 0 ? t.noIssuesYet : t.noIssuesFiltered}
                    </p>
                    {issues.length === 0 && onReport && (
                      <>
                        <p className="mt-2 text-xs text-foreground/45">{t.beFirst}</p>
                        <button
                          onClick={onReport}
                          className="glow-amber mt-4 rounded-xl px-5 py-2.5 text-xs font-semibold text-[#1a1408]"
                          style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
                        >
                          {t.reportIssue}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MapSkeleton({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-[#101014] text-sm text-foreground/40">
      {label}
    </div>
  );
}
