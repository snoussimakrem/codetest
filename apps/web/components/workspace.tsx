"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Bookmark,
  BriefcaseBusiness,
  Compass,
  MessageSquare,
  CalendarDays,
  Bell,
  Settings,
  LogOut,
  FolderLock,
  Building2,
  Users,
  Sparkles,
  ShieldCheck,
  FileClock,
  Plus,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Target,
  ArrowRight,
  Check,
  Inbox,
  Upload,
  Trash2,
  Network,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Brand } from "./nav";
import {
  WorkspaceMasthead,
  WorkspaceSwitcher,
  type WorkspaceRole,
  workspaceIdentity,
} from "./workspace-identity";
import { api, post } from "./api";
import { StartupCard } from "./startup-card";
import { money, Preferences } from "../../../packages/shared/src";
const PortfolioChart = dynamic(
  () => import("./charts").then((m) => m.PortfolioChart),
  { ssr: false, loading: () => <div className="skeleton" /> },
);
const DistributionChart = dynamic(
  () => import("./charts").then((m) => m.DistributionChart),
  { ssr: false },
);
const links = {
  INVESTOR: [
    ["Dashboard", "/investor/dashboard", LayoutDashboard],
    ["Portfolio", "/investor/portfolio", Wallet],
    ["Opportunities", "/investor/opportunities", Compass],
    ["Watchlist", "/investor/watchlist", Bookmark],
    ["Deal pipeline", "/investor/deals", BriefcaseBusiness],
    ["Analytics", "/investor/analytics", ChartNoAxesCombined],
  ],
  FOUNDER: [
    ["Dashboard", "/founder/dashboard", LayoutDashboard],
    ["My startup", "/founder/startup", Building2],
    ["Fundraising", "/founder/fundraising", Target],
    ["Analytics", "/founder/analytics", ChartNoAxesCombined],
    ["Investor connections", "/founder/investors", Users],
    ["Documents", "/founder/documents", FolderLock],
  ],
  PROJECT_OWNER: [
    ["Dashboard", "/projects/dashboard", LayoutDashboard],
    ["Create project", "/projects/create", Plus],
    ["Funding requests", "/projects/funding", Target],
  ],
  ADMIN: [
    ["Dashboard", "/admin/dashboard", LayoutDashboard],
    ["Startups", "/admin/startups", Building2],
    ["Users", "/admin/users", Users],
    ["Verification requests", "/admin/verifications", ShieldCheck],
    ["Audit logs", "/admin/audit-logs", FileClock],
  ],
} as const;
const common = [
  ["Smart matching", "/matching", Sparkles],
  ["Messages", "/messages", MessageSquare],
  ["Meetings", "/meetings", CalendarDays],
  ["Notifications", "/notifications", Bell],
  ["Settings", "/settings", Settings],
] as const;
export function useResource<T = any>(path: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const refresh = useCallback(() => {
    setError("");
    api<T>(path)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [path]);
  useEffect(refresh, [refresh]);
  return { data, error, refresh };
}
function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <div role="alert" className="error-box">
      {error}
    </div>
  ) : null;
}
function Empty({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <Link href={href} className="button outline small">
          {label || "Explore opportunities"}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}
function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="workspace-header">
      <div className="page-heading">
        <div className="eyebrow">YOUR VENTUREX WORKSPACE</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function KPI({
  label,
  value,
  note,
  icon: Icon = TrendingUp,
}: {
  label: string;
  value: string;
  note: string;
  icon?: any;
}) {
  return (
    <div className="kpi">
      <Icon />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
export default function Workspace({ path }: { path: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, error } = useResource<any>("/auth/me");
  useEffect(() => {
    if (error.includes("sign in")) router.replace("/login");
  }, [error, router]);
  if (!user)
    return (
      <main className="container page-main">
        <Brand />
        <div className="loading">Opening your workspace…</div>
        <ErrorMessage error={error} />
      </main>
    );
  const workspaceRole: WorkspaceRole = path.startsWith("founder/")
    ? "FOUNDER"
    : path.startsWith("projects/")
      ? "PROJECT_OWNER"
      : path.startsWith("admin/")
        ? "ADMIN"
        : path.startsWith("investor/")
          ? "INVESTOR"
          : user.role;
  const ownLinks = links[workspaceRole as keyof typeof links];
  async function logout() {
    await post("/auth/logout", {});
    router.push("/login");
  }
  return (
    <div
      className={`dashboard-shell workspace-role-${workspaceRole.toLowerCase().replace("_", "-")}`}
      style={
        {
          "--role-accent": workspaceIdentity[workspaceRole].accent,
        } as React.CSSProperties
      }
    >
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">
          {workspaceIdentity[workspaceRole].name}
        </div>
        {ownLinks.map(([label, href, Icon]) => (
          <Link
            className={"side-link " + (pathname === href ? "active" : "")}
            href={href}
            key={href}
          >
            <Icon />
            {label}
          </Link>
        ))}
        <div className="sidebar-label">YOUR ECOSYSTEM</div>
        {common.map(([label, href, Icon]) => (
          <Link
            className={"side-link " + (pathname === href ? "active" : "")}
            href={href}
            key={href}
          >
            <Icon />
            {label}
          </Link>
        ))}
        <div className="sidebar-bottom">
          <Link className="side-link" href="/marketplace">
            <Compass />
            Explore marketplace
          </Link>
          <Link className="side-link" href="/profile">
            <Users />
            My profile
          </Link>
          <button onClick={logout} className="button ghost small">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="dashboard-area">
        <WorkspaceSwitcher current={workspaceRole} />
        <div className="mobile-workspace-nav">
          <Brand />
          <select
            aria-label="Navigate workspace"
            value={pathname}
            onChange={(e) => router.push(e.target.value)}
          >
            {[
              ...ownLinks,
              ...common,
              ["Profile", "/profile", Users] as const,
            ].map(([label, href]) => (
              <option value={href} key={href}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <header className="dashboard-topbar">
          <span>
            Workspace{" "}
            <span style={{ marginInline: 8, color: "#3c5073" }}>/</span>{" "}
            {path.split("/").pop()?.replaceAll("-", " ")}
          </span>
          <div className="topbar-user">
            <Link href="/notifications" aria-label="Notifications">
              <Bell size={16} />
            </Link>
            <Link href="/profile">{user.name}</Link>
            <span className="user-avatar">
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={logout}
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>
        <main className="dashboard-content">
          <WorkspaceMasthead role={workspaceRole} />
          <div className="demo-banner">
            Frontend preview · Fictional startups · Simulated values · Changes
            saved in this browser
          </div>
          <WorkspaceContent path={path} user={user} />
        </main>
      </div>
    </div>
  );
}
function WorkspaceContent({ path, user }: { path: string; user: any }) {
  if (path === "onboarding" || path === "matching")
    return <Matching onboarding={path === "onboarding"} user={user} />;
  if (path.startsWith("investor/")) {
    if (path.endsWith("watchlist")) return <Watchlist />;
    if (path.endsWith("opportunities")) return <Opportunities />;
    if (path.endsWith("deals")) return <Deals />;
    return <InvestorDashboard page={path.split("/")[1]} user={user} />;
  }
  if (path === "messages") return <Messages user={user} />;
  if (path === "meetings") return <Meetings />;
  if (path === "notifications") return <Notifications />;
  if (path === "settings" || path === "profile")
    return <SettingsPage user={user} profile={path === "profile"} />;
  if (path.startsWith("founder/")) return <Founder page={path.split("/")[1]} />;
  if (path.startsWith("projects/"))
    return (
      <Projects
        create={path.endsWith("create")}
        funding={path.endsWith("funding")}
      />
    );
  if (path.startsWith("admin/")) return <Admin page={path.split("/")[1]} />;
  return (
    <Empty
      title="Workspace unavailable"
      text="Choose a section from the navigation."
    />
  );
}
function Holdings({ holdings }: { holdings: any[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>COMPANY</th>
            <th>SECTOR</th>
            <th>INVESTED (SIM.)</th>
            <th>VALUE (SIM.)</th>
            <th>CHANGE (SIM.)</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.id}>
              <td>
                <Link
                  href={"/startups/" + h.startup.slug}
                  className="company-cell"
                >
                  <span
                    style={{
                      background: h.startup.color + "20",
                      color: h.startup.color,
                    }}
                  >
                    {h.startup.symbol}
                  </span>
                  {h.startup.name}
                </Link>
              </td>
              <td>{h.startup.sector}</td>
              <td>{money(h.invested)}</td>
              <td>{money(h.value)}</td>
              <td className="positive">
                +{((h.value / h.invested - 1) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function InvestorDashboard({ page, user }: { page: string; user: any }) {
  const { data: holdings, error } = useResource<any[]>("/portfolio");
  const { data: watchlist } = useResource<any[]>("/watchlist");
  const { data: deals } = useResource<any[]>("/deals");
  const { data: meetings } = useResource<any[]>("/meetings");
  if (!holdings)
    return (
      <>
        <ErrorMessage error={error} />
        <div className="skeleton" />
      </>
    );
  const invested = holdings.reduce((n, h) => n + h.invested, 0),
    value = holdings.reduce((n, h) => n + h.value, 0);
  return (
    <>
      <Heading
        title={
          page === "dashboard"
            ? `Welcome back, ${user.name.split(" ")[0]}.`
            : page === "portfolio"
              ? "Your portfolio, in perspective."
              : "The bigger picture."
        }
        description="A thoughtful view of your opportunities and simulated holdings."
      >
        <Link className="button primary small" href="/marketplace">
          Discover opportunities
          <ArrowUpRight size={14} />
        </Link>
      </Heading>
      <div className="kpi-grid">
        <KPI
          label="Total invested · simulated"
          value={money(invested)}
          note={`${holdings.length} fictional companies`}
          icon={Wallet}
        />
        <KPI
          label="Portfolio value · simulated"
          value={money(value)}
          note="Illustrative valuation only"
          icon={ChartNoAxesCombined}
        />
        <KPI
          label="Value change · simulated"
          value={
            invested ? ((value / invested - 1) * 100).toFixed(1) + "%" : "—"
          }
          note="Does not represent actual returns"
        />
        <KPI
          label="Your opportunity pipeline"
          value={String(deals?.length || 0)}
          note={`${watchlist?.length || 0} saved opportunities`}
          icon={BriefcaseBusiness}
        />
      </div>
      {!holdings.length ? (
        <Empty
          title="Your portfolio story starts here."
          text="No holdings are recorded. Explore companies and begin your discovery."
          href="/marketplace"
        />
      ) : (
        <>
          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <h2>Portfolio trajectory</h2>
                <span>ILLUSTRATIVE HISTORY · SIMULATED</span>
              </div>
              <PortfolioChart value={value} />
            </section>
            <section className="panel">
              <div className="panel-header">
                <h2>Capital allocation</h2>
                <span>SIMULATED</span>
              </div>
              <DistributionChart holdings={holdings} />
            </section>
          </div>
          <section className="panel">
            <div className="panel-header">
              <h2>Your startup holdings</h2>
              <span>ALL FIGURES SIMULATED</span>
            </div>
            <Holdings holdings={holdings} />
          </section>
        </>
      )}
      {page === "dashboard" && (
        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <h2>Saved for a closer look</h2>
              <Link className="text-link" href="/investor/watchlist">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {watchlist?.length ? (
              watchlist.slice(0, 3).map((w) => (
                <Link
                  href={"/startups/" + w.startup.slug}
                  className="list-row"
                  key={w.id}
                >
                  <div>
                    <h3>{w.startup.name}</h3>
                    <p>
                      {w.startup.sector} · {w.startup.stage}
                    </p>
                  </div>
                  <ArrowUpRight size={15} />
                </Link>
              ))
            ) : (
              <p className="form-note">
                Save opportunities from the marketplace to return to them here.
              </p>
            )}
          </section>
          <section className="panel">
            <div className="panel-header">
              <h2>On your calendar</h2>
              <Link href="/meetings" className="text-link">
                Open calendar <ArrowRight size={13} />
              </Link>
            </div>
            {meetings?.length ? (
              meetings.slice(0, 3).map((m) => (
                <div className="list-row" key={m.id}>
                  <CalendarDays size={17} />
                  <div>
                    <h3>{m.title}</h3>
                    <p>{new Date(m.startsAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="form-note">
                A little space for your next meaningful conversation.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
function Watchlist() {
  const { data, error, refresh } = useResource<any[]>("/watchlist");
  return (
    <>
      <Heading
        title="Ideas worth coming back to."
        description="Your saved opportunities, all in one considered collection."
      />
      <ErrorMessage error={error} />
      {!data ? (
        <div className="skeleton" />
      ) : data.length ? (
        <div className="startup-grid">
          {data.map((w) => (
            <div key={w.id}>
              <StartupCard startup={w.startup} />
              <button
                className="button ghost small"
                onClick={async () => {
                  await api("/watchlist/" + w.startupId, { method: "DELETE" });
                  refresh();
                }}
              >
                Remove from watchlist
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="Make room for possibility."
          text="Save a company that catches your attention. It will be waiting here."
          href="/marketplace"
        />
      )}
    </>
  );
}
function Opportunities() {
  const { data, error } = useResource("/startups?limit=12");
  return (
    <>
      <Heading
        title="A world of new possibilities."
        description="Explore the fictional startup ecosystem. Use marketplace filters for a more focused search."
      >
        <Link className="button outline small" href="/marketplace">
          Open discovery filters <ArrowUpRight size={14} />
        </Link>
      </Heading>
      <ErrorMessage error={error} />
      {data ? (
        <div className="startup-grid">
          {data.items.map((s: any) => (
            <StartupCard startup={s} key={s.id} />
          ))}
        </div>
      ) : (
        <div className="skeleton" />
      )}
    </>
  );
}
function Deals() {
  const { data, error, refresh } = useResource<any[]>("/deals");
  const [notice, setNotice] = useState("");
  async function update(id: string, body: any) {
    try {
      await api("/deals/" + id, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setNotice("Deal updated.");
      refresh();
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <>
      <Heading
        title="From interest to understanding."
        description="Organize discussions and diligence. Deal stages do not represent a completed securities transaction."
      />
      <ErrorMessage error={error} />
      {notice && (
        <p className="notice-inline" role="status">
          {notice}
        </p>
      )}
      {data?.length ? (
        <div className="pipeline">
          {["INTEREST", "REVIEW", "DUE_DILIGENCE", "DISCUSSION", "CLOSED"].map(
            (stage) => (
              <section className="pipeline-column" key={stage}>
                <h3>
                  {stage.replaceAll("_", " ")} ·{" "}
                  {data.filter((d) => d.stage === stage).length}
                </h3>
                {data
                  .filter((d) => d.stage === stage)
                  .map((d) => (
                    <article className="deal-card" key={d.id}>
                      <h4>{d.startup.name}</h4>
                      <label>
                        <span className="sr-only">
                          Deal stage for {d.startup.name}
                        </span>
                        <select
                          value={d.stage}
                          onChange={(e) =>
                            update(d.id, { stage: e.target.value })
                          }
                        >
                          {[
                            "INTEREST",
                            "REVIEW",
                            "DUE_DILIGENCE",
                            "DISCUSSION",
                            "CLOSED",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          update(d.id, {
                            notes: new FormData(e.currentTarget).get("notes"),
                          });
                        }}
                      >
                        <label>
                          <span className="sr-only">Deal notes</span>
                          <textarea
                            name="notes"
                            defaultValue={d.notes}
                            placeholder="Your deal notes…"
                            maxLength={5000}
                          />
                        </label>
                        <button className="button outline small">
                          Save notes
                        </button>
                      </form>
                      <label className="check-chip" style={{ marginTop: 10 }}>
                        <input
                          type="checkbox"
                          checked={d.checklist?.[0]?.done || false}
                          onChange={(e) =>
                            update(d.id, {
                              checklist: [
                                {
                                  label: "Initial diligence reviewed",
                                  done: e.target.checked,
                                },
                              ],
                            })
                          }
                        />
                        Initial diligence reviewed
                      </label>
                    </article>
                  ))}
              </section>
            ),
          )}
        </div>
      ) : data ? (
        <Empty
          title="Start with a conversation."
          text="Request access from a startup profile to add an opportunity to your pipeline."
          href="/marketplace"
        />
      ) : (
        <div className="skeleton" />
      )}
    </>
  );
}
function Matching({ onboarding, user }: { onboarding: boolean; user: any }) {
  const {
    data: preferences,
    error,
    refresh,
  } = useResource<Preferences>("/preferences");
  const { data: matches, refresh: refreshMatches } =
    useResource<any[]>("/matching");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    try {
      await post("/preferences", {
        sectors: f.getAll("sectors"),
        countries: f.getAll("countries"),
        stages: f.getAll("stages"),
        budget: Number(f.get("budget")),
        risk: f.get("risk"),
        thesis: f.get("thesis"),
      });
      setNotice("Preferences saved. Your matches have been recalculated.");
      refresh();
      refreshMatches();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  if (user.role !== "INVESTOR")
    return (
      <>
        <Heading
          title={
            onboarding ? "Your vision has a home." : "Connections with context."
          }
          description="Your account is ready. Matching preferences currently support investor accounts."
        />
        <Link
          className="button primary"
          href={
            user.role === "FOUNDER" ? "/founder/startup" : "/projects/create"
          }
        >
          Build your {user.role === "FOUNDER" ? "startup profile" : "project"}{" "}
          <ArrowRight size={15} />
        </Link>
      </>
    );
  return (
    <>
      <Heading
        title={
          onboarding ? "Let’s find your alignment." : "Alignment, explained."
        }
        description="Your preferences shape the recommendations. Every score comes with a reason."
      />
      <ErrorMessage error={error} />
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Your investment preferences</h2>
            <Network size={17} />
          </div>
          {preferences && (
            <form className="form-stack" onSubmit={submit}>
              <label>Preferred industries</label>
              <div className="check-group">
                {[
                  "AI & Machine Learning",
                  "Climate Tech",
                  "Fintech",
                  "Healthtech",
                  "Enterprise SaaS",
                  "Cybersecurity",
                ].map((s) => (
                  <label className="check-chip" key={s}>
                    <input
                      type="checkbox"
                      name="sectors"
                      value={s}
                      defaultChecked={preferences.sectors.includes(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              <label>Geographic focus</label>
              <div className="check-group">
                {[
                  "United States",
                  "Germany",
                  "United Kingdom",
                  "Singapore",
                  "Canada",
                  "France",
                ].map((s) => (
                  <label className="check-chip" key={s}>
                    <input
                      type="checkbox"
                      name="countries"
                      value={s}
                      defaultChecked={preferences.countries.includes(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              <label>Funding stages</label>
              <div className="check-group">
                {["Pre-seed", "Seed", "Series A"].map((s) => (
                  <label className="check-chip" key={s}>
                    <input
                      type="checkbox"
                      name="stages"
                      value={s}
                      defaultChecked={preferences.stages.includes(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              <div className="form-grid">
                <label>
                  Illustrative budget (USD)
                  <input
                    name="budget"
                    type="number"
                    min={1}
                    max={100000000}
                    required
                    defaultValue={preferences.budget}
                  />
                </label>
                <label>
                  Risk preference
                  <select name="risk" defaultValue={preferences.risk}>
                    {["Conservative", "Balanced", "Ambitious"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Investment thesis
                <textarea
                  name="thesis"
                  maxLength={2000}
                  defaultValue={preferences.thesis}
                  placeholder="What kind of future do you want to support?"
                />
              </label>
              <p className="form-note">
                No selection means open to all. Score weights: sector 30, stage
                20, geography 15, illustrative budget fit 15, base 20. Risk
                preference and thesis are saved for future review and do not
                affect scores.
              </p>
              <button className="button primary" disabled={loading}>
                {loading ? "Saving…" : "Save preferences & find alignment"}
                <Sparkles size={15} />
              </button>
              {notice && (
                <p role="status" className="notice-inline">
                  {notice}
                </p>
              )}
            </form>
          )}
        </section>
        <aside>
          <div className="panel">
            <Sparkles
              size={25}
              style={{ color: "#9d8cff", marginBottom: 20 }}
            />
            <h2 style={{ fontSize: 24 }}>A fit is a starting point.</h2>
            <p style={{ fontSize: 12 }}>
              These deterministic compatibility scores describe how well a
              startup matches the preferences you choose. They do not predict
              investment returns, quality, or success.
            </p>
            <p className="form-note">
              No external AI service is used in this build. Geography, stage and
              sector factors can be independently inspected.
            </p>
          </div>
          {onboarding && (
            <Link href="/investor/dashboard" className="button outline">
              Continue to your workspace <ArrowRight size={16} />
            </Link>
          )}
        </aside>
      </div>
      <div className="section-heading">
        <h2 style={{ fontSize: 25 }}>Your closest connections.</h2>
        <span className="subtle-label">EXPLAINABLE PROFILE COMPATIBILITY</span>
      </div>
      <div className="match-grid">
        {matches?.slice(0, 6).map((s) => (
          <article className="match-card" key={s.id}>
            <div className="match-card-head">
              <div>
                <div
                  className="eyebrow"
                  style={{ fontSize: 7, marginBottom: 10 }}
                >
                  {s.sector}
                </div>
                <h3>{s.name}</h3>
              </div>
              <span className="match-score">{s.match.score}%</span>
            </div>
            {s.match.factors.map((f: string) => (
              <div className="match-factor" key={f}>
                <Check size={11} />
                {f}
              </div>
            ))}
            {s.match.mismatches.map((f: string) => (
              <div className="match-mismatch" key={f}>
                △ {f}
              </div>
            ))}
            <p>{s.match.explanation}</p>
            <Link className="text-link" href={"/startups/" + s.slug}>
              Explore the story <ArrowUpRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
function Messages({ user }: { user: any }) {
  const { data: conversations, error } = useResource<any[]>("/conversations");
  const [selected, setSelected] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (conversations?.length && !selected) setSelected(conversations[0].id);
  }, [conversations, selected]);
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    const load = () =>
      api("/conversations/" + selected + "/messages")
        .then((d) => {
          if (alive) setMessages(d);
        })
        .catch((e) => {
          if (alive) setNotice(e.message);
        });
    load();
    const timer = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [selected]);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = String(new FormData(form).get("message"));
    setSending(true);
    try {
      const message = await post("/conversations/" + selected + "/messages", {
        body,
      });
      setMessages((m) => [...m.filter((v) => v.id !== message.id), message]);
      form.reset();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <Heading
        title="Meaningful conversations start here."
        description="Explore a conversation preview. Messages stay in this browser; no real messages are sent."
      />
      <ErrorMessage error={error} />
      {conversations?.length ? (
        <div className="message-layout">
          <aside className="conversation-list">
            {conversations.map((c) => (
              <button
                key={c.id}
                className={selected === c.id ? "active" : ""}
                onClick={() => {
                  setSelected(c.id);
                  setMessages([]);
                }}
              >
                <strong>
                  {c.members
                    .filter((m: any) => m.user.id !== user.id)
                    .map((m: any) => m.user.name)
                    .join(", ")}
                </strong>
                <span>
                  {c.messages[0]?.body.slice(0, 65) || "A new conversation"}
                </span>
              </button>
            ))}
          </aside>
          <section className="chat">
            <div className="chat-header">Your private conversation</div>
            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  className={"bubble " + (m.senderId === user.id ? "mine" : "")}
                  key={m.id}
                >
                  <small>
                    {m.sender?.name} · {new Date(m.createdAt).toLocaleString()}
                  </small>
                  {m.body}
                </div>
              ))}
            </div>
            <form className="chat-compose" onSubmit={send}>
              <label style={{ flex: 1 }}>
                <span className="sr-only">Message</span>
                <input
                  name="message"
                  placeholder="Start with hello…"
                  required
                  maxLength={5000}
                  autoComplete="off"
                />
              </label>
              <button className="button primary" disabled={sending}>
                Send <ArrowRight size={14} />
              </button>
            </form>
          </section>
        </div>
      ) : conversations ? (
        <Empty
          title="Say hello to possibility."
          text="Open a startup profile and start a founder conversation."
          href="/marketplace"
        />
      ) : (
        <div className="skeleton" />
      )}
      {notice && (
        <p className="notice-inline" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
function Meetings() {
  const { data, error, refresh } = useResource<any[]>("/meetings");
  const [notice, setNotice] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    try {
      await post("/meetings", {
        title: f.get("title"),
        startsAt: new Date(String(f.get("startsAt"))).toISOString(),
      });
      form.reset();
      refresh();
      setNotice(
        "Meeting reminder created. Calendar invitations are not sent by this local build.",
      );
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <>
      <Heading
        title="Make time for what’s next."
        description="Keep your conversations in view. These are personal meeting requests; external invitations are not configured."
      />
      <ErrorMessage error={error} />
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Your upcoming conversations</h2>
            <CalendarDays size={18} />
          </div>
          {data?.length ? (
            data.map((m) => (
              <div className="list-row" key={m.id}>
                <div>
                  <h3>{m.title}</h3>
                  <p>{new Date(m.startsAt).toLocaleString()}</p>
                </div>
                <div className="row-actions">
                  <span className="status-badge">{m.status}</span>
                  <button
                    className="icon-button"
                    aria-label={"Cancel " + m.title}
                    onClick={async () => {
                      try {
                        await api("/meetings/" + m.id, { method: "DELETE" });
                        refresh();
                      } catch (e) {
                        setNotice((e as Error).message);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="form-note">
              Your calendar is open for a new connection.
            </p>
          )}
        </section>
        <section className="panel">
          <h2 style={{ fontSize: 19 }}>Plan a conversation.</h2>
          <form className="form-stack" onSubmit={submit}>
            <label>
              Meeting title
              <input
                name="title"
                minLength={3}
                maxLength={150}
                required
                placeholder="Product vision with Lumina AI"
              />
            </label>
            <label>
              Date & time (your browser timezone)
              <input name="startsAt" type="datetime-local" required />
            </label>
            <button className="button primary">
              Create meeting reminder
              <Plus size={15} />
            </button>
          </form>
          {notice && (
            <p className="notice-inline" role="status">
              {notice}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
function Notifications() {
  const { data, error, refresh } = useResource<any[]>("/notifications");
  return (
    <>
      <Heading
        title="Stay close to the conversation."
        description="Updates from your fundraising and discovery activity."
      />
      <ErrorMessage error={error} />
      {data?.length ? (
        <section className="panel">
          {data.map((n) => (
            <div className="list-row" key={n.id}>
              <Bell size={17} />
              <div style={{ flex: 1 }}>
                <h3>{n.body}</h3>
                <p>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {n.read ? (
                <span className="status-badge">Read</span>
              ) : (
                <button
                  className="button outline small"
                  onClick={async () => {
                    await api("/notifications/" + n.id, { method: "PATCH" });
                    refresh();
                  }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </section>
      ) : (
        <Empty
          title="You’re all caught up."
          text="New activity will appear here as your connections grow."
        />
      )}
    </>
  );
}
function SettingsPage({ user, profile }: { user: any; profile: boolean }) {
  const [notice, setNotice] = useState("");
  const { data: organizations, refresh } = useResource<any[]>("/organizations");
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: new FormData(e.currentTarget).get("name"),
        }),
      });
      setNotice("Profile saved. Reload to update your name in navigation.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <>
      <Heading
        title={
          profile
            ? "Your introduction to the ecosystem."
            : "A workspace that feels like yours."
        }
        description="Explore your profile and organization settings. Changes apply only to this browser preview."
      />
      <div className="dashboard-grid">
        <section className="panel">
          <h2 style={{ fontSize: 20 }}>Your preview persona</h2>
          <form className="form-stack" onSubmit={save}>
            <label>
              Full name
              <input
                name="name"
                defaultValue={user.name}
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            <label>
              Email
              <input value={user.email} disabled readOnly />
            </label>
            <label>
              Account role
              <input value={user.role.replace("_", " ")} disabled readOnly />
            </label>
            <button className="button primary">Save profile</button>
          </form>
          {notice && (
            <p className="notice-inline" role="status">
              {notice}
            </p>
          )}
          <p className="form-note">
            Email and role changes require an operator. Identity verification is
            not provided by this local build.
          </p>
          <button
            className="button outline small"
            onClick={async () => {
              try {
                await post("/verifications", {});
                setNotice(
                  "This is a visual preview. No verification request was submitted.",
                );
              } catch (e) {
                setNotice((e as Error).message);
              }
            }}
          >
            Preview verification request
          </button>
        </section>
        <section className="panel">
          <h2 style={{ fontSize: 20 }}>Your organizations</h2>
          {organizations?.map((o) => (
            <div className="list-row" key={o.id}>
              <h3>{o.organization.name}</h3>
              <span className="status-badge">{o.role}</span>
            </div>
          ))}
          <form
            className="form-stack"
            style={{ marginTop: 20 }}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              try {
                await post("/organizations", {
                  name: new FormData(form).get("name"),
                });
                form.reset();
                refresh();
                setNotice("Organization created.");
              } catch (e) {
                setNotice((e as Error).message);
              }
            }}
          >
            <label>
              New organization
              <input
                name="name"
                minLength={2}
                maxLength={100}
                required
                placeholder="Your organization name"
              />
            </label>
            <button className="button outline small">
              Create organization <Plus size={14} />
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
function Founder({ page }: { page: string }) {
  const { data: startups } = useResource<any[]>("/founder/startups");
  const [notice, setNotice] = useState("");
  const [campaign, setCampaign] = useState(false);
  if (page === "documents") return <Documents />;
  if (page === "investors")
    return (
      <>
        <Heading
          title="People who share your ambition."
          description="Illustrative investor connections, designed to bring your next conversation into focus."
        />
        <div className="match-grid">
          {[
            [
              "Jordan Lee",
              "Climate & intelligent systems",
              "San Francisco",
              "JL",
            ],
            ["Sofia Chen", "The future of health", "Singapore", "SC"],
            ["Daniel Foster", "Foundational technology", "London", "DF"],
            ["Amara Okafor", "Human-centered innovation", "Berlin", "AO"],
          ].map(([name, thesis, city, initials]) => (
            <section className="panel" key={name}>
              <div className="match-card-head">
                <span
                  className="user-avatar"
                  style={{ width: 48, height: 48, fontSize: 15 }}
                >
                  {initials}
                </span>
                <span className="status-badge green">
                  Illustrative connection
                </span>
              </div>
              <h2 style={{ fontSize: 23 }}>{name}</h2>
              <p style={{ fontSize: 12 }}>
                {thesis}
                <br />
                {city}
              </p>
              <Link href="/messages" className="text-link">
                Open demo conversation
                <ArrowUpRight size={15} />
              </Link>
            </section>
          ))}
        </div>
      </>
    );
  if (page === "startup")
    return (
      <>
        <Heading
          title="Tell the story only you can tell."
          description="Shape your startup’s first impression. This form saves a design preview in this browser."
        />
        <section className="panel workspace-form">
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem(
                "venturex-preview:founder-profile",
                JSON.stringify(
                  Object.fromEntries(new FormData(e.currentTarget)),
                ),
              );
              setNotice("Your profile preview has been saved in this browser.");
            }}
          >
            <div className="form-grid">
              <label>
                Startup name
                <input
                  name="name"
                  defaultValue="Lumina AI"
                  required
                  minLength={2}
                />
              </label>
              <label>
                Industry
                <select name="sector">
                  <option>AI & Machine Learning</option>
                  <option>Climate Tech</option>
                  <option>Fintech</option>
                  <option>Healthtech</option>
                </select>
              </label>
              <label>
                Location
                <input
                  name="location"
                  defaultValue="San Francisco, United States"
                  required
                />
              </label>
              <label>
                Stage
                <select name="stage">
                  <option>Seed</option>
                  <option>Pre-seed</option>
                  <option>Series A</option>
                </select>
              </label>
              <label className="full">
                The idea, in a sentence
                <textarea
                  name="description"
                  defaultValue="Intelligence that turns complex business data into clear decisions."
                  required
                  minLength={20}
                />
              </label>
            </div>
            <button className="button primary">
              Save profile preview
              <Check size={15} />
            </button>
            {notice && (
              <p className="notice-inline" role="status">
                {notice}
              </p>
            )}
          </form>
        </section>
      </>
    );
  return (
    <>
      <Heading
        title={
          page === "fundraising"
            ? "Give your next chapter momentum."
            : page === "analytics"
              ? "See how your story resonates."
              : "Build boldly. Raise thoughtfully."
        }
        description="Your fictional fundraising command center. Every metric below is illustrative."
      >
        <Link className="button primary small" href="/founder/startup">
          Edit startup profile
          <ArrowUpRight size={14} />
        </Link>
      </Heading>
      <div className="kpi-grid">
        <KPI
          label="Demo fundraising target"
          value="$2.5M"
          note="Seed round · illustrative"
          icon={Target}
        />
        <KPI
          label="Demo funding progress"
          value="75%"
          note="$1.875M illustrative amount"
          icon={TrendingUp}
        />
        <KPI
          label="Illustrative profile views"
          value="1,284"
          note="Sample engagement metric"
          icon={Users}
        />
        <KPI
          label="Demo conversations"
          value="12"
          note="Illustrative founder activity"
          icon={MessageSquare}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Fundraising momentum</h2>
            <span>ILLUSTRATIVE PROGRESSION</span>
          </div>
          <PortfolioChart value={1875000} />
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>Your next milestones</h2>
            <span>PREVIEW CHECKLIST</span>
          </div>
          {[
            "Complete the startup story",
            "Prepare the pitch deck",
            "Review financial documents",
            "Schedule founder conversations",
          ].map((s, i) => (
            <label
              className="check-chip"
              key={s}
              style={{ marginBottom: 12, padding: 14 }}
            >
              <input type="checkbox" defaultChecked={i < 2} />
              {s}
            </label>
          ))}
          <Link
            className="text-link"
            href="/founder/documents"
            style={{ marginTop: 15 }}
          >
            Open document workspace
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      <section className="panel">
        <div className="panel-header">
          <h2>{startups?.[0]?.name || "Lumina AI"} · A vision taking shape</h2>
          <span className="status-badge">SEED · DEMO</span>
        </div>
        <p style={{ fontSize: 12 }}>
          A clear story, thoughtful milestones, and meaningful relationships.
          Bring the pieces of your next raise together.
        </p>
        <div className="row-actions">
          <button
            className="button primary small"
            onClick={() => setCampaign(!campaign)}
          >
            {campaign ? "Close campaign form" : "Draft a campaign"}
            <Plus size={14} />
          </button>
          <Link href="/founder/investors" className="button outline small">
            Explore connections
            <ArrowUpRight size={14} />
          </Link>
        </div>
        {campaign && (
          <form
            className="form-stack"
            style={{ marginTop: 25, maxWidth: 500 }}
            onSubmit={(e) => {
              e.preventDefault();
              setNotice("Campaign draft saved as a frontend preview.");
              setCampaign(false);
            }}
          >
            <label>
              Campaign title
              <input
                required
                name="title"
                placeholder="Our next chapter"
                minLength={3}
              />
            </label>
            <label>
              Illustrative target (USD)
              <input
                required
                name="target"
                type="number"
                min={1000}
                defaultValue={2500000}
              />
            </label>
            <button className="button primary">Save draft preview</button>
          </form>
        )}
        {notice && (
          <p role="status" className="notice-inline">
            {notice}
          </p>
        )}
      </section>
    </>
  );
}
function Documents() {
  const { data, refresh } = useResource<any[]>("/documents");
  const [notice, setNotice] = useState("");
  return (
    <>
      <Heading
        title="A considered space for your story."
        description="Preview a document library. Files stay on your device; no upload or secure storage service is connected."
      />
      <section className="panel">
        <div className="panel-header">
          <h2>Document library</h2>
          <span>LOCAL PREVIEW ONLY</span>
        </div>
        <label
          className="empty"
          style={{ cursor: "pointer", display: "block" }}
        >
          <Upload size={30} />
          <h3>Give your vision some context.</h3>
          <p>Select a file to preview its name and size in the library.</p>
          <input
            type="file"
            accept=".pdf,.txt,.pptx,.xlsx"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await post("/documents", { name: file.name, size: file.size });
              refresh();
              setNotice(
                "File metadata added to this browser preview. The file itself has not been uploaded.",
              );
            }}
          />
        </label>
        {data?.map((d) => (
          <div className="list-row" key={d.id}>
            <FolderLock size={18} />
            <div style={{ flex: 1 }}>
              <h3>{d.name}</h3>
              <p>{(d.size / 1024).toFixed(1)} KB · Local preview</p>
            </div>
            <span className="status-badge">Metadata only</span>
          </div>
        ))}
        {notice && (
          <p className="notice-inline" role="status">
            {notice}
          </p>
        )}
      </section>
    </>
  );
}
function Projects({ create, funding }: { create: boolean; funding: boolean }) {
  const { data, error, refresh } = useResource<any[]>("/projects");
  const [notice, setNotice] = useState("");
  return (
    <>
      <Heading
        title={
          create
            ? "Every extraordinary thing starts somewhere."
            : funding
              ? "Give your idea room to grow."
              : "Your idea. Its next chapter."
        }
        description="A space for early ideas and project milestones. Funding requests are illustrative and distinct from investment offerings."
      />
      {create ? (
        <section className="panel workspace-form">
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget,
                f = new FormData(form);
              await post("/projects", {
                name: f.get("name"),
                description: f.get("description"),
                fundingRequest: Number(f.get("fundingRequest")),
                milestones: String(f.get("milestones"))
                  .split("\n")
                  .filter(Boolean),
              });
              form.reset();
              refresh();
              setNotice("Project preview saved in this browser.");
            }}
          >
            <label>
              Project name
              <input
                name="name"
                required
                minLength={3}
                maxLength={120}
                placeholder="An idea worth building"
              />
            </label>
            <label>
              The vision
              <textarea
                name="description"
                required
                minLength={20}
                placeholder="What problem do you want to solve, and for whom?"
              />
            </label>
            <label>
              Illustrative funding request (USD)
              <input
                name="fundingRequest"
                type="number"
                required
                min={100}
                max={100000000}
              />
            </label>
            <label>
              Milestones — one per line
              <textarea
                name="milestones"
                placeholder="Validate the problem&#10;Build the first prototype&#10;Share with early users"
              />
            </label>
            <button className="button primary">
              Create project preview
              <ArrowUpRight size={15} />
            </button>
            {notice && (
              <p className="notice-inline" role="status">
                {notice}
                <Link href="/projects/dashboard"> View projects →</Link>
              </p>
            )}
          </form>
        </section>
      ) : (
        <>
          <div className="kpi-grid">
            <KPI
              label="Your project previews"
              value={String(data?.length || 0)}
              note="Saved in this browser"
              icon={Building2}
            />
            <KPI
              label="Illustrative funding requests"
              value={money(
                data?.reduce((n, p) => n + p.fundingRequest, 0) || 0,
              )}
              note="Not investment offerings"
              icon={Target}
            />
            <KPI
              label="Planned milestones"
              value={String(
                data?.reduce((n, p) => n + p.milestones.length, 0) || 0,
              )}
              note="Steps toward your vision"
              icon={TrendingUp}
            />
            <KPI
              label="Your next step"
              value="Create"
              note="Make the possibility tangible"
              icon={Plus}
            />
          </div>
          <ErrorMessage error={error} />
          {data?.length ? (
            <div className="match-grid">
              {data.map((p) => (
                <section className="panel" key={p.id}>
                  <span className="status-badge">PROJECT PREVIEW</span>
                  <h2 style={{ fontSize: 24, marginTop: 20 }}>{p.name}</h2>
                  <p style={{ fontSize: 12 }}>{p.description}</p>
                  <div className="terms">
                    <span>Illustrative request</span>
                    <strong>{money(p.fundingRequest)}</strong>
                  </div>
                  {p.milestones.map((m: string) => (
                    <label
                      key={m}
                      className="check-chip"
                      style={{ marginTop: 10 }}
                    >
                      <input type="checkbox" />
                      {m}
                    </label>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <Empty
              title="An open space for your next idea."
              text="Give your project a name, a purpose, and a few milestones. The first step is yours."
              href="/projects/create"
              label="Create your first project"
            />
          )}
        </>
      )}
    </>
  );
}
function Admin({ page }: { page: string }) {
  const activity = [
    ["09:42", "Profile review queued", "Lumina AI", "REVIEW"],
    ["09:18", "Document access logged", "Verdant Energy", "AUDIT"],
    ["08:56", "Startup profile updated", "Orbit Finance", "CONTENT"],
    ["08:31", "Verification request opened", "Demo founder", "TRUST"],
  ];
  return (
    <>
      <Heading
        title="A thoughtful view of the ecosystem."
        description="Administration is a visual preview. No production accounts or moderation services are connected."
      />
      <div className="kpi-grid">
        <KPI
          label="Fictional startups"
          value="12"
          note="Curated demo profiles"
          icon={Building2}
        />
        <KPI
          label="Illustrative members"
          value="4"
          note="Preview personas"
          icon={Users}
        />
        <KPI
          label="Verification approvals"
          value="0"
          note="No identity provider connected"
          icon={ShieldCheck}
        />
        <KPI
          label="Current section"
          value={page === "dashboard" ? "Overview" : "Review"}
          note="Frontend design preview"
          icon={FileClock}
        />
      </div>
      <div className="admin-control-grid">
        <section className="panel admin-radar-panel">
          <div className="panel-header">
            <h2>Ecosystem pulse</h2>
            <span>FICTIONAL LIVE VIEW</span>
          </div>
          <div
            className="admin-radar"
            aria-label="Illustrative ecosystem activity radar"
          >
            <i className="admin-sweep" />
            <span className="admin-orbit orbit-a" />
            <span className="admin-orbit orbit-b" />
            {[
              ["Profiles", "12", "node-a"],
              ["Requests", "04", "node-b"],
              ["Documents", "18", "node-c"],
              ["Alerts", "00", "node-d"],
            ].map(([label, value, className]) => (
              <span className={`admin-node ${className}`} key={label}>
                <strong>{value}</strong>
                <small>{label}</small>
              </span>
            ))}
            <span className="admin-radar-core">
              <ShieldCheck size={24} />
              <small>
                ALL SYSTEMS
                <br />
                PREVIEW ONLY
              </small>
            </span>
          </div>
        </section>
        <section className="panel admin-activity-panel">
          <div className="panel-header">
            <h2>Operational activity</h2>
            <span>LOCAL DEMO EVENTS</span>
          </div>
          <div className="admin-activity-feed">
            {activity.map(([time, action, entity, type], index) => (
              <div
                className="admin-event"
                key={time}
                style={
                  { "--event-delay": `${index * 90}ms` } as React.CSSProperties
                }
              >
                <time>{time}</time>
                <span>
                  <strong>{action}</strong>
                  <small>{entity}</small>
                </span>
                <i>{type}</i>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel admin-review-strip">
        <div>
          <span className="live-dot" />
          <small>CURRENT MODE</small>
          <strong>
            {page === "dashboard"
              ? "System overview"
              : page.replaceAll("-", " ")}
          </strong>
        </div>
        <div>
          <small>AUTOMATION</small>
          <strong>Paused in preview</strong>
        </div>
        <div>
          <small>IDENTITY PROVIDER</small>
          <strong>Not connected</strong>
        </div>
        <div>
          <small>NEXT REVIEW</small>
          <strong>Manual operator action</strong>
        </div>
      </section>
      <p className="form-note admin-preview-note">
        Administrative controls are an interface preview. No production
        moderation, verification, or account actions are performed.
      </p>
    </>
  );
}
