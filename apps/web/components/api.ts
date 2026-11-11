// Frontend-only demonstration adapter. No network requests, backend, or database.
// Browser storage contains illustrative UI records only; never passwords or tokens.
import { demoStartups } from "../../../packages/shared/src/demo";
import { compatibility } from "../../../packages/shared/src";
const defaultUser = {
  id: "preview-investor",
  name: "Jordan Lee",
  email: "jordan@example.demo",
  role: "INVESTOR",
};
const defaults: Record<string, any> = {
  user: defaultUser,
  watchlist: [
    { id: "saved-1", startupId: "demo-1", startup: demoStartups[0] },
    { id: "saved-2", startupId: "demo-2", startup: demoStartups[1] },
  ],
  preferences: {
    sectors: ["AI & Machine Learning", "Climate Tech"],
    countries: [],
    stages: ["Seed"],
    budget: 100000,
    risk: "Balanced",
    thesis: "Backing thoughtful technology that creates meaningful progress.",
  },
  deals: [
    {
      id: "deal-1",
      startup: demoStartups[0],
      stage: "DUE_DILIGENCE",
      notes: "Review the product roadmap and meet the founding team.",
      checklist: [],
    },
    {
      id: "deal-2",
      startup: demoStartups[1],
      stage: "REVIEW",
      notes: "Explore the energy storage opportunity.",
      checklist: [],
    },
    {
      id: "deal-3",
      startup: demoStartups[2],
      stage: "INTEREST",
      notes: "A promising financial infrastructure concept.",
      checklist: [],
    },
  ],
  projects: [],
  organizations: [],
  documents: [],
  meetings: [
    {
      id: "meet-1",
      title: "Lumina AI · Founder introduction",
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      status: "PLANNED",
    },
    {
      id: "meet-2",
      title: "Verdant Energy · Product walkthrough",
      startsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      status: "PLANNED",
    },
  ],
  notifications: [
    {
      id: "n-1",
      body: "Your next chapter is ready. Explore your VENTUREX preview workspace.",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-2",
      body: "Lumina AI is now in your illustrative due diligence pipeline.",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  messages: [
    {
      id: "msg-1",
      senderId: "preview-founder",
      sender: { id: "preview-founder", name: "Alex Morgan" },
      body: "Hi Jordan! Thanks for taking a closer look at Lumina. I’d love to share the vision behind what we’re building.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "msg-2",
      senderId: "preview-investor",
      sender: { id: "preview-investor", name: "Jordan Lee" },
      body: "Great to connect, Alex. Your approach to making complex data accessible really resonates with my thesis.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
};
function get(key: string): any {
  try {
    const value = localStorage.getItem("venturex-preview:" + key);
    return value ? JSON.parse(value) : structuredClone(defaults[key] ?? []);
  } catch {
    return structuredClone(defaults[key] ?? []);
  }
}
function set(key: string, value: unknown) {
  try {
    localStorage.setItem("venturex-preview:" + key, JSON.stringify(value));
  } catch {
    /* Browser storage can be unavailable in private environments. */
  }
  return value;
}
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = new URL(path, "http://preview.local"),
    route = url.pathname,
    method = options.method || "GET";
  const body = options.body ? JSON.parse(String(options.body)) : {};
  const id = () => crypto.randomUUID();
  let result: any;
  if (route === "/auth/me") result = get("user");
  else if (route === "/auth/login" || route === "/auth/register") {
    const role =
      body.role ||
      (String(body.email).includes("founder") ? "FOUNDER" : "INVESTOR");
    result = set("user", {
      ...defaultUser,
      role,
      name: body.name || (role === "FOUNDER" ? "Alex Morgan" : "Jordan Lee"),
    });
  } else if (route === "/auth/logout") {
    result = { ok: true };
  } else if (route === "/auth/forgot")
    result = {
      message:
        "Frontend preview: no email is sent. You can explore directly using a demo account.",
    };
  else if (route === "/startups") {
    let items = [...demoStartups];
    for (const key of ["sector", "country", "stage", "instrument"]) {
      const val = url.searchParams.get(key);
      if (val) items = items.filter((s) => s[key as keyof typeof s] === val);
    }
    const search = url.searchParams.get("search")?.toLowerCase();
    if (search)
      items = items.filter((s) =>
        (s.name + " " + s.description).toLowerCase().includes(search),
      );
    const max = Number(url.searchParams.get("max"));
    if (max) items = items.filter((s) => s.target <= max);
    const sort = url.searchParams.get("sort");
    if (sort === "target") items.sort((a, b) => a.target - b.target);
    if (sort === "raised") items.sort((a, b) => b.raised - a.raised);
    if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));
    const total = items.length,
      page = Number(url.searchParams.get("page") || 1),
      limit = Number(url.searchParams.get("limit") || 12);
    result = {
      items: items.slice((page - 1) * limit, page * limit),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } else if (route.startsWith("/startups/")) {
    result = demoStartups.find((s) => s.slug === route.split("/")[2]);
    if (!result) throw new Error("This startup could not be found");
  } else if (route === "/watchlist") result = get("watchlist");
  else if (route.startsWith("/watchlist/")) {
    const startupId = route.split("/")[2];
    let saved = get("watchlist");
    if (method === "DELETE")
      saved = saved.filter((w: any) => w.startupId !== startupId);
    else if (!saved.some((w: any) => w.startupId === startupId))
      saved.push({
        id: id(),
        startupId,
        startup: demoStartups.find((s) => s.id === startupId),
      });
    result = set("watchlist", saved);
  } else if (route === "/preferences")
    result = method === "POST" ? set("preferences", body) : get("preferences");
  else if (route === "/matching")
    result = demoStartups
      .map((s) => ({ ...s, match: compatibility(s, get("preferences")) }))
      .sort((a, b) => b.match.score - a.match.score);
  else if (route === "/portfolio")
    result = demoStartups
      .slice(0, 4)
      .map((s, i) => ({
        id: s.id,
        startup: s,
        invested: 25000 * (i + 1),
        value: 30000 * (i + 1),
        simulated: true,
      }));
  else if (route === "/deals") {
    if (method === "POST") {
      const deals = get("deals");
      const existing = deals.find((d: any) => d.startup.id === body.startupId);
      if (existing) result = existing;
      else {
        result = {
          id: id(),
          startup: demoStartups.find((s) => s.id === body.startupId),
          stage: "INTEREST",
          notes: "",
          checklist: [],
        };
        set("deals", [...deals, result]);
      }
    } else result = get("deals");
  } else if (route.startsWith("/deals/")) {
    const deals = get("deals").map((d: any) =>
      d.id === route.split("/")[2] ? { ...d, ...body } : d,
    );
    set("deals", deals);
    result = { ok: true };
  } else if (route === "/conversations")
    result =
      method === "POST"
        ? { id: "conversation-1" }
        : [
            {
              id: "conversation-1",
              members: [
                { user: get("user") },
                {
                  user: {
                    id: "preview-founder",
                    name: "Alex Morgan",
                    role: "FOUNDER",
                  },
                },
              ],
              messages: get("messages").slice(-1),
            },
          ];
  else if (route.includes("/messages")) {
    if (method === "POST") {
      result = {
        id: id(),
        senderId: get("user").id,
        sender: get("user"),
        body: body.body,
        createdAt: new Date().toISOString(),
      };
      set("messages", [...get("messages"), result]);
    } else result = get("messages");
  } else if (
    route === "/projects" ||
    route === "/meetings" ||
    route === "/organizations" ||
    route === "/documents"
  ) {
    const key = route.slice(1);
    if (method === "POST") {
      result = {
        id: id(),
        ...body,
        createdAt: new Date().toISOString(),
        ...(key === "organizations"
          ? { organization: { name: body.name }, role: "OWNER" }
          : {}),
      };
      set(key, [...get(key), result]);
    } else result = get(key);
  } else if (route.startsWith("/meetings/"))
    result = set(
      "meetings",
      get("meetings").filter((m: any) => m.id !== route.split("/")[2]),
    );
  else if (route === "/notifications") result = get("notifications");
  else if (route.startsWith("/notifications/"))
    result = set(
      "notifications",
      get("notifications").map((n: any) =>
        n.id === route.split("/")[2] ? { ...n, read: true } : n,
      ),
    );
  else if (route === "/profile")
    result = set("user", { ...get("user"), ...body });
  else if (route === "/verifications") result = { status: "PREVIEW_ONLY" };
  else if (route === "/founder/startups") result = demoStartups.slice(0, 1);
  else if (route.startsWith("/admin")) result = [];
  else result = { ok: true };
  return result as T;
}
export const post = <T = any>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });
