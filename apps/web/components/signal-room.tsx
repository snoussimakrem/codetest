"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, animate, motion, useInView } from "motion/react";
import {
  ArrowUpRight,
  Cpu,
  Leaf,
  Landmark,
  Radio,
  ArrowRight,
  MoveUpRight,
} from "lucide-react";
import { demoStartups } from "../../../packages/shared/src/demo";
import { money } from "../../../packages/shared/src";
import { Reveal, useMotionPreference } from "./motion-system";
const sectors = [
  {
    label: "Intelligence",
    sector: "AI & Machine Learning",
    icon: Cpu,
    index: 0,
    color: "#f58b64",
    subtitle: "Less noise. More understanding.",
    description:
      "Meet a fictional team making complex data feel a little more human.",
  },
  {
    label: "Climate",
    sector: "Climate Tech",
    icon: Leaf,
    index: 1,
    color: "#b6d6b1",
    subtitle: "Progress with a lighter footprint.",
    description:
      "Explore a fictional vision for resilient energy and a cleaner tomorrow.",
  },
  {
    label: "Finance",
    sector: "Fintech",
    icon: Landmark,
    index: 2,
    color: "#e5c58d",
    subtitle: "A world with fewer boundaries.",
    description:
      "Discover a fictional startup rethinking the way financial systems connect.",
  },
];
function Count({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const { paused } = useMotionPreference();
  useEffect(() => {
    if (!visible || !ref.current) return;
    if (paused) {
      ref.current.textContent = String(value);
      return;
    }
    const control = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (n) => {
        if (ref.current) ref.current.textContent = String(Math.round(n));
      },
    });
    return () => control.stop();
  }, [visible, value, paused]);
  return (
    <>
      <span ref={ref}>{value}</span>
      {suffix}
    </>
  );
}
export function OpportunityTicker() {
  const { paused } = useMotionPreference();
  return (
    <section
      className="opportunity-ticker"
      aria-label="Fictional opportunity highlights"
    >
      <div className="ticker-label">
        <Radio size={14} />
        <span>
          ON OUR RADAR<small>FICTIONAL ECOSYSTEM</small>
        </span>
      </div>
      <div className="ticker-window">
        <div
          className="ticker-track"
          style={{ animationPlayState: paused ? "paused" : undefined }}
        >
          {[0, 1].map((copy) => (
            <div
              className="ticker-group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {demoStartups.slice(0, 6).map((s) => (
                <Link
                  key={s.id}
                  href={"/startups/" + s.slug}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  <span className="ticker-symbol" style={{ color: s.color }}>
                    {s.symbol}
                  </span>
                  <span>{s.name}</span>
                  <small>{s.stage}</small>
                  <ArrowUpRight size={12} />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default function SignalRoom() {
  const [active, setActive] = useState(0);
  const { paused } = useMotionPreference();
  const current = sectors[active],
    startup = demoStartups[current.index];
  return (
    <section
      className="signal-section container"
      aria-labelledby="signal-title"
    >
      <Reveal>
        <div className="signal-heading">
          <div>
            <div className="eyebrow">
              <span className="section-index">02 /</span> THE SIGNAL ROOM
            </div>
            <h2 id="signal-title">
              Follow a spark.
              <br />
              <span>Find your direction.</span>
            </h2>
          </div>
          <p>
            Some ideas stay with you.
            <br />
            Explore the frontiers that move you.
          </p>
        </div>
      </Reveal>
      <Reveal>
        <div
          className="signal-panel"
          style={{ "--signal-color": current.color } as React.CSSProperties}
        >
          <div className="signal-canvas">
            <div className="signal-controls">
              <span className="signal-coordinate">VX / EXPLORE MODE</span>
              <div
                className="signal-tabs"
                role="group"
                aria-label="Explore a startup sector"
              >
                {sectors.map((s, i) => (
                  <button
                    key={s.label}
                    aria-pressed={active === i}
                    onClick={() => setActive(i)}
                  >
                    <s.icon size={16} />
                    {s.label}
                    <span>0{i + 1}</span>
                  </button>
                ))}
              </div>
              <div className="signal-control-note">
                <span className="live-dot" />
                YOUR CURIOSITY, CONNECTED
              </div>
            </div>
            <div className="radar-stage">
              <div className="radar-sweep" />
              <div className="radar-scan-line" />
              <div className="radar-ring radar-ring-1" />
              <div className="radar-ring radar-ring-2" />
              <div className="radar-ring radar-ring-3" />
              <span className="radar-axis horizontal" />
              <span className="radar-axis vertical" />
              <span className="radar-lock-status">
                <i /> SIGNAL LOCKED · 0{active + 1}
              </span>
              <div className="radar-center">
                <span>
                  V<span>╱</span>
                </span>
                <small>VENTUREX</small>
              </div>
              {sectors.map((s, i) => (
                <button
                  key={s.label}
                  className={
                    "radar-node radar-node-" +
                    i +
                    (active === i ? " selected" : "")
                  }
                  aria-label={"Explore " + s.label}
                  onClick={() => setActive(i)}
                >
                  <span className="node-core">
                    <s.icon size={20} />
                  </span>
                  <span className="node-label">
                    {demoStartups[s.index].name}
                    <small>{s.sector}</small>
                  </span>
                </button>
              ))}
              <svg
                className="radar-caption-arc"
                viewBox="0 0 500 220"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="radar-caption-path"
                    d="M 84 142 Q 250 238 416 142"
                  />
                </defs>
                <text>
                  <textPath href="#radar-caption-path" startOffset="50%">
                    AN ILLUSTRATIVE NETWORK OF POSSIBILITY
                  </textPath>
                </text>
              </svg>
              <span className="radar-corner">↗</span>
            </div>
          </div>
          <div className="signal-detail">
            <span className="signal-coordinate">
              CONNECTION / 0{active + 1}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="signal-dossier-body"
                key={active}
                initial={{ opacity: paused ? 1 : 0, y: paused ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: paused ? 1 : 0, y: paused ? 0 : -8 }}
                transition={{ duration: paused ? 0 : 0.2 }}
              >
                <span className="signal-company-icon">{startup.symbol}</span>
                <span className="signal-kicker">{current.sector}</span>
                <h3>{startup.name}</h3>
                <h4>{current.subtitle}</h4>
                <p>{current.description}</p>
                <div className="signal-funding">
                  <div>
                    <small>ILLUSTRATIVE TARGET</small>
                    <strong>{money(startup.target)}</strong>
                  </div>
                  <span>
                    {startup.stage}
                    <MoveUpRight size={14} />
                  </span>
                </div>
                <Link
                  href={"/startups/" + startup.slug}
                  className="signal-detail-link"
                >
                  Meet the idea
                  <ArrowUpRight size={18} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <div className="ecosystem-numbers">
          <div>
            <span className="number-label">
              A SMALL PREVIEW.
              <br />A WIDER HORIZON.
            </span>
            <Link href="/marketplace">
              Explore the collection
              <ArrowRight size={15} />
            </Link>
          </div>
          <div>
            <strong>
              <Count value={12} />
              <span>↗</span>
            </strong>
            <span>Fictional startups</span>
          </div>
          <div>
            <strong>
              <Count value={new Set(demoStartups.map((s) => s.country)).size} />
              <span>↗</span>
            </strong>
            <span>Countries represented</span>
          </div>
          <div>
            <strong>
              <Count value={new Set(demoStartups.map((s) => s.sector)).size} />
              <span>↗</span>
            </strong>
            <span>Industries to explore</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
