import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { CATEGORIES, categoryColor, type Issue } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { categoryLabelI18n } from "@/i18n/translations";
import { Reveal } from "./Reveal";

export function ImpactDashboard({ issues }: { issues: Issue[] }) {
  const { t, lang } = useLanguage();

  const byCategory = useMemo(() => {
    const counts = CATEGORIES.map((c) => ({
      ...c,
      count: issues.filter((i) => i.category === c.key).length,
    }));
    const others = issues.filter((i) => !CATEGORIES.some((c) => c.key === i.category)).length;
    if (others) counts.push({ key: "other" as never, label: "Other", color: "#8B8880", count: others });
    return counts.sort((a, b) => b.count - a.count);
  }, [issues]);

  const cities = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of issues) {
      const c = (i.city ?? "").trim();
      if (!c) continue;
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [issues]);

  const trend = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
          day: "numeric",
          month: "short",
        }),
        count: 0,
      });
    }
    const byDate = new Map(days.map((d) => [d.date, d]));
    for (const i of issues) {
      const key = (i.reported_at ?? "").slice(0, 10);
      const entry = byDate.get(key);
      if (entry) entry.count += 1;
    }
    return days;
  }, [issues, lang]);

  const max = Math.max(1, ...byCategory.map((c) => c.count));
  const resolved = issues.filter((i) => i.status === "resolved").length;
  const upvotes = issues.reduce((s, i) => s + (i.upvote_count ?? 0), 0);
  const resolutionRate = issues.length ? Math.round((resolved / issues.length) * 100) : 0;

  return (
    <section id="impact" className="relative px-4 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">{t.impactTitle}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/55">
            {t.impactSubtitle}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <Reveal delay={60}>
            <div className="glass flex h-full flex-col justify-between gap-6 rounded-3xl p-7">
              <span className="text-[11px] tracking-[0.16em] text-foreground/45 uppercase">
                {t.totalReports}
              </span>
              <div>
                <div className="text-5xl font-semibold tabular-nums" style={{ color: "#E8A855" }}>
                  {issues.length.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Stat label={t.resolved} value={resolved} color="#6F9E7F" lang={lang} />
                  <Stat label={t.upvotes} value={upvotes} color="#F4C542" lang={lang} />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="glass h-full rounded-3xl p-7">
              <span className="text-[11px] tracking-[0.16em] text-foreground/45 uppercase">
                {t.byCategory}
              </span>
              <div className="mt-6 space-y-4">
                {byCategory.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-foreground/70">
                        {categoryLabelI18n(c.key, lang) || c.label}
                      </span>
                      <span className="tabular-nums text-foreground/50">{c.count}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-out"
                        style={{
                          width: `${Math.max(3, (c.count / max) * 100)}%`,
                          background: `linear-gradient(90deg, ${c.color}, ${c.color}99)`,
                          boxShadow: `0 0 14px ${c.color}66`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div className="glass h-full rounded-3xl p-7">
              <span className="text-[11px] tracking-[0.16em] text-foreground/45 uppercase">
                {t.mostCities}
              </span>
              <ol className="mt-6 space-y-2.5">
                {cities.length === 0 && (
                  <li className="text-sm text-foreground/40">{t.noCityData}</li>
                )}
                {cities.map(([city, count], idx) => (
                  <li
                    key={city}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
                      style={{
                        color: idx === 0 ? "#1a1408" : "#F2F0EB",
                        background:
                          idx === 0
                            ? "linear-gradient(135deg,#F4C542,#E8A855)"
                            : "rgba(255,255,255,0.07)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{city}</span>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: categoryColor("road") }}
                    >
                      {count}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <Reveal delay={280}>
          <div className="glass mt-5 rounded-3xl p-7">
            <div className="flex items-center justify-between">
              <span className="text-[11px] tracking-[0.16em] text-foreground/45 uppercase">
                {t.last14Days}
              </span>
              <span
                className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                style={{
                  borderColor: "rgba(111,158,127,0.5)",
                  background: "rgba(111,158,127,0.14)",
                  color: "#6F9E7F",
                }}
              >
                {resolutionRate}% {t.percentResolved}
              </span>
            </div>
            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8A855" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#E8A855" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(242,240,235,0.35)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "rgba(242,240,235,0.35)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#16161a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#F2F0EB" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#E8A855"
                    strokeWidth={2}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
  lang,
}: {
  label: string;
  value: number;
  color: string;
  lang: "en" | "hi";
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
      <div className="text-xl font-semibold tabular-nums" style={{ color }}>
        {value.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}
      </div>
      <div className="mt-0.5 text-[11px] text-foreground/45">{label}</div>
    </div>
  );
}
