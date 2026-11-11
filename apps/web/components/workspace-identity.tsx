"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  ShieldCheck,
  Telescope,
} from "lucide-react";
import { useMotionPreference } from "./motion-system";

export type WorkspaceRole = "INVESTOR" | "FOUNDER" | "PROJECT_OWNER" | "ADMIN";

export const workspaceIdentity = {
  INVESTOR: {
    name: "Capital Observatory",
    eyebrow: "INVESTOR WORKSPACE / PRIVATE MARKETS",
    description:
      "See conviction, exposure, and opportunity in one calm field of view.",
    accent: "#f1e5bf",
    icon: Telescope,
    metric: "$300K",
    metricLabel: "SIMULATED PORTFOLIO VALUE",
  },
  FOUNDER: {
    name: "Founder Studio",
    eyebrow: "FOUNDER WORKSPACE / STORY & MOMENTUM",
    description:
      "Shape the story, prepare the raise, and keep every relationship moving.",
    accent: "#e8aa8c",
    icon: Building2,
    metric: "75%",
    metricLabel: "ILLUSTRATIVE ROUND PROGRESS",
  },
  PROJECT_OWNER: {
    name: "Project Lab",
    eyebrow: "PROJECT WORKSPACE / FROM IDEA TO PROOF",
    description:
      "Turn an early idea into a considered plan with visible, achievable milestones.",
    accent: "#e6d29d",
    icon: FolderKanban,
    metric: "03",
    metricLabel: "STEPS TO YOUR NEXT MILESTONE",
  },
  ADMIN: {
    name: "Ecosystem Control",
    eyebrow: "ADMIN WORKSPACE / TRUST & OPERATIONS",
    description:
      "Monitor the fictional ecosystem with clarity, context, and an auditable trail.",
    accent: "#a9cec4",
    icon: ShieldCheck,
    metric: "100%",
    metricLabel: "DEMO SYSTEM VISIBILITY",
  },
} as const;

export function WorkspaceMasthead({ role }: { role: WorkspaceRole }) {
  const identity = workspaceIdentity[role];
  const { paused } = useMotionPreference();
  const Icon = identity.icon;

  return (
    <section
      className="workspace-masthead"
      style={{ "--role-accent": identity.accent } as React.CSSProperties}
    >
      <div className="workspace-clouds" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="workspace-masthead-copy">
        <motion.div
          className="workspace-masthead-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: paused ? 0 : 0.5 }}
        >
          <Icon size={19} />
        </motion.div>
        <span className="workspace-kicker">{identity.eyebrow}</span>
        <motion.h1
          initial={{ opacity: 0, y: paused ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: paused ? 0 : 0.65 }}
        >
          {identity.name}
        </motion.h1>
        <p>{identity.description}</p>
      </div>
      <div className="workspace-curve" aria-hidden="true">
        <svg viewBox="0 0 720 210" preserveAspectRatio="none">
          <motion.path
            d="M-20 154 C 75 151, 116 190, 203 160 S 322 76, 408 107 S 533 137, 590 73 S 690 41, 750 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: paused ? 0 : 1.8, ease: "easeInOut" }}
          />
          {[
            { x: 203, y: 160 },
            { x: 408, y: 107 },
            { x: 590, y: 73 },
          ].map((point, index) => (
            <motion.g
              key={point.x}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: paused ? 0 : 0.7 + index * 0.25 }}
            >
              <circle cx={point.x} cy={point.y} r="6" fill="currentColor" />
              <circle cx={point.x} cy={point.y} r="2.5" fill="#809a94" />
            </motion.g>
          ))}
        </svg>
        <span className="curve-note curve-note-a">
          SIGNAL FOUND
          <br />
          <strong>+18.4%</strong>
        </span>
        <span className="curve-note curve-note-b">
          MOMENTUM
          <br />
          <strong>ON TRACK</strong>
        </span>
      </div>
      <div className="workspace-masthead-metric">
        <small>{identity.metricLabel}</small>
        <strong>{identity.metric}</strong>
        <span>
          LIVE PREVIEW <ArrowUpRight size={12} />
        </span>
      </div>
    </section>
  );
}

export function WorkspaceSwitcher({ current }: { current: WorkspaceRole }) {
  const destinations = [
    ["INVESTOR", "Investor", "/investor/dashboard"],
    ["FOUNDER", "Founder", "/founder/dashboard"],
    ["PROJECT_OWNER", "Project", "/projects/dashboard"],
    ["ADMIN", "Admin", "/admin/dashboard"],
  ] as const;
  return (
    <div className="workspace-switcher" aria-label="Switch workspace preview">
      {destinations.map(([role, label, href]) => (
        <Link
          key={role}
          href={href}
          aria-current={current === role ? "page" : undefined}
        >
          <span>{label}</span>
          <small>{workspaceIdentity[role].name}</small>
        </Link>
      ))}
    </div>
  );
}

export function HeroPerformanceLine() {
  const { paused } = useMotionPreference();
  return (
    <div className="hero-performance-line" aria-hidden="true">
      <svg viewBox="0 0 1440 420" preserveAspectRatio="none">
        <motion.path
          d="M-60 250 C 120 246, 196 330, 360 294 S 585 173, 704 214 S 866 250, 948 162 S 1110 132, 1490 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: paused ? 0 : 2.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
}
