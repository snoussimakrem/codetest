"use client";
import Link from "next/link";
import { TiltCard } from "./motion-system";
import {
  Bookmark,
  ArrowUpRight,
  MapPin,
  Check,
  GitCompareArrows,
} from "lucide-react";
import { useState, useEffect } from "react";
import { money, type StartupData } from "../../../packages/shared/src";
import { api, post } from "./api";
export function StartupCard({
  startup: s,
  compare,
  onCompare,
}: {
  startup: StartupData;
  compare?: boolean;
  onCompare?: (s: StartupData) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    api<any[]>("/watchlist").then((items) =>
      setSaved(items.some((item) => item.startupId === s.id)),
    );
  }, [s.id]);
  async function save() {
    try {
      if (saved) await api("/watchlist/" + s.id, { method: "DELETE" });
      else await post("/watchlist/" + s.id, {});
      setSaved(!saved);
      setNotice(saved ? "Removed from watchlist" : "Saved to your watchlist");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <TiltCard>
      <article className="startup-card">
        <div
          className="startup-art"
          style={{ "--company-color": s.color } as React.CSSProperties}
        >
          <div className="art-grid" />
          <span className="company-art-symbol">{s.symbol}</span>
          <span className="art-wordmark">
            {s.name.split(" ")[0].toLowerCase()}
            <span>®</span>
          </span>
          <span className="stage-tag">{s.stage}</span>
          <button
            onClick={save}
            className={"save-button " + (saved ? "saved" : "")}
            aria-label={(saved ? "Unsave " : "Save ") + s.name}
          >
            {saved ? <Check size={17} /> : <Bookmark size={17} />}
          </button>
        </div>
        <div className="startup-card-body">
          <div className="card-sector">
            {s.sector}
            <span>
              <MapPin size={11} />
              {s.country}
            </span>
          </div>
          <Link href={"/startups/" + s.slug} className="startup-title">
            {s.name}
            <ArrowUpRight size={18} />
          </Link>
          <p>{s.description}</p>
          <div className="funding-row">
            <span>
              <strong>{money(s.raised)}</strong> raised
            </span>
            <span>of {money(s.target)}</span>
          </div>
          <div className="progress">
            <span
              style={{
                width: Math.min((s.raised / s.target) * 100, 100) + "%",
                background: s.color,
              }}
            />
          </div>
          <div className="card-bottom">
            <span>
              {Math.round((s.raised / s.target) * 100)}% funded <i>·</i>{" "}
              {s.instrument}
            </span>
            {onCompare ? (
              <button
                className={"compare-button " + (compare ? "selected" : "")}
                onClick={() => onCompare(s)}
                aria-label={"Compare " + s.name}
              >
                <GitCompareArrows size={14} /> {compare ? "Added" : "Compare"}
              </button>
            ) : (
              <Link href={"/startups/" + s.slug}>
                View details <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
          {notice && (
            <p role="status" className="card-notice">
              {notice}
              {notice.includes("sign in") && (
                <Link href="/login"> — Log in</Link>
              )}
            </p>
          )}
        </div>
      </article>
    </TiltCard>
  );
}
