import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Clock, ShieldCheck, Wrench } from "lucide-react";
import { categoryColor, type Issue, type IssueStatus } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { categoryLabelI18n, statusLabel } from "@/i18n/translations";
import { Reveal } from "./Reveal";

function getMyIds(): (string | number)[] {
  try {
    const raw = localStorage.getItem("cp_my_reports");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const STAGES: { status: IssueStatus; labelEn: string; labelHi: string; icon: typeof Clock }[] = [
  { status: "unverified", labelEn: "Reported", labelHi: "रिपोर्ट की गई", icon: Clock },
  { status: "verified", labelEn: "Verified", labelHi: "सत्यापित", icon: ShieldCheck },
  { status: "in_progress", labelEn: "In Progress", labelHi: "प्रगति में", icon: Wrench },
  { status: "resolved", labelEn: "Resolved", labelHi: "हल", icon: CheckCircle2 },
];

function getStageIndex(status: string): number {
  switch (status) {
    case "resolved":
      return 3;
    case "in_progress":
      return 2;
    case "verified":
      return 1;
    default:
      return 0;
  }
}

export function MyReports({ issues }: { issues: Issue[] }) {
  const { t, lang } = useLanguage();
  const [ids, setIds] = useState<(string | number)[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setIds(getMyIds());
    const onFocus = () => setIds(getMyIds());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [issues]);

  const mine = issues.filter((i) => ids.some((id) => String(id) === String(i.id)));

  if (mine.length === 0) return null;

  return (
    <section className="relative px-4 pb-6 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="glass rounded-3xl p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#E8A855]" />
                <span className="text-[11px] tracking-[0.16em] text-foreground/45 uppercase">
                  {t.yourReportsDevice} ({mine.length})
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {mine.map((issue) => {
                const currentStageIdx = getStageIndex(issue.status);
                const isExpanded = expandedId === issue.id || mine.length === 1;
                const statusColor =
                  issue.status === "resolved"
                    ? "#6F9E7F"
                    : issue.status === "in_progress"
                      ? "#E8A855"
                      : issue.status === "verified"
                        ? "#1B6B5C"
                        : "#8B8880";

                return (
                  <div
                    key={issue.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 transition-colors hover:border-white/15"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between gap-3"
                      onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            background: categoryColor(issue.category),
                            boxShadow: `0 0 8px ${categoryColor(issue.category)}`,
                          }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-[#F2F0EB]">
                            {issue.title || categoryLabelI18n(issue.category, lang)}
                          </div>
                          <div className="text-[11px] text-foreground/45">
                            {issue.city || t.locationCaptured} ·{" "}
                            {new Date(issue.reported_at).toLocaleDateString(
                              lang === "hi" ? "hi-IN" : "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium"
                        style={{
                          color: statusColor,
                          background: `${statusColor}1f`,
                          border: `1px solid ${statusColor}55`,
                        }}
                      >
                        {statusLabel(issue.status, lang)}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 border-t border-white/6 pt-4">
                        <div className="mb-2 text-[10px] font-medium tracking-[0.14em] text-foreground/40 uppercase">
                          {t.statusLifecycle}
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                          {STAGES.map((st, idx) => {
                            const active = idx <= currentStageIdx;
                            const isCurrent = idx === currentStageIdx;
                            const Icon = st.icon;
                            const color = isCurrent ? statusColor : active ? "#1B6B5C" : "rgba(242,240,235,0.2)";
                            return (
                              <div
                                key={st.status}
                                className="flex flex-col items-center gap-1.5 text-center"
                              >
                                <div
                                  className="grid h-7 w-7 place-items-center rounded-full transition-all"
                                  style={{
                                    background: active ? `${color}25` : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
                                    color: active ? color : "rgba(242,240,235,0.3)",
                                    boxShadow: isCurrent ? `0 0 10px ${color}55` : "none",
                                  }}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span
                                  className="text-[10px] font-medium"
                                  style={{ color: active ? color : "rgba(242,240,235,0.35)" }}
                                >
                                  {lang === "hi" ? st.labelHi : st.labelEn}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
