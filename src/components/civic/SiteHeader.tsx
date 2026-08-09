import { Link } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function SiteHeader({ onReport }: { onReport: () => void }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 right-0 left-0 z-[800] border-b border-white/6 bg-[#0D0D0F]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-[#1a1408]"
            style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
          >
            CP
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">CivicPulse</span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium text-foreground/60 sm:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            {t.howItWorks}
          </a>
          <a href="#map" className="transition-colors hover:text-foreground">
            {t.map}
          </a>
          <a href="#impact" className="transition-colors hover:text-foreground">
            {t.impact}
          </a>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            {t.admin}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="glass flex items-center gap-1 rounded-xl p-1">
            <Languages className="ml-1.5 h-3.5 w-3.5 text-foreground/45" />
            {(["en", "hi"] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  background: lang === code ? "rgba(232,168,85,0.2)" : "transparent",
                  color: lang === code ? "#E8A855" : "rgba(242,240,235,0.5)",
                }}
              >
                {code === "en" ? "EN" : "हि"}
              </button>
            ))}
          </div>
          <button
            onClick={onReport}
            className="glow-amber hidden rounded-xl px-4 py-2 text-xs font-semibold text-[#1a1408] transition-transform hover:scale-[1.03] sm:inline-flex"
            style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
          >
            {t.reportIssue}
          </button>
        </div>
      </div>
    </header>
  );
}
