"use client";

import { useState, useEffect } from "react";
import { makeT } from "@/lib/strings";
import { fetchBeaches, BeachAPI } from "@/lib/api";
import * as I from "./Icons";

export default function BeachSelector({
  lang,
  onSelect,
  currentSlug,
}: {
  lang: string;
  onSelect: (slug: string) => void;
  currentSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [beaches, setBeaches] = useState<BeachAPI[]>([]);
  const t = makeT(lang);

  useEffect(() => {
    fetchBeaches().then(setBeaches).catch(() => {});
  }, []);

  const current = beaches.find((b) => b.slug === currentSlug) ?? null;

  const filtered = beaches.filter((b) => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
  });

  return (
    <>
      <button className={"wp-beach-btn" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="wp-beach-pin"><I.Pin size={18} /></span>
        <span className="wp-beach-text">
          {current ? (
            <>
              <span className="wp-beach-name">{current.name}</span>
              <span className="wp-beach-region">{current.city}</span>
            </>
          ) : (
            <span className="wp-beach-name">{t("chooseBeach")}</span>
          )}
        </span>
        <span className={"wp-beach-caret" + (open ? " is-open" : "")}><I.Chevron size={16} /></span>
      </button>
      {open && (
        <>
          <div className="wp-scrim" onClick={() => setOpen(false)} />
          <div className="wp-dropdown">
            <div className="wp-dropdown-head">{t("chooseBeach")}</div>
            <div className="wp-search-container">
              <span className="wp-search-icon"><I.Search size={18} /></span>
              <input
                type="text"
                className="wp-search-input"
                placeholder={t("searchBeach")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {beaches.length === 0 && (
              <div className="wp-dropdown-item" style={{ justifyContent: "center", opacity: 0.5 }}>
                <span className="wp-spinner" />
              </div>
            )}
            {filtered.map((b) => (
              <button key={b.slug} className="wp-dropdown-item"
                onClick={() => { onSelect(b.slug); setOpen(false); setSearch(""); }}>
                <span className="wp-dd-pin"><I.Pin size={16} /></span>
                <span className="wp-dd-text">
                  <span className="wp-dd-name">{b.name}</span>
                  <span className="wp-dd-region">{b.city}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
