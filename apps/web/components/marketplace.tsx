"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Nav, Footer } from "./nav";
import { StartupCard } from "./startup-card";
import { api } from "./api";
import { demoStartups } from "../../../packages/shared/src/demo";
import { StartupData, money } from "../../../packages/shared/src";
import { PageAtmosphere } from "./page-atmosphere";
const unique = (key: keyof StartupData) =>
  [...new Set(demoStartups.map((s) => s[key]))].sort() as string[];
export default function Marketplace() {
  const params = useSearchParams();
  const [filters, setFilters] = useState({
    search: "",
    sector: params.get("sector") || "",
    country: "",
    stage: params.get("stage") || "",
    instrument: "",
    max: "",
    sort: params.get("sort") || "featured",
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    items: StartupData[];
    total: number;
    pages: number;
  }>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState<StartupData[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      const q = new URLSearchParams({ page: String(page), limit: "6" });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q.set(k, v);
      });
      api("/startups?" + q)
        .then((d) => {
          if (active) {
            setData(d);
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, page]);
  function change(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function toggleCompare(s: StartupData) {
    setCompare((c) =>
      c.some((v) => v.id === s.id)
        ? c.filter((v) => v.id !== s.id)
        : c.length < 3
          ? [...c, s]
          : c,
    );
  }
  return (
    <>
      <Nav />
      <main className="container page-main public-page marketplace-page">
        <div className="page-heading">
          <PageAtmosphere />
          <div className="eyebrow">
            YOUR NEXT CONNECTION STARTS WITH CURIOSITY
          </div>
          <h1>Discover extraordinary startups.</h1>
          <p>
            Explore ambitious ideas, understand the people behind them, and find
            what aligns with your vision.
          </p>
        </div>
        <div className="demo-banner">
          All listed companies and funding figures are fictional demonstration
          data. No securities are offered.
        </div>
        <div className="market-layout">
          <aside className="filters">
            <h3>
              <SlidersHorizontal
                size={14}
                style={{ display: "inline", marginRight: 8 }}
              />
              Refine your discovery
            </h3>
            {(["sector", "country", "stage", "instrument"] as const).map(
              (k) => (
                <label key={k}>
                  {
                    {
                      sector: "Industry",
                      country: "Country",
                      stage: "Funding stage",
                      instrument: "Investment structure",
                    }[k]
                  }
                  <select
                    value={filters[k]}
                    onChange={(e) => change(k, e.target.value)}
                  >
                    <option value="">
                      All{" "}
                      {k === "sector"
                        ? "industries"
                        : k === "country"
                          ? "countries"
                          : k + "s"}
                    </option>
                    {unique(k).map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              ),
            )}
            <label>
              Maximum funding target
              <select
                value={filters.max}
                onChange={(e) => change("max", e.target.value)}
              >
                <option value="">Any amount</option>
                <option value="1000000">Up to $1M</option>
                <option value="2500000">Up to $2.5M</option>
                <option value="5000000">Up to $5M</option>
              </select>
            </label>
            <button
              className="button outline small"
              onClick={() => {
                setFilters({
                  search: "",
                  sector: "",
                  country: "",
                  stage: "",
                  instrument: "",
                  max: "",
                  sort: "featured",
                });
                setPage(1);
              }}
            >
              Reset filters
            </button>
          </aside>
          <div>
            <div className="market-search">
              <label className="search-wrap">
                <span className="sr-only">Search startups</span>
                <Search size={16} />
                <input
                  placeholder="Search companies, ideas, possibilities…"
                  value={filters.search}
                  onChange={(e) => change("search", e.target.value)}
                />
              </label>
              <select
                aria-label="Sort startups"
                value={filters.sort}
                onChange={(e) => change("sort", e.target.value)}
              >
                <option value="featured">Featured first</option>
                <option value="raised">Most raised</option>
                <option value="target">Lowest target</option>
                <option value="name">Company A–Z</option>
              </select>
            </div>
            <div className="result-count">
              {data?.total || 0} opportunities · Compare up to 3 startups
            </div>
            {error ? (
              <div className="error-box" role="alert">
                {error}. Check that the API is running.
              </div>
            ) : loading ? (
              <div className="startup-grid market-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div className="skeleton" key={n} />
                ))}
              </div>
            ) : data?.items.length ? (
              <>
                <div className="startup-grid market-grid">
                  {data.items.map((s) => (
                    <StartupCard
                      startup={s}
                      key={s.id}
                      compare={compare.some((v) => v.id === s.id)}
                      onCompare={toggleCompare}
                    />
                  ))}
                </div>
                <div className="pagination">
                  <button
                    className="icon-button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span>
                    Page {page} of {data.pages}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Next page"
                    disabled={page >= data.pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty">
                <Search />
                <h3>A different kind of opportunity?</h3>
                <p>Try broadening your filters to discover more ideas.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      {compare.length > 0 && (
        <div className="compare-tray">
          <span>{compare.length} startups selected</span>
          <button
            className="button primary small"
            disabled={compare.length < 2}
            onClick={() => setShowCompare(true)}
          >
            Compare side by side
          </button>
          <button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setCompare([])}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {showCompare && (
        <div className="modal-overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Startup comparison"
          >
            <div className="modal-header">
              <h2>A closer look, side by side.</h2>
              <button
                className="icon-button"
                aria-label="Close comparison"
                onClick={() => setShowCompare(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Fictional demo data</th>
                    {compare.map((s) => (
                      <th key={s.id}>{s.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      "sector",
                      "country",
                      "stage",
                      "instrument",
                      "target",
                      "raised",
                    ] as const
                  ).map((key) => (
                    <tr key={key}>
                      <td>{key[0].toUpperCase() + key.slice(1)}</td>
                      {compare.map((s) => (
                        <td key={s.id}>
                          {typeof s[key] === "number"
                            ? money(s[key] as number)
                            : s[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
      <Footer />
    </>
  );
}
