import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { ArrowBigUp, Share2 } from "lucide-react";
import { toast } from "sonner";
import { categoryColor, type Issue } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { categoryLabelI18n, statusLabel } from "@/i18n/translations";

function pinIcon(color: string, pulsing: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
    html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${color};border:2px solid rgba(242,240,235,.85);box-shadow:0 0 14px ${color},0 0 30px ${color}55" class="${
      pulsing ? "animate-pin-pulse" : ""
    }"></span>`,
  });
}

function clusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 50 ? 46 : 56;
  return L.divIcon({
    html: `<div class="cp-cluster" style="width:${size}px;height:${size}px;font-size:${
      size / 3.2
    }px">${count}</div>`,
    className: "",
    iconSize: L.point(size, size),
  });
}

function Resizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function FocusIssue({
  focusIssueId,
  issues,
}: {
  focusIssueId?: string | null | undefined;
  issues: Issue[];
}) {
  const map = useMap();
  const done = useRef<string | null>(null);

  useEffect(() => {
    if (!focusIssueId || done.current === focusIssueId) return;
    const issue = issues.find((i) => i.id === focusIssueId);
    if (!issue) return;
    done.current = focusIssueId;
    map.setView([+issue.latitude, +issue.longitude], 15, { animate: true });
  }, [focusIssueId, issues, map]);

  return null;
}

export default function IssueMap({
  issues,
  newIds,
  onUpvote,
  focusIssueId,
}: {
  issues: Issue[];
  newIds: Set<string>;
  onUpvote: (issue: Issue) => void;
  focusIssueId?: string | null | undefined;
}) {
  const { t, lang } = useLanguage();
  const upvoted = useRef<Set<string>>(new Set());
  const points = useMemo(
    () => issues.filter((i) => Number.isFinite(+i.latitude) && Number.isFinite(+i.longitude)),
    [issues],
  );

  return (
    <MapContainer
      center={[22.5, 79]}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <Resizer />
      <FocusIssue focusIssueId={focusIssueId} issues={points} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup iconCreateFunction={clusterIcon} chunkedLoading showCoverageOnHover={false}>
        {points.map((issue) => {
          const statusColor =
            issue.status === "resolved"
              ? "#6F9E7F"
              : issue.status === "in_progress"
                ? "#E8A855"
                : issue.status === "verified"
                  ? "#1B6B5C"
                  : "#8B8880";
          const isFocused = focusIssueId === issue.id;
          return (
            <Marker
              key={issue.id}
              position={[+issue.latitude, +issue.longitude]}
              icon={pinIcon(categoryColor(issue.category), newIds.has(issue.id) || isFocused)}
              eventHandlers={{
                add: (e) => {
                  if (isFocused) {
                    setTimeout(() => e.target.openPopup(), 400);
                  }
                },
              }}
            >
              <Popup>
                <div className="w-[15rem]">
                  {issue.photo_url ? (
                    <img
                      src={issue.photo_url}
                      alt=""
                      className="mb-2 h-24 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <div
                    className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                    style={{ color: categoryColor(issue.category) }}
                  >
                    {categoryLabelI18n(issue.category, lang)}
                  </div>
                  <div className="mt-1 text-sm leading-snug font-semibold text-[#F2F0EB]">
                    {issue.title || "Reported issue"}
                  </div>
                  {issue.description ? (
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#F2F0EB]/60">
                      {issue.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {issue.severity ? (
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-[#F2F0EB]/75 capitalize">
                        {issue.severity}
                      </span>
                    ) : null}
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        color: statusColor,
                        background: `${statusColor}22`,
                        border: `1px solid ${statusColor}55`,
                      }}
                    >
                      {statusLabel(issue.status, lang)}
                    </span>
                    {issue.city ? (
                      <span className="text-[10px] text-[#F2F0EB]/45">{issue.city}</span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        if (upvoted.current.has(issue.id)) return;
                        upvoted.current.add(issue.id);
                        const el = e.currentTarget;
                        el.animate(
                          [
                            { transform: "scale(1)" },
                            { transform: "scale(1.18)" },
                            { transform: "scale(1)" },
                          ],
                          { duration: 320, easing: "cubic-bezier(.34,1.56,.64,1)" },
                        );
                        onUpvote(issue);
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E8A855]/35 bg-[#E8A855]/12 px-3 py-2 text-xs font-semibold text-[#E8A855] transition-colors hover:bg-[#E8A855]/22"
                    >
                      <ArrowBigUp className="h-4 w-4" />
                      {issue.upvote_count ?? 0}
                    </button>
                    <button
                      onClick={async () => {
                        const text = `${issue.title || "Civic issue"} reported in ${
                          issue.city || "India"
                        } via CivicPulse. Status: ${statusLabel(issue.status, lang)}.`;
                        const url = `${window.location.origin}${window.location.pathname}?issue=${issue.id}`;
                        try {
                          if (navigator.share) {
                            await navigator.share({ title: "CivicPulse report", text, url });
                          } else {
                            await navigator.clipboard.writeText(`${text} ${url}`);
                            toast.success(t.shareCopied);
                          }
                        } catch {
                          /* user cancelled share */
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-[#F2F0EB]/80 transition-colors hover:bg-white/10"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
