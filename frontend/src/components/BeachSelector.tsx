"use client";

import { useState } from "react";
import { BEACHES } from "@/lib/data";
import { makeT } from "@/lib/strings";
import * as I from "./Icons";

export default function BeachSelector({
  lang,
  onSelect,
  currentIdx
}: {
  lang: string;
  onSelect: (idx: number) => void;
  currentIdx?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const t = makeT(lang);
  const beach = currentIdx !== undefined ? BEACHES[currentIdx] : null;

  const filtered = BEACHES.filter((b) => {
    const query = search.toLowerCase();
    const name = b.name[lang as "en" | "he"].toLowerCase();
    const region = b.region[lang as "en" | "he"].toLowerCase();
    return name.includes(query) || region.includes(query);
  });

  return (
    <>
      <button className={"wp-beach-btn" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="wp-beach-pin"><I.Pin size={18} /></span>
        <span className="wp-beach-text">
          {beach ? (
            <>
              <span className="wp-beach-name">{beach.name[lang as "en" | "he"]}</span>
              <span className="wp-beach-region">{beach.region[lang as "en" | "he"]}</span>
            </>
          ) : (
            <>
              <span className="wp-beach-name">{t("chooseBeach")}</span>
            </>
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
            {filtered.map((b) => {
              const idx = BEACHES.indexOf(b);
              return (
                <button key={b.id} className="wp-dropdown-item"
                  onClick={() => { onSelect(idx); setOpen(false); setSearch(""); }}>
                  <span className="wp-dd-pin"><I.Pin size={16} /></span>
                  <span className="wp-dd-text">
                    <span className="wp-dd-name">{b.name[lang as "en" | "he"]}</span>
                    <span className="wp-dd-region">{b.region[lang as "en" | "he"]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
