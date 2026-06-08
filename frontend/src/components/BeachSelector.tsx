"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchBeaches, Beach } from "@/lib/api";
import * as I from "./Icons";

export default function BeachSelector() {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBeaches()
      .then(setBeaches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="wp-loading">Loading beaches...</div>;
  if (error) return <div className="wp-error">Error: {error}</div>;

  return (
    <div className="wp-container">
      <div className="wp-root">
        <header className="wp-header">
          <div className="wp-topline">
            <div className="wp-brand">
              <span className="wp-logo">
                Wave<span className="wp-logo-accent">Plan</span>
              </span>
              <span className="wp-tagline">Choose a beach</span>
            </div>
          </div>
        </header>

        <div className="wp-beach-list">
          {beaches.map((beach) => (
            <Link
              key={beach._id}
              href={`/${beach.slug || beach.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="wp-beach-item"
            >
              <I.Pin size={20} />
              <div className="wp-beach-item-info">
                <span className="wp-beach-item-name">{beach.name}</span>
                <span className="wp-beach-item-city">{beach.city}</span>
              </div>
              <I.Chevron size={16} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
