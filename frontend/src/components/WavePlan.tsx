"use client";

import { useState, useEffect } from "react";
import * as I from "./Icons";
import { BEACHES, conditionsFor, HourRow, Metrics, AISummary } from "@/lib/data";
import { makeT } from "@/lib/strings";

type TFn = ReturnType<typeof makeT>;

const ACTIVITIES = [
  { id: "surfing", key: "tab_surfing", Icon: I.Surf },
  { id: "sup", key: "tab_sup", Icon: I.Sup },
  { id: "casual", key: "tab_casual", Icon: I.Sun },
  { id: "more", key: "tab_more", Icon: I.Grid, locked: true },
];

const BASE = new Date(2026, 4, 29);

function dateInfo(offset: number) {
  const d = new Date(BASE);
  d.setDate(d.getDate() + offset);
  return {
    label: d.getDate() + "." + (d.getMonth() + 1) + "." + String(d.getFullYear()).slice(2),
    weekday: d.getDay(),
  };
}

function relDay(offset: number, t: TFn) {
  if (offset === 0) return t("today");
  if (offset === 1) return t("tomorrow");
  if (offset === -1) return t("yesterday");
  return t("wd_" + dateInfo(offset).weekday);
}

function uvKey(uv: number) {
  if (uv <= 2) return "uv_low";
  if (uv <= 5) return "uv_moderate";
  if (uv <= 7) return "uv_high";
  if (uv <= 10) return "uv_veryhigh";
  return "uv_extreme";
}

