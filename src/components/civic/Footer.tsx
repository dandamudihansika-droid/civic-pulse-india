import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-white/8 px-6 py-14 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold text-[#1a1408]"
              style={{ background: "linear-gradient(135deg,#F4C542,#E8A855)" }}
            >
              CP
            </span>
            <span className="text-lg font-semibold tracking-tight">CivicPulse</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/50">
            {t.footerTagline}
          </p>
        </div>
        <p className="text-xs text-foreground/40">
          {t.footerBuilt} 🇮🇳 · © {new Date().getFullYear()} CivicPulse
        </p>
      </div>
    </footer>
  );
}
