"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  MessageSquare,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import { Nav, Footer } from "./nav";
import { api, post } from "./api";
import { StartupData, money } from "../../../packages/shared/src";
import { PageAtmosphere } from "./page-atmosphere";
export default function StartupDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const [startup, setStartup] = useState<StartupData>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    api("/startups/" + slug)
      .then(setStartup)
      .catch((e) => setError(e.message));
  }, [slug]);
  async function act(action: string) {
    try {
      if (action === "message") {
        await post("/conversations", { startupId: startup!.id });
        router.push("/messages");
      } else if (action === "save") {
        await post("/watchlist/" + startup!.id, {});
        setNotice("Saved to your watchlist.");
      } else {
        await post("/deals", { startupId: startup!.id });
        setNotice(
          "Added to your demo deal pipeline in this browser. No request was sent.",
        );
      }
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <>
      <Nav />
      <main className="container page-main public-page startup-detail-page">
        <Link href="/marketplace" className="breadcrumb">
          <ArrowLeft size={13} />
          Back to discovery
        </Link>
        {error ? (
          <div className="error-box">{error}</div>
        ) : !startup ? (
          <div className="skeleton" />
        ) : (
          <>
            <div className="demo-banner">
              Fictional company · All traction and financial figures are
              illustrative · Identity has not been verified
            </div>
            <section className="detail-hero">
              <PageAtmosphere compact />
              <div>
                <div
                  className="detail-brand"
                  style={
                    { "--company-color": startup.color } as React.CSSProperties
                  }
                >
                  <span className="company-art-symbol">{startup.symbol}</span>
                  <span className="art-wordmark">
                    {startup.name.toLowerCase()}
                  </span>
                </div>
                <div className="tag-row">
                  <span className="tag">{startup.sector}</span>
                  <span className="tag">{startup.stage}</span>
                  <span className="tag">
                    {startup.city}, {startup.country}
                  </span>
                </div>
                <h1>{startup.name}</h1>
                <p>{startup.description}</p>
              </div>
              <aside className="funding-panel">
                <div className="eyebrow">THE NEXT CHAPTER</div>
                <span className="big-amount">{money(startup.raised)}</span>
                <p style={{ fontSize: 11 }}>
                  illustrative funding of a {money(startup.target)} target
                </p>
                <div className="progress">
                  <span
                    style={{
                      width: (startup.raised / startup.target) * 100 + "%",
                      background: startup.color,
                    }}
                  />
                </div>
                <span className="form-note">
                  {Math.round((startup.raised / startup.target) * 100)}% of demo
                  target
                </span>
                <div className="terms">
                  <span>Funding stage</span>
                  <strong>{startup.stage}</strong>
                </div>
                <div className="terms">
                  <span>Illustrative structure</span>
                  <strong>{startup.instrument}</strong>
                </div>
                <div className="terms">
                  <span>Offering status</span>
                  <strong>Demonstration only</strong>
                </div>
                <button
                  className="button primary"
                  onClick={() => act("access")}
                >
                  Request investment access <ArrowUpRight size={16} />
                </button>
                <button className="button outline" onClick={() => act("save")}>
                  Save to watchlist
                </button>
                <p className="form-note" style={{ margin: "15px 0 0" }}>
                  An access request starts a conversation. It is not a
                  commitment to invest.
                </p>
                {notice && (
                  <p className="notice-inline" role="status">
                    {notice}
                    {notice.includes("sign in") && (
                      <Link href="/login"> — Sign in</Link>
                    )}
                  </p>
                )}
              </aside>
            </section>
            <nav className="detail-tabs">
              <a href="#overview">Overview</a>
              <a href="#market">Market & business</a>
              <a href="#team">Founding team</a>
              <a href="#documents">Document room</a>
              <a href="#risks">Risks & disclosures</a>
            </nav>
            <div className="detail-grid">
              <article className="detail-content">
                <section id="overview">
                  <div className="eyebrow">AN IDEA WITH INTENTION</div>
                  <h2>The problem worth solving.</h2>
                  <p>
                    In this illustrative company story, {startup.name} addresses
                    fragmented tools and growing operational complexity in{" "}
                    {startup.sector.toLowerCase()}. Teams need a practical way
                    to turn new technology into useful, everyday outcomes.
                  </p>
                  <h2>A more thoughtful solution.</h2>
                  <p>
                    {startup.description} The fictional product combines a
                    focused user experience with technology designed for
                    scalable deployment. This profile demonstrates how founders
                    can communicate their vision; product claims have not been
                    independently assessed.
                  </p>
                </section>
                <section id="market">
                  <h2>A market in motion.</h2>
                  <p>
                    The team’s illustrative business model centers on recurring
                    subscriptions and enterprise partnerships in{" "}
                    {startup.country}, with an ambition to expand into adjacent
                    markets. Detailed forecasts, independently validated market
                    sizing, and customer evidence are not available in this
                    demonstration.
                  </p>
                  <div className="panel">
                    <div className="panel-header">
                      <h2>Illustrative financial overview</h2>
                      <span>DEMO DATA</span>
                    </div>
                    <div className="terms">
                      <span>Funding target</span>
                      <strong>{money(startup.target)}</strong>
                    </div>
                    <div className="terms">
                      <span>Demo amount raised</span>
                      <strong>{money(startup.raised)}</strong>
                    </div>
                    <div className="terms">
                      <span>Remaining demo target</span>
                      <strong>{money(startup.target - startup.raised)}</strong>
                    </div>
                    <p className="form-note" style={{ marginTop: 15 }}>
                      No actual revenue, financial statements, or investment
                      returns are represented.
                    </p>
                  </div>
                </section>
                <section id="team">
                  <h2>People behind the possibility.</h2>
                  <p>
                    The {startup.name} team is fictional. Founder biographies,
                    employment history, customer references, and identity checks
                    would need independent diligence before any real engagement.
                  </p>
                  <button
                    className="button outline"
                    onClick={() => act("message")}
                  >
                    <MessageSquare size={16} />
                    Start a founder conversation
                  </button>
                </section>
                <section id="documents">
                  <h2>
                    <LockKeyhole
                      size={22}
                      style={{ display: "inline", marginRight: 10 }}
                    />
                    A permission-based document room.
                  </h2>
                  <p>
                    Explore the document library design. File names can be
                    previewed locally; no files are uploaded or shared. Secure
                    document storage is outside this frontend preview.
                  </p>
                  <Link className="button outline" href="/founder/documents">
                    Open my document workspace <ArrowUpRight size={15} />
                  </Link>
                </section>
              </article>
              <aside>
                <div id="risks" className="risk-box">
                  <ShieldAlert
                    size={25}
                    style={{ color: "#b29a6e", marginBottom: 15 }}
                  />
                  <h3>Understand the risks.</h3>
                  <p>
                    Startup investing can involve loss of all capital,
                    illiquidity, dilution, valuation uncertainty, and long
                    holding periods. This fictional profile is for product
                    demonstration only.
                  </p>
                  <p>
                    No securities are offered. VENTUREX does not process
                    investments, move funds, provide custody, or claim
                    regulatory approval. Seek independent professional advice
                    for actual investment decisions.
                  </p>
                </div>
                <div className="panel" style={{ marginTop: 25 }}>
                  <h3>Before moving forward</h3>
                  {[
                    "Review the founding team",
                    "Validate product and traction",
                    "Examine financial statements",
                    "Understand terms and risks",
                    "Seek independent advice",
                  ].map((t) => (
                    <p
                      key={t}
                      style={{
                        fontSize: 11,
                        borderBottom: "1px solid var(--border)",
                        paddingBottom: 12,
                      }}
                    >
                      {t}
                    </p>
                  ))}
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