/* Header */
function Header({ beachIdx, setBeachIdx, lang, setLang, t }: {
  beachIdx: number; setBeachIdx: (i: number) => void;
  lang: string; setLang: (l: string) => void; t: TFn;
}) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const beach = BEACHES[beachIdx];

  return (
    <header className="wp-header">
      <div className="wp-topline">
        <div className="wp-brand">
          <span className="wp-logo">Wave<span className="wp-logo-accent">Plan</span></span>
          <span className="wp-tagline">{t("tagline")}</span>
        </div>
        <div className="wp-menu-wrap">
          <button className={"wp-menu-btn" + (menuOpen ? " is-open" : "")}
            onClick={() => setMenuOpen((o) => !o)} aria-label={t("menuTitle")}>
            <I.Menu size={20} />
          </button>
          {menuOpen && (
            <>
              <div className="wp-scrim" onClick={() => setMenuOpen(false)} />
              <div className="wp-menu">
                <button className="wp-menu-profile">
                  <span className="wp-avatar"><I.User size={22} /></span>
                  <span className="wp-menu-profile-text">
                    <span className="wp-menu-profile-name">{t("profileName")}</span>
                    <span className="wp-menu-profile-sub">{t("profileSub")}</span>
                  </span>
                  <span className="wp-menu-chev"><I.Chevron size={16} /></span>
                </button>
                <div className="wp-menu-sep" />
                <div className="wp-menu-row">
                  <span className="wp-menu-ic"><I.Globe size={19} /></span>
                  <span className="wp-menu-label">{t("menuLanguage")}</span>
                  <span className="wp-seg">
                    <button className={"wp-seg-btn" + (lang === "en" ? " is-active" : "")}
                      onClick={() => setLang("en")}>EN</button>
                    <button className={"wp-seg-btn" + (lang === "he" ? " is-active" : "")}
                      onClick={() => setLang("he")} lang="he">עברית</button>
                  </span>
                </div>
                <button className="wp-menu-row wp-menu-row-btn" onClick={() => setDark((d) => !d)}>
                  <span className="wp-menu-ic"><I.Moon size={19} /></span>
                  <span className="wp-menu-label">{t("menuDarkMode")}</span>
                  <span className={"wp-switch" + (dark ? " is-on" : "")} aria-hidden="true">
                    <span className="wp-switch-knob" />
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <button className={"wp-beach-btn" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="wp-beach-pin"><I.Pin size={18} /></span>
        <span className="wp-beach-text">
          <span className="wp-beach-name">{beach.name[lang as "en" | "he"]}</span>
          <span className="wp-beach-region">{beach.region[lang as "en" | "he"]}</span>
        </span>
        <span className={"wp-beach-caret" + (open ? " is-open" : "")}><I.Chevron size={16} /></span>
      </button>
      {open && (
        <>
          <div className="wp-scrim" onClick={() => setOpen(false)} />
          <div className="wp-dropdown">
            <div className="wp-dropdown-head">{t("chooseBeach")}</div>
            {BEACHES.map((b, i) => (
              <button key={b.id} className={"wp-dropdown-item" + (i === beachIdx ? " is-active" : "")}
                onClick={() => { setBeachIdx(i); setOpen(false); }}>
                <span className="wp-dd-pin"><I.Pin size={16} /></span>
                <span className="wp-dd-text">
                  <span className="wp-dd-name">{b.name[lang as "en" | "he"]}</span>
                  <span className="wp-dd-region">{b.region[lang as "en" | "he"]}</span>
                </span>
                {i === beachIdx && <span className="wp-dd-check" />}
              </button>
            ))}
          </div>
        </>
      )}
    </header>
  );
}

/* Date navigator */
function DateNav({ dayOffset, setDayOffset, t }: { dayOffset: number; setDayOffset: (fn: (d: number) => number) => void; t: TFn }) {
  const { label } = dateInfo(dayOffset);
  return (
    <div className="wp-datenav">
      <button className="wp-date-arrow wp-date-prev" onClick={() => setDayOffset((d) => Math.max(-1, d - 1))}
        disabled={dayOffset <= -1} aria-label="Previous day">
        <I.Chevron size={22} />
      </button>
      <div className="wp-date-center">
        <span className="wp-date-rel">{relDay(dayOffset, t)}</span>
        <span className="wp-date-num">{label}</span>
      </div>
      <button className="wp-date-arrow wp-date-next" onClick={() => setDayOffset((d) => Math.min(6, d + 1))}
        disabled={dayOffset >= 6} aria-label="Next day">
        <I.Chevron size={22} />
      </button>
    </div>
  );
}

/* Activity tabs */
function Tabs({ activity, setActivity, t }: { activity: string; setActivity: (a: string) => void; t: TFn }) {
  return (
    <div className="wp-tabs">
      {ACTIVITIES.map((a) => {
        const active = a.id === activity;
        return (
          <button key={a.id}
            className={"wp-tab" + (active ? " is-active" : "") + (a.locked ? " is-locked" : "")}
            onClick={() => !a.locked && setActivity(a.id)} disabled={a.locked}>
            <a.Icon size={20} />
            <span className="wp-tab-label">{t(a.key)}</span>
            {a.locked && <span className="wp-tab-lock"><I.Lock size={12} /></span>}
          </button>
        );
      })}
    </div>
  );
}

/* AI Summary card */
function SummaryCard({ ai, activity, t }: { ai: AISummary; activity: string; t: TFn }) {
  const join = ai.bestFor.map((c) => t("lvl_" + c)).join(", ");
  const rows: { Icon: React.ComponentType<{ size?: number }>; label: string; value: string; warn?: boolean }[] = [
    { Icon: I.Star, label: t("bestFor"), value: join },
  ];
  if (activity === "surfing" && ai.board) {
    rows.push({ Icon: I.Board, label: t("board"), value: ai.board.map((c) => t("brd_" + c)).join(", ") });
  }
  rows.push({ Icon: I.Clock, label: t("bestWindow"), value: ai.window });
  if (ai.warning) {
    rows.push({ Icon: I.Alert, label: t("warning"), value: t("warn_" + ai.warning.key, { t: ai.warning.time }), warn: true });
  }

  const text = t("txt_" + ai.text.key) + (ai.text.period ? t("txt_period") : "");

  return (
    <section className="wp-card wp-summary">
      <div className="wp-summary-head">
        <span className="wp-summary-spark"><I.Sparkle size={16} /></span>
        <span>{t("summaryHead")}</span>
      </div>
      <dl className="wp-summary-rows">
        {rows.map((r, i) => (
          <div key={i} className={"wp-summary-row" + (r.warn ? " is-warn" : "")}>
            <dt><span className="wp-summary-ic"><r.Icon size={18} /></span>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="wp-summary-text">{text}</p>
    </section>
  );
}

/* Metric card */
function MetricCard({ Icon, label, value, unit, sub, locked, t }: {
  Icon: React.ComponentType<{ size?: number }>; label: string; value: string | number;
  unit?: string; sub?: string; locked?: boolean; t: TFn;
}) {
  return (
    <div className={"wp-metric" + (locked ? " is-locked" : "")}>
      <div className="wp-metric-top">
        <span className="wp-metric-ic"><Icon size={18} /></span>
        <span className="wp-metric-label">{label}</span>
      </div>
      <div className="wp-metric-value">{value}{unit && <span className="wp-metric-unit">{unit}</span>}</div>
      {sub && <div className="wp-metric-sub">{sub}</div>}
      {locked && <span className="wp-metric-lockbadge"><I.Lock size={11} /> {t("comingSoon")}</span>}
    </div>
  );
}

function MetricsRow({ m, t }: { m: Metrics; t: TFn }) {
  const cards = [
    { Icon: I.Period, label: t("m_swellPeriod"), value: m.swellPeriod, unit: "s", sub: t("sub_seconds") },
    { Icon: I.Wave, label: t("m_swellHeight"), value: m.swellHeight.toFixed(1), unit: "m", sub: t("sub_daytime") },
    { Icon: I.Wind, label: t("m_wind"), value: m.windSpeed, unit: " km/h", sub: t("sub_fromThe", { d: m.windDir }) },
    { Icon: I.Temp, label: t("m_airWater"), value: m.airTemp + "°", sub: t("sub_water", { v: String(m.waterTemp) }) },
    { Icon: I.Uv, label: t("m_uv"), value: m.uv, sub: t(uvKey(m.uv)) },
    { Icon: I.Compass, label: t("m_swellDir"), value: m.swellDir, sub: t("sub_primaryDir") },
    { Icon: I.Tide, label: t("m_tide"), value: "—", locked: true },
  ];
  return (
    <div className="wp-metrics-wrap">
      <div className="wp-metrics">
        {cards.map((c, i) => <MetricCard key={i} {...c} t={t} />)}
      </div>
    </div>
  );
}

/* Hourly table */
function HourlyTable({ hrs, t }: { hrs: HourRow[]; t: TFn }) {
  return (
    <section className="wp-hourly">
      <h2 className="wp-section-title">{t("hourlyTitle")}</h2>
      <div className="wp-table-card wp-card">
        <table className="wp-table">
          <thead>
            <tr>
              <th>{t("th_time")}</th>
              <th>{t("th_wave")}</th>
              <th>{t("th_period")}</th>
              <th>{t("th_swell")}</th>
              <th>{t("th_wind")}</th>
              <th>{t("th_dir")}</th>
            </tr>
          </thead>
          <tbody>
            {hrs.map((r, i) => (
              <tr key={r.time} className={i % 2 ? "is-alt" : ""}>
                <td className="wp-td-time">{r.time}</td>
                <td><b>{r.wave.toFixed(1)}</b><span className="wp-u">m</span></td>
                <td>{r.period}<span className="wp-u">s</span></td>
                <td>{r.swellDir}</td>
                <td>{r.wind}<span className="wp-u">km/h</span></td>
                <td>{r.windDir}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* App root */
export default function WavePlan() {
  const [beachIdx, setBeachIdx] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [activity, setActivity] = useState("surfing");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("wp-lang");
    if (stored) setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("wp-lang", lang);
  }, [lang]);

  const t = makeT(lang);
  const { hrs, m, ai } = conditionsFor(beachIdx, dayOffset, activity);
  const di = dateInfo(dayOffset);

  const appStyle = {
    "--radius": "18px",
    "--pad": "20px",
    "--gap": "18px",
  } as React.CSSProperties;

  return (
    <div className="wp-shell">
      <div className={"wp-app" + (lang === "he" ? " is-rtl" : "")} style={appStyle}
        dir={lang === "he" ? "rtl" : "ltr"} lang={lang}>
        <Header beachIdx={beachIdx} setBeachIdx={setBeachIdx} lang={lang} setLang={setLang} t={t} />
        <DateNav dayOffset={dayOffset} setDayOffset={setDayOffset} t={t} />
        <Tabs activity={activity} setActivity={setActivity} t={t} />
        <main className="wp-main">
          <SummaryCard ai={ai} activity={activity} t={t} />
          <MetricsRow m={m} t={t} />
          <HourlyTable hrs={hrs} t={t} />
        </main>
        <footer className="wp-footer">
          {t("footer", { wd: t("wd_" + di.weekday), date: di.label })}
        </footer>
      </div>
    </div>
  );
}
