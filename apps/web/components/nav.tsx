"use client";
import Link from "next/link";
import { useState } from "react";
import { MotionToggle } from "./motion-system";
import { ArrowUpRight, Menu, X } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Venturex home">
      <span className="brand-mark">
        V<span>╱</span>
      </span>
      VENTURE<span className="brand-x">X</span>
    </Link>
  );
}
export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav-shell">
      <nav className="nav container">
        <Brand />
        <div className={"nav-links " + (open ? "open" : "")}>
          <Link href="/marketplace">Discover startups</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">Our vision</Link>
          <Link href="/matching">
            Smart matching <span className="tiny-tag">NEW</span>
          </Link>
        </div>
        <div className="nav-actions">
          <MotionToggle />
          <Link href="/investor/dashboard" className="login-link">
            Workspace
          </Link>
          <Link className="button small primary" href="/register">
            Get started <ArrowUpRight size={15} />
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            className="menu-toggle"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="container footer">
      <div>
        <Brand />
        <p>Extraordinary ideas. Meaningful connections.</p>
        <small>Fictional demonstration. No securities are offered.</small>
      </div>
      <div>
        <Link href="/marketplace">Discover</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/about">About us</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <span>© {new Date().getFullYear()} VENTUREX</span>
    </footer>
  );
}
