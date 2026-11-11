"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  Network,
  ShieldCheck,
} from "lucide-react";
import Marketplace from "./marketplace";
import Auth from "./auth";
import Workspace from "./workspace";
import StartupDetail from "./startup-detail";
import { Nav, Footer } from "./nav";
import { PageAtmosphere } from "./page-atmosphere";
export default function FrontendRouter({ path }: { path: string }) {
  if (path === "marketplace") return <Marketplace />;
  if (["login", "register", "forgot-password"].includes(path))
    return <Auth mode={path as "login" | "register" | "forgot-password"} />;
  if (path.startsWith("startups/"))
    return <StartupDetail slug={path.split("/")[1]} />;
  if (
    [
      "onboarding",
      "matching",
      "messages",
      "meetings",
      "notifications",
      "settings",
      "profile",
    ].includes(path) ||
    /^(investor|founder|projects|admin)\//.test(path)
  )
    return <Workspace path={path} />;
  return (
    <>
      <Nav />
      <main className="container page-main public-page story-page">
        <div className="page-heading">
          <PageAtmosphere />
          <div className="eyebrow">A NEW FRONTIER FOR POSSIBILITY</div>
          <h1>
            {path === "about"
              ? "Great ideas deserve great connections."
              : path === "contact"
                ? "Let’s start a conversation."
                : "From curiosity to connection."}
          </h1>
          <p>
            {path === "about"
              ? "We’re designing a more thoughtful space for the people building tomorrow."
              : path === "contact"
                ? "A little curiosity can lead somewhere extraordinary."
                : "Explore with intention. Connect with conviction. Move forward with clarity."}
          </p>
        </div>
        {path === "how-it-works" ? (
          <div
            className="sector-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            }}
          >
            {[
              [
                Compass,
                "01",
                "Discover your conviction",
                "Find your focus across a globally inspired collection of startup profiles.",
              ],
              [
                Network,
                "02",
                "Connect with the vision",
                "Explore the team, understand the idea, and start a conversation.",
              ],
              [
                ShieldCheck,
                "03",
                "Build your understanding",
                "Organize diligence and keep meaningful opportunities in perspective.",
              ],
            ].map(([Icon, n, title, text]) => (
              <section className="panel" key={String(n)}>
                <div className="eyebrow" style={{ marginBottom: 30 }}>
                  {String(n)}
                  <span style={{ marginLeft: "auto" }}>
                    {typeof Icon !== "string" && <Icon size={25} />}
                  </span>
                </div>
                <h2 style={{ fontSize: 24 }}>{String(title)}</h2>
                <p style={{ fontSize: 12 }}>{String(text)}</p>
              </section>
            ))}
          </div>
        ) : path === "contact" ? (
          <div className="dashboard-grid">
            <section className="panel">
              <h2 style={{ fontSize: 25 }}>A space for your questions.</h2>
              <p>
                This is a frontend design preview. The contact form previews its
                confirmation state; it does not send a message.
              </p>
              <ContactForm />
            </section>
            <div className="panel">
              <div className="auth-art" style={{ fontSize: 120 }}>
                ✳
              </div>
              <h2>
                One connection.
                <br />
                <span>Infinite possibility.</span>
              </h2>
              <p>Explore the ecosystem while we bring the vision to life.</p>
              <Link className="text-link" href="/marketplace">
                Discover opportunities
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <section className="manifesto" style={{ marginTop: 40 }}>
            <div>
              <div className="eyebrow">THE VENTUREX VISION</div>
              <h2>
                Ambition has
                <br />
                <span>no borders.</span>
              </h2>
              <p>
                We believe the future is shaped by people who see possibility
                where others see uncertainty. VENTUREX brings discovery,
                storytelling, and meaningful connection into one considered
                experience.
              </p>
            </div>
            <div>
              <h3>Clarity over complexity.</h3>
              <p>
                A thoughtful interface helps people understand the ideas that
                matter to them.
              </p>
              <h3>People before portfolios.</h3>
              <p>
                Behind every extraordinary company is a team with a story worth
                hearing.
              </p>
              <h3>A demonstration of possibility.</h3>
              <p>
                All companies, funding figures, and portfolio data in this
                preview are fictional. No investments are offered or processed.
              </p>
            </div>
          </section>
        )}
        <div style={{ marginTop: 35 }}>
          <Link href="/marketplace" className="button primary">
            Explore the ecosystem
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
function ContactForm() {
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const notice = form.querySelector("[role=status]")!;
        notice.textContent =
          "Thanks for exploring. This is a preview confirmation — no message was sent.";
        form.reset();
      }}
    >
      <label>
        Your name
        <input name="name" required />
      </label>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Your message
        <textarea name="message" required minLength={10} />
      </label>
      <button className="button primary">
        Preview message confirmation
        <ArrowUpRight size={16} />
      </button>
      <p role="status" className="notice-inline" />
    </form>
  );
}
