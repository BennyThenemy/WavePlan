"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BEACHES } from "@/lib/data";
import { makeT } from "@/lib/strings";
import * as I from "./Icons";
import BeachSelector from "./BeachSelector";
import WaveGraph from "./WaveGraph";

export default function GraphPage({ beachIdx, slug }: { beachIdx: number; slug: string }) {
  const [lang, setLang] = useState("en");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("wp-lang");
    if (stored) setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("wp-lang", lang);
  }, [lang]);

  const t = makeT(lang);

  return (
    <div className="wp-shell">
      <div className={"wp-app" + (lang === "he" ? " is-rtl" : "")} dir={lang === "he" ? "rtl" : "ltr"} lang={lang}>
        <header className="wp-header">
          <div className="wp-topline">
            <div className="wp-brand">
              <span className="wp-logo">Wave<span className="wp-logo-accent">Plan</span></span>
              <span className="wp-tagline">{t("tagline")}</span>
            </div>
            <div className="wp-menu-wrap">
              <button className="wp-menu-btn" onClick={() => setLang(lang === "en" ? "he" : "en")} aria-label="Language">
                <I.Globe size={20} />
              </button>
            </div>
          </div>
          <BeachSelector lang={lang} onSelect={(s) => router.push(`/${s}`)} currentSlug={slug} />
        </header>

        <main className="wp-home-main">
          <WaveGraph beachIdx={beachIdx} lang={lang} t={t} />
          <div className="wp-home-foot">
            <p className="wp-cta-hint">{t("ctaHint")}</p>
            <Link href={`/${slug}/details`} style={{ textDecoration: "none" }}>
              <button className="wp-cta">
                {t("viewForecast")}
                <span className="wp-cta-arrow"><I.Chevron size={18} /></span>
              </button>
            </Link>
          </div>
        </main>

        <footer className="wp-footer">Wave Plan · 2026</footer>
      </div>
    </div>
  );
}
