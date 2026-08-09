import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Lock, CheckCircle2, Clock, ShieldCheck, Download, Search, LogOut, Image, X } from "lucide-react";
import {
  ADMIN_PASSCODE,
  fetchIssues,
  supabase,
  categoryColor,
  categoryLabel,
  STATUS_META,
  type Issue,
  type IssueStatus,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "CivicPulse — Admin" }],
  }),
  component: AdminPage,
});

const STATUS_ORDER: IssueStatus[] = ["unverified", "verified", "in_progress", "resolved"];

function exportToCSV(issues: Issue[]) {
  const headers = [
    "ID",
    "Category",
    "Title",
    "Description",
    "City",
    "Latitude",
    "Longitude",
    "Status",
    "Severity",
    "Upvotes",
    "Reported At",
    "Photo URL",
  ];
  const rows = issues.map((i) => [
    i.id,
    i.category,
    `"${(i.title ?? "").replace(/"/g, '""')}"`,
    `"${(i.description ?? "").replace(/"/g, '""')}"`,
    `"${(i.city ?? "").replace(/"/g, '""')}"`,
    i.latitude,
    i.longitude,
    i.status,
    i.severity ?? "",
    i.upvote_count ?? 0,
    i.reported_at,
    i.photo_url ?? "",
  ]);
  const csvContent =
    "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `civicpulse_reports_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("cp_admin_ok") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let active = true;
    fetchIssues()
      .then((rows) => active && setIssues(rows))
      .catch((e) => toast.error("Couldn't load issues", { description: e?.message }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [authed]);

  const stats = useMemo(() => {
    const resolved = issues.filter((i) => i.status === "resolved");
    const withDates = resolved.filter((i) => i.reported_at);
    const avgHours =
      withDates.length > 0
        ? Math.round(
            withDates.reduce((sum, i) => {
              const reported = new Date(i.reported_at).getTime();
              return sum + Math.max(0, (Date.now() - reported) / 3600000);
            }, 0) / withDates.length,
          )
        : 0;
    return {
      total: issues.length,
      unverified: issues.filter((i) => i.status === "unverified").length,
      inProgress: issues.filter((i) => i.status === "in_progress").length,
      resolved: resolved.length,
      avgHours,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return issues.filter((i) => {
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      const title = (i.title ?? "").toLowerCase();
      const city = (i.city ?? "").toLowerCase();
      const category = (i.category ?? "").toLowerCase();
      const id = String(i.id).toLowerCase();
      return title.includes(q) || city.includes(q) || category.includes(q) || id.includes(q);
    });
  }, [issues, searchQuery, statusFilter]);

  const updateStatus = async (issue: Issue, status: IssueStatus) => {
    setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, status } : i)));
    const { error } = await supabase.from("issues").update({ status }).eq("id", issue.id);
    if (error) {
      toast.error("Failed to update status", { description: error.message });
    } else {
      toast.success(`Marked as ${STATUS_META[status]?.label ?? status}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cp_admin_ok");
    setAuthed(false);
    setPasscode("");
    toast.info("Logged out successfully");
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D0D0F] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passcode === ADMIN_PASSCODE) {
              sessionStorage.setItem("cp_admin_ok", "1");
              setAuthed(true);
            } else {
              toast.error("Incorrect passcode");
            }
          }}
          className="glass w-full max-w-sm rounded-3xl p-8"
        >
          <div className="flex items-center gap-2 text-[#E8A855]">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-semibold">Municipal Admin Access</span>
          </div>
          <p className="mt-2 text-xs text-foreground/50">
            For ward officers reviewing and resolving citizen reports.
          </p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-[#F2F0EB] outline-none focus:border-[#E8A855]/60"
          />
          <button
            type="submit"
            className="glow-amber mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-[#1a1408]"
            style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
          >
            Continue
          </button>
          <Toaster position="top-center" />
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] px-4 py-12 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#E8A855]">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-[11px] tracking-[0.16em] uppercase">Admin · Status Console</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-[#F2F0EB] sm:text-4xl">
              Review & resolve reports
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportToCSV(filteredIssues)}
              disabled={issues.length === 0}
              className="glass inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-[#F2F0EB]/85 transition-colors hover:text-white disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-[#E8A855]" />
              Export CSV ({filteredIssues.length})
            </button>
            <button
              onClick={handleLogout}
              className="glass inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} color="#E8A855" icon={<Clock className="h-4 w-4" />} />
          <StatCard label="Unverified" value={stats.unverified} color="#8B8880" icon={<Clock className="h-4 w-4" />} />
          <StatCard label="In progress" value={stats.inProgress} color="#E8A855" icon={<Clock className="h-4 w-4" />} />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            color="#6F9E7F"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, city or category..."
              className="w-full rounded-2xl border border-white/10 bg-white/4 py-3 pl-10 pr-4 text-xs text-[#F2F0EB] placeholder:text-foreground/35 outline-none transition-colors focus:border-[#E8A855]/60"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "all"
                  ? "border-[#E8A855]/60 bg-[#E8A855]/20 text-[#E8A855]"
                  : "border-white/10 bg-transparent text-foreground/45 hover:text-foreground/75"
              }`}
            >
              All ({issues.length})
            </button>
            {STATUS_ORDER.map((s) => {
              const meta = STATUS_META[s]!;
              const active = statusFilter === s;
              const count = issues.filter((i) => i.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    borderColor: active ? `${meta.color}90` : "rgba(242,240,235,0.12)",
                    background: active ? `${meta.color}22` : "transparent",
                    color: active ? meta.color : "rgba(242,240,235,0.45)",
                  }}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-sm text-foreground/50">Loading reports…</p>}
          {!loading && filteredIssues.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-sm text-foreground/45">
              No reports found matching your criteria.
            </div>
          )}
          {!loading &&
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  {issue.photo_url ? (
                    <button
                      onClick={() => setActivePhoto(issue.photo_url)}
                      className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40"
                    >
                      <img src={issue.photo_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Image className="h-4 w-4 text-white" />
                      </div>
                    </button>
                  ) : (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        background: categoryColor(issue.category),
                        boxShadow: `0 0 10px ${categoryColor(issue.category)}`,
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[#F2F0EB]">
                      {issue.title || categoryLabel(issue.category)}
                    </div>
                    <div className="mt-0.5 text-xs text-foreground/45">
                      {categoryLabel(issue.category)} · {issue.city || "Unknown location"} ·{" "}
                      {new Date(issue.reported_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_ORDER.map((s) => {
                    const meta = STATUS_META[s]!;
                    const active = issue.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(issue, s)}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          borderColor: active ? `${meta.color}90` : "rgba(242,240,235,0.12)",
                          background: active ? `${meta.color}25` : "transparent",
                          color: active ? meta.color : "rgba(242,240,235,0.45)",
                          boxShadow: active ? `0 0 12px ${meta.color}30` : "none",
                        }}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#16161a]">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={activePhoto} alt="Evidence photo" className="max-h-[80vh] w-full object-contain" />
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-foreground/45 uppercase">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
