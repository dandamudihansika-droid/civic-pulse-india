import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { Hero } from "@/components/civic/Hero";
import { HowItWorks } from "@/components/civic/HowItWorks";
import { SiteHeader } from "@/components/civic/SiteHeader";
import { MapSection } from "@/components/civic/MapSection";
import { MyReports } from "@/components/civic/MyReports";
import { ImpactDashboard } from "@/components/civic/ImpactDashboard";
import { Footer } from "@/components/civic/Footer";
import { ReportFab, ReportModal } from "@/components/civic/ReportModal";
import { fetchIssues, supabase, type Issue } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicPulse — Live Civic Issue Reporting for India" },
      {
        name: "description",
        content:
          "Report potholes, broken streetlights, garbage and drainage issues across India. Geotagged, photographed and tracked in real time on a public live map.",
      },
      { property: "og:title", content: "CivicPulse — Live Civic Issue Reporting for India" },
      {
        property: "og:description",
        content:
          "A public, real-time record of civic issues across India — from report to resolution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CivicPulse,
});

function CivicPulse() {
  const { t } = useLanguage();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [focusIssueId, setFocusIssueId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const issueId = params.get("issue");
    if (issueId) {
      setFocusIssueId(issueId);
      setTimeout(() => {
        document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
      }, 600);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchIssues()
      .then((rows) => active && setIssues(rows))
      .catch((e) => {
        console.error("Failed to load issues", e);
        toast.error(t.loadIssuesError, { description: e?.message ?? "Unknown error" });
      });

    const channel = supabase
      .channel("issues-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "issues" },
        (payload) => {
          const row = payload.new as Issue;
          setIssues((prev) => (prev.some((i) => i.id === row.id) ? prev : [row, ...prev]));
          setNewIds((prev) => new Set(prev).add(row.id));
          setTimeout(
            () =>
              setNewIds((prev) => {
                const next = new Set(prev);
                next.delete(row.id);
                return next;
              }),
            6000,
          );
        },
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "issues" }, (payload) => {
        const row = payload.new as Issue;
        setIssues((prev) => prev.map((i) => (i.id === row.id ? { ...i, ...row } : i)));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [t.loadIssuesError]);

  const onUpvote = useCallback(async (issue: Issue) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === issue.id ? { ...i, upvote_count: (i.upvote_count ?? 0) + 1 } : i)),
    );
    await supabase
      .from("issues")
      .update({ upvote_count: (issue.upvote_count ?? 0) + 1 })
      .eq("id", issue.id);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0D0D0F]">
      <SiteHeader onReport={() => setOpen(true)} />
      <Hero total={issues.length} onReport={() => setOpen(true)} />
      <HowItWorks />
      <MapSection
        issues={issues}
        newIds={newIds}
        onUpvote={onUpvote}
        focusIssueId={focusIssueId}
        onReport={() => setOpen(true)}
      />
      <MyReports issues={issues} />
      <ImpactDashboard issues={issues} />
      <Footer />
      <ReportFab onClick={() => setOpen(true)} />
      <ReportModal open={open} onOpenChange={setOpen} />
      <Toaster position="top-center" />
    </main>
  );
}
