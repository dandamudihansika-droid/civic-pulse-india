import { Camera, MapPin, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "./Reveal";

const STEPS = [
  { icon: Camera, titleKey: "step1Title" as const, descKey: "step1Desc" as const },
  { icon: MapPin, titleKey: "step2Title" as const, descKey: "step2Desc" as const },
  { icon: ShieldCheck, titleKey: "step3Title" as const, descKey: "step3Desc" as const },
];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how" className="relative px-4 py-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-3xl font-semibold sm:text-4xl">{t.howItWorks}</h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, titleKey, descKey }, idx) => (
            <Reveal key={titleKey} delay={idx * 80}>
              <div className="glass group h-full rounded-3xl p-7 transition-transform duration-300 hover:scale-[1.02]">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl"
                  style={{
                    background: "rgba(232,168,85,0.12)",
                    boxShadow: "0 0 24px rgba(232,168,85,0.15)",
                  }}
                >
                  <Icon className="h-5 w-5 text-[#E8A855]" />
                </div>
                <div
                  className="mt-5 text-[11px] font-bold tracking-[0.2em] text-[#E8A855] uppercase"
                >
                  0{idx + 1}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{t[titleKey]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/55">{t[descKey]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
