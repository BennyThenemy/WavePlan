"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { makeT } from "@/lib/strings";
import * as I from "./Icons";
import BeachSelector from "./BeachSelector";

export default function HomePage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [lang, setLang] = useState("en");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("wp-lang");
    if (stored) setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("wp-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (selectedSlug) {
      router.push(`/${selectedSlug}`);
    }
  }, [selectedSlug, router]);

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
          <BeachSelector lang={lang} onSelect={setSelectedSlug} currentSlug={selectedSlug ?? undefined} />
        </header>

        <main className="wp-home-main is-welcome">
          <div className="wp-hero">
            <span className="wp-hero-mark"><I.Wave size={40} /></span>
            <h1 className="wp-hero-title">{t("welcome")}</h1>
            <p className="wp-hero-sub">{t("welcomeSub")}</p>
          </div>
        </main>

        <footer className="wp-footer">Wave Plan · 2026</footer>
      </div>
    </div>
  );
}
