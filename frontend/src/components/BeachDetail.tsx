"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Beach, fetchWeather, fetchSummary, WeatherData, SummaryResponse } from "@/lib/api";
import * as I from "./Icons";
import { makeT } from "@/lib/strings";

const ACTIVITIES = [
  { id: "surfing", key: "tab_surfing", Icon: I.Surf },
  { id: "supping", key: "tab_sup", Icon: I.Sup },
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

function relDay(offset: number, t: ReturnType<typeof makeT>) {
  if (offset === 0) return t("today");
  if (offset === 1) return t("tomorrow");
  if (offset === -1) return t("yesterday");
  return t("wd_" + dateInfo(offset).weekday);
}

export default function BeachDetail({ beach }: { beach: Beach }) {
  const [lang, setLang] = useState("en");
  const [dateOffset, setDateOffset] = useState(0);
  const [activity, setActivity] = useState<string>("surfing");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  const t = makeT(lang);

  const currentDate = new Date(BASE);
  currentDate.setDate(currentDate.getDate() + dateOffset);
  const dateStr = currentDate.toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWeather(beach._id, dateStr).catch(() => null),
      fetchSummary(beach._id, dateStr, activity).catch(() => null),
    ]).then(([w, s]) => {
      setWeather(w);
      setSummary(s);
      setLoading(false);
    });
  }, [beach._id, dateStr, activity]);

  return (
    <div className="wp-container" lang={lang} dir={lang === "he" ? "rtl" : "ltr"}>
      <div className="wp-root">
        {/* Header */}
        <header className="wp-header">
          <div className="wp-topline">
            <Link href="/" className="wp-back-btn" title="Back to beaches">
              <I.Chevron size={20} style={{ transform: "rotate(180deg)" }} />
            </Link>
            <div className="wp-brand">
              <span className="wp-logo">
                Wave<span className="wp-logo-accent">Plan</span>
              </span>
            </div>
            <div style={{ width: 40 }} />
          </div>
          <div className="wp-beach-info">
            <span className="wp-beach-name">{beach.name}</span>
            <span className="wp-beach-city">{beach.city}</span>
          </div>
        </header>

        {/* Date Navigator */}
        <div className="wp-date-nav">
          <button
            onClick={() => setDateOffset((d) => Math.max(d - 1, -6))}
            disabled={dateOffset === -6}
            aria-label="Previous day"
          >
            <I.Chevron size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
          <span className="wp-date-label">
            {relDay(dateOffset, t)} {dateInfo(dateOffset).label}
          </span>
          <button
            onClick={() => setDateOffset((d) => Math.min(d + 1, 6))}
            disabled={dateOffset === 6}
            aria-label="Next day"
          >
            <I.Chevron size={16} />
          </button>
        </div>

        {/* Activity Tabs */}
        <div className="wp-tabs">
          {ACTIVITIES.map((a) => (
            <button
              key={a.id}
              className={
                "wp-tab" +
                (activity === a.id ? " is-active" : "") +
                (a.locked ? " is-locked" : "")
              }
              onClick={() => !a.locked && setActivity(a.id)}
              disabled={a.locked}
            >
              <a.Icon size={18} />
              <span>{t(a.key)}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Loading conditions...
          </div>
        )}

        {!loading && weather && summary && (
          <div className="wp-content">
            {/* Summary Card */}
            {summary.status === "ready" && summary.summary && (
              <div className="wp-summary-card">
                <div className="wp-summary-row">
                  <span className="wp-summary-label">🏄 Best for:</span>
                  <span>{summary.summary.best_for.join(", ")}</span>
                </div>
                {summary.summary.board && (
                  <div className="wp-summary-row">
                    <span className="wp-summary-label">🏋 Board:</span>
                    <span>{summary.summary.board}</span>
                  </div>
                )}
                {summary.summary.warning && (
                  <div className="wp-summary-row">
                    <span className="wp-summary-label">⚠️ Warning:</span>
                    <span>{summary.summary.warning}</span>
                  </div>
                )}
                <div className="wp-summary-row">
                  <span className="wp-summary-label">🕘 Best window:</span>
                  <span>{summary.summary.best_window}</span>
                </div>
                <div className="wp-summary-text">{summary.summary.free_text}</div>
              </div>
            )}

            {summary.status === "pending" && (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Generating summary...
              </div>
            )}

            {summary.status === "error" && (
              <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
                Error: {summary.message}
              </div>
            )}

            {/* Metrics Cards */}
            {weather.hours && weather.hours.length > 0 && (
              <div className="wp-metrics">
                <div className="wp-metric-card">
                  <span className="wp-metric-label">Swell Period</span>
                  <span className="wp-metric-value">{weather.hours[0].swell_period}</span>
                  <span className="wp-metric-unit">sec</span>
                </div>
                <div className="wp-metric-card">
                  <span className="wp-metric-label">Swell Height</span>
                  <span className="wp-metric-value">{weather.hours[0].wave_height}</span>
                  <span className="wp-metric-unit">m</span>
                </div>
                <div className="wp-metric-card">
                  <span className="wp-metric-label">Wind</span>
                  <span className="wp-metric-value">{weather.hours[0].wind_speed}</span>
                  <span className="wp-metric-unit">{weather.hours[0].wind_direction}</span>
                </div>
                <div className="wp-metric-card">
                  <span className="wp-metric-label">Temperature</span>
                  <span className="wp-metric-value">
                    {weather.hours[0].air_temp}° / {weather.hours[0].water_temp}°
                  </span>
                  <span className="wp-metric-unit">air / water</span>
                </div>
              </div>
            )}

            {/* Hourly Table */}
            {weather.hours && weather.hours.length > 0 && (
              <div className="wp-table">
                <h3 style={{ marginBottom: "1rem" }}>waves by hour</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Wave</th>
                      <th>Period</th>
                      <th>Direction</th>
                      <th>Wind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weather.hours
                      .filter((_, i) => i % 3 === 0)
                      .map((hour, i) => (
                        <tr key={i}>
                          <td>{hour.time}</td>
                          <td>{hour.wave_height}m</td>
                          <td>{hour.swell_period}s</td>
                          <td>{hour.swell_direction}</td>
                          <td>{hour.wind_speed} {hour.wind_direction}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && !weather && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            No weather data available for this beach on this date.
          </div>
        )}
      </div>
    </div>
  );
}
