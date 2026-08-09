import { MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCountUp } from "./useCountUp";

export function Hero({ total, onReport }: { total: number; onReport: () => void }) {
  const count = useCountUp(total);
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-20 sm:px-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float-slow absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full opacity-50 blur-[130px]"
          style={{ background: "radial-gradient(circle, #E8A855 0%, transparent 65%)" }}
        />
        <div
          className="animate-float-slow absolute -right-32 bottom-[-14rem] h-[42rem] w-[42rem] rounded-full opacity-45 blur-[140px]"
          style={{
            background: "radial-gradient(circle, #1B6B5C 0%, transparent 65%)",
            animationDelay: "-7s",
          }}
        />
        <div
          className="animate-float-slow absolute top-1/3 left-1/2 h-[26rem] w-[26rem] rounded-full opacity-25 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #F4C542 0%, transparent 70%)",
            animationDelay: "-12s",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(13,13,15,0.75))]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-[0.18em] text-foreground/70 uppercase">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "#E8A855", boxShadow: "0 0 12px #E8A855" }}
          />
          {t.liveBadge}
        </div>

        <h1 className="mt-8 max-w-4xl text-4xl leading-[1.03] font-semibold text-balance sm:text-6xl lg:text-7xl">
          {t.heroTitle1}{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(100deg,#E8A855,#F4C542 55%,#1B6B5C)" }}
          >
            {t.heroTitle2}
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-foreground/65 sm:text-lg">
          {t.heroSubtitle}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            onClick={onReport}
            className="glow-amber group inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold text-[#1a1408] transition-transform duration-300 hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
          >
            {t.reportIssue}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <a
            href="#map"
            className="glass inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold text-foreground/85 transition-all duration-300 hover:scale-[1.03] hover:text-foreground"
          >
            <MapPin className="h-4 w-4" />
            {t.exploreMap}
          </a>
        </div>

        <div className="glass mt-14 inline-flex flex-wrap items-center gap-x-8 gap-y-3 rounded-3xl px-7 py-5">
          <div>
            <div
              className="text-3xl font-semibold tabular-nums sm:text-4xl"
              style={{ color: "#E8A855" }}
            >
              {count.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-[11px] tracking-[0.16em] text-foreground/50 uppercase">
              {t.issuesReported}
            </div>
          </div>
          <div className="hidden h-10 w-px bg-white/10 sm:block" />
          <div className="text-sm leading-relaxed text-foreground/55">{t.syncedRealtime}</div>
        </div>
      </div>
    </section>
  );
}
