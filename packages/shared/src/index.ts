import { z } from "zod";
export const roles = ["INVESTOR", "FOUNDER", "PROJECT_OWNER", "ADMIN"] as const;
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().max(254),
  password: z.string().min(12).max(128),
  role: z.enum(["INVESTOR", "FOUNDER", "PROJECT_OWNER"]),
});
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});
export const preferencesSchema = z.object({
  sectors: z.array(z.string()).max(20),
  countries: z.array(z.string()).max(30),
  stages: z.array(z.string()).max(10),
  budget: z.number().positive().max(100000000),
  risk: z.enum(["Conservative", "Balanced", "Ambitious"]),
  thesis: z.string().max(2000),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export type StartupData = {
  id: string;
  slug: string;
  name: string;
  sector: string;
  country: string;
  city: string;
  stage: string;
  description: string;
  target: number;
  raised: number;
  instrument: string;
  growth: number;
  color: string;
  symbol: string;
};
export function compatibility(startup: StartupData, preferences: Preferences) {
  const factors: string[] = [];
  const mismatches: string[] = [];
  let score = 20;
  if (
    !preferences.sectors.length ||
    preferences.sectors.includes(startup.sector)
  ) {
    score += 30;
    factors.push("Sector aligns with your interests");
  } else mismatches.push("Outside your preferred sectors");
  if (
    !preferences.countries.length ||
    preferences.countries.includes(startup.country)
  ) {
    score += 15;
    factors.push("Within your geographic focus");
  } else mismatches.push("Outside your geographic focus");
  if (
    !preferences.stages.length ||
    preferences.stages.includes(startup.stage)
  ) {
    score += 20;
    factors.push("Matches your preferred funding stage");
  } else mismatches.push("Different funding stage");
  if (preferences.budget >= startup.target * 0.01) {
    score += 15;
    factors.push("Budget meets illustrative 1% allocation");
  } else mismatches.push("Budget below illustrative allocation");
  return {
    score,
    factors,
    mismatches,
    explanation:
      "Rules-based profile compatibility only. Does not predict returns or investment success. Risk tolerance and thesis are stored for future review and do not affect this score.",
  };
}
export const money = (n: number) =>
  n >= 1000000
    ? "$" + (n / 1000000).toFixed(1) + "M"
    : "$" + (n / 1000).toFixed(0) + "K";
