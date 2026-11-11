"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Globe2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Zap,
  Cpu,
  Leaf,
  HeartPulse,
  Landmark,
  Orbit,
  Network,
  Search,
} from "lucide-react";
import { Nav, Footer } from "./nav";
import { StartupCard } from "./startup-card";
import SignalRoom, { OpportunityTicker } from "./signal-room";
import { Reveal } from "./motion-system";
import { demoStartups } from "../../../packages/shared/src/demo";
import { HeroPerformanceLine } from "./workspace-identity";
const Globe = dynamic(() => import("./globe"), {
  ssr: false,
  loading: () => (
    <div className="globe-fallback">
      <span>◎</span>
    </div>
  ),
});
const rise = {
  initial: { opacity: 1, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
};
export default function Landing() {
  return (
    <>
      <Nav />
      <main className="landing-page">
        <section className="hero container">
          <div className="hero-edition">
            <span>VENTUREX / THE NEXT CHAPTER</span>
            <span>IDEAS WITHOUT LIMITS. CONNECTIONS WITH INTENTION.</span>
            <span>EST. TOMORROW ↗</span>
          </div>
          <div className="hero-atmosphere" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <HeroPerformanceLine />
          <div className="hero-copy">
            <motion.div {...rise} className="eyebrow">
              <span className="live-dot" /> INDEPENDENT MINDS. EXTRAORDINARY
              POSSIBILITIES. <ArrowUpRight size={13} />
            </motion.div>
            <motion.h1 {...rise} aria-label="Where Vision Meets Capital.">
              Where Vision
              <br />
              Meets{" "}
              <span>
                Capital<span className="hero-period">.</span>
              </span>
            </motion.h1>
            <motion.p {...rise} className="hero-description">
              Discover extraordinary startups, connect with visionary founders,
              and invest in the ideas shaping tomorrow.
            </motion.p>
            <motion.div {...rise} className="hero-buttons">
              <Link href="/marketplace" className="button primary">
                Explore investment opportunities <ArrowUpRight size={17} />
              </Link>
              <Link href="/register?role=FOUNDER" className="button outline">
                Raise capital <ArrowRight size={16} />
              </Link>
            </motion.div>
            <div className="hero-scroll-note">
              <span className="scroll-line" />
              <span>SCROLL TO DISCOVER</span>
              <span>01 — 06</span>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>JL</span>
                <span>AM</span>
                <span>SK</span>
                <span>DT</span>
              </div>
              <div>
                <div className="stars">✦ ✦ ✦ ✦ ✦</div>
                <span>A world of ambition. One connected ecosystem.</span>
              </div>
            </div>
            <div className="demo-caption">
              <span /> Explore a fictional demonstration ecosystem
            </div>
          </div>
          <div className="hero-visual">
            <div className="globe-readout">
              <span className="live-dot" /> IRIDESCENT DATA SPHERE
              <span>DRAG TO ROTATE ↗</span>
            </div>
            <Globe />
            <span className="globe-orbit-label orbit-discovery">
              DISCOVERY <strong>230 VX/S</strong>
            </span>
            <span className="globe-orbit-label orbit-matching">
              MATCHING <strong>315 VX/S</strong>
            </span>
            <span className="globe-orbit-label orbit-conviction">
              CONVICTION <strong>400 VX/S</strong>
            </span>
            <i className="globe-hud-tick tick-a" />
            <i className="globe-hud-tick tick-b" />
            <i className="globe-hud-tick tick-c" />
            <div className="floating-card float-top">
              <span className="mini-logo">✳</span>
              <div>
                <strong>Lumina AI</strong>
                <small>Seed round · San Francisco</small>
              </div>
              <span className="float-growth">
                <TrendingUp size={13} /> 75%<small>demo funded</small>
              </span>
            </div>
            <div className="hub-label">
              <span className="live-dot" /> LONDON{" "}
              <span>51.50° N, 0.12° W</span>
            </div>
            <div className="floating-card float-bottom">
              <span className="round-icon">
                <TrendingUp size={19} />
              </span>
              <div>
                <small>CAPITAL VELOCITY · LIVE</small>
                <strong>Network momentum 14.2×</strong>
              </div>
              <span className="mini-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="globe-coordinate">
              GLOBAL OPPORTUNITY NETWORK <span>↗ LIVE DEMO</span>
            </div>
          </div>
        </section>
        <OpportunityTicker />
        <section className="ecosystem-strip">
          <div className="container ecosystem-inner">
            <div>
              <strong>
                Built for the
                <br />
                next generation.
              </strong>
              <span>Inspired by global innovation hubs</span>
            </div>
            {["SAN FRANCISCO", "LONDON", "BERLIN", "SINGAPORE", "TOKYO"].map(
              (s, i) => (
                <span className="city-word" key={s}>
                  {
                    [
                      <Orbit key="o" />,
                      <Landmark key="l" />,
                      <Network key="n" />,
                      <Globe2 key="g" />,
                      <Zap key="z" />,
                    ][i]
                  }
                  {s}
                </span>
              ),
            )}
          </div>
        </section>
        <section className="section container">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">
                <span className="section-line" /> DISCOVER WHAT’S NEXT
              </div>
              <h2>
                Big ideas. <span>Extraordinary potential.</span>
              </h2>
              <p>
                Meet ambitious founders building solutions for a world that
                won’t stand still.
              </p>
            </div>
            <Link className="text-link" href="/marketplace">
              Explore the marketplace <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="section-toolbar">
            <div>
              <span className="pill active">Featured opportunities</span>
              <Link className="pill" href="/marketplace?sort=raised">
                Trending now <TrendingUp size={13} />
              </Link>
              <Link className="pill" href="/marketplace?stage=Pre-seed">
                Early stage
              </Link>
            </div>
            <span className="subtle-label">
              <span className="live-dot" /> FICTIONAL STARTUPS · DEMO DATA
            </span>
          </div>
          <div className="startup-grid">
            {demoStartups.slice(0, 3).map((s) => (
              <Reveal key={s.id} delay={demoStartups.indexOf(s) * 0.08}>
                <StartupCard startup={s} />
              </Reveal>
            ))}
          </div>
        </section>
        <SignalRoom />
        <section className="section container thesis-section">
          <div className="thesis-intro">
            <div className="eyebrow muted">THE FUTURE DOESN’T FUND ITSELF</div>
            <h2>
              Be part of
              <br />
              what comes <span>next.</span>
            </h2>
            <p>
              From your first discovery to your next meaningful connection, a
              more thoughtful way to navigate private markets.
            </p>
            <Link href="/how-it-works" className="text-link">
              A closer look at VENTUREX <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="steps">
            {[
              {
                n: "01",
                icon: Search,
                title: "Discover your conviction",
                text: "Explore startup profiles, understand the vision, and find the sectors that matter to you.",
              },
              {
                n: "02",
                icon: Network,
                title: "Make a meaningful connection",
                text: "Find alignment through explainable matching and start a conversation with the people behind the idea.",
              },
              {
                n: "03",
                icon: ShieldCheck,
                title: "Move forward, thoughtfully",
                text: "Explore diligence checklists, a document library, and an opportunity pipeline preview.",
              },
            ].map((s) => (
              <div className="step" key={s.n}>
                <span className="step-number">{s.n}</span>
                <s.icon size={22} />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="section container">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">FRONTIERS WORTH EXPLORING</div>
              <h2>
                Follow your <span>curiosity.</span>
              </h2>
            </div>
            <span className="subtle-label">
              IDEAS THAT MOVE THE WORLD FORWARD
            </span>
          </div>
          <div className="sector-grid">
            {[
              {
                name: "AI & Machine Learning",
                icon: Cpu,
                sub: "Intelligence, reimagined",
                color: "#8b5cf6",
              },
              {
                name: "Climate Tech",
                icon: Leaf,
                sub: "Progress for the planet",
                color: "#10b981",
              },
              {
                name: "Fintech",
                icon: Landmark,
                sub: "A new financial future",
                color: "#4169ff",
              },
              {
                name: "Healthtech",
                icon: HeartPulse,
                sub: "Better care. Better lives.",
                color: "#22d3ee",
              },
            ].map((s) => (
              <Link
                href={"/marketplace?sector=" + encodeURIComponent(s.name)}
                key={s.name}
                className="sector-card"
                style={{ "--company-color": s.color } as React.CSSProperties}
              >
                <s.icon size={27} />
                <ArrowUpRight className="sector-arrow" size={18} />
                <h3>{s.name}</h3>
                <p>{s.sub}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="section container manifesto">
          <div className="manifesto-symbol">✳</div>
          <div>
            <div className="eyebrow">
              BUILT AROUND PEOPLE. POWERED BY POSSIBILITY.
            </div>
            <h2>
              A shared vision.
              <br />A world of <span>possibilities.</span>
            </h2>
            <p>
              The best connections begin with understanding. Discover a space
              where founders can tell their story and investors can explore with
              intention.
            </p>
            <Link href="/register" className="button primary">
              Find your next connection <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="principles">
            <div>
              <ShieldCheck />
              <h3>Clarity at every step</h3>
              <p>
                Transparent profiles and considered document library layouts.
              </p>
            </div>
            <div>
              <Sparkles />
              <h3>Alignment over algorithms</h3>
              <p>Understand why a startup fits your investment preferences.</p>
            </div>
            <div>
              <Globe2 />
              <h3>Ambition has no borders</h3>
              <p>Discover ideas from a globally inspired demo ecosystem.</p>
            </div>
          </div>
        </section>
        <section className="section container stories">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">BEHIND THE AMBITION</div>
              <h2>
                Every idea starts <span>with someone.</span>
              </h2>
              <p>Illustrative founder stories from our fictional ecosystem.</p>
            </div>
          </div>
          <div className="story-grid">
            {demoStartups.slice(0, 2).map((s, i) => (
              <Link key={s.id} href={"/startups/" + s.slug} className="story">
                <span className="story-quote">“</span>
                <blockquote>
                  {i
                    ? "A cleaner energy future starts with making storage work for everyone."
                    : "We believe the most powerful technology makes complex things feel simple."}
                </blockquote>
                <div className="story-person">
                  <span style={{ background: s.color + "30", color: s.color }}>
                    {i ? "VE" : "LA"}
                  </span>
                  <div>
                    <strong>{s.name} founding team</strong>
                    <small>Fictional founder story · {s.city}</small>
                  </div>
                  <ArrowUpRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="section container faq-section">
          <div>
            <div className="eyebrow muted">A LITTLE MORE CLARITY</div>
            <h2>
              Good questions.
              <br />
              <span>Clear answers.</span>
            </h2>
            <p>New to the ecosystem? Start here.</p>
            <Link href="/contact" className="text-link">
              Get in touch <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="faqs">
            {[
              [
                "What is VENTUREX?",
                "VENTUREX is a frontend design preview for startup discovery, fundraising workspaces, and professional networking. All companies and figures are fictional. No backend or database is required.",
              ],
              [
                "Can I make an investment on the platform?",
                "No. This build does not facilitate securities transactions, money movement, custody, or identity verification. Opportunity access requests start a discussion only.",
              ],
              [
                "How does smart matching work?",
                "A deterministic scoring engine compares sector, geography, stage, and illustrative budget alignment. Scores describe profile fit and do not predict investment outcomes.",
              ],
              [
                "Can founders raise capital here?",
                "You can explore the founder dashboard, profile editor, fundraising layouts, and document library. Changes are browser-local previews. No actual fundraising campaigns or investments are processed.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={17} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="container final-cta">
          <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h2>
            The future is being built.
            <br />
            <span>Find your place in it.</span>
          </h2>
          <div className="hero-buttons">
            <Link href="/marketplace" className="button primary">
              Discover opportunities <ArrowUpRight size={17} />
            </Link>
            <Link href="/register?role=FOUNDER" className="button outline">
              Bring your vision <ArrowRight size={16} />
            </Link>
          </div>
          <p>Fictional demonstration · No investment solicitation</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
