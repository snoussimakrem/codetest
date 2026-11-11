import { test, expect } from "@playwright/test";
test("landing renders, navigation works, and mobile fits", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Where Vision Meets Capital." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Explore investment opportunities",
      exact: true,
    }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("marketplace filters and compares fictional startups", async ({
  page,
}) => {
  await page.goto("/marketplace");
  await expect(page.getByText("12 opportunities")).toBeVisible();
  await page
    .getByPlaceholder("Search companies, ideas, possibilities…")
    .fill("Lumina");
  await expect(page.getByText("1 opportunities")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Lumina AI", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.getByText("12 opportunities")).toBeVisible();
  await page
    .getByRole("button", { name: "Compare Lumina AI", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare Verdant Energy", exact: true })
    .click();
  await page.getByRole("button", { name: "Compare side by side" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
test("frontend workspace and local project form work without a backend", async ({
  page,
}) => {
  await page.goto("/investor/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Jordan." }),
  ).toBeVisible();
  await expect(page.getByText("$250K", { exact: true })).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "venturex-preview:user",
      JSON.stringify({
        id: "preview-owner",
        name: "Jordan Lee",
        email: "jordan@example.demo",
        role: "PROJECT_OWNER",
      }),
    ),
  );
  await page.goto("/projects/create");
  await page.getByLabel("Project name").fill("Design preview project");
  await page
    .getByLabel("The vision")
    .fill(
      "An illustrative project for testing a beautiful frontend experience.",
    );
  await page.getByLabel("Illustrative funding request (USD)").fill("5000");
  await page.getByRole("button", { name: "Create project preview" }).click();
  await expect(page.getByRole("status")).toContainText("Project preview saved");
});

test("sector radar and motion controls work with keyboard and reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.locator(".signal-panel");
  await panel.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Climate 02", exact: true }).click();
  await expect(
    panel.getByRole("heading", { name: "Verdant Energy", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore Finance", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    panel.getByRole("heading", { name: "Orbit Finance", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Pause animations", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator(".ticker-track")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page
    .getByRole("button", { name: "Resume animations", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playing");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page
    .getByRole("button", { name: "Intelligence 01", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "Lumina AI", exact: true }),
  ).toBeVisible();
});

test("role workspaces have separate identities and navigation", async ({
  page,
}) => {
  const roles = [
    ["/investor/dashboard", "Capital Observatory", "workspace-role-investor"],
    ["/founder/dashboard", "Founder Studio", "workspace-role-founder"],
    ["/projects/dashboard", "Project Lab", "workspace-role-project-owner"],
    ["/admin/dashboard", "Ecosystem Control", "workspace-role-admin"],
  ] as const;

  for (const [path, name, className] of roles) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".dashboard-shell")).toHaveClass(
      new RegExp(className),
    );
    await expect(
      page.locator('.workspace-switcher [aria-current="page"]'),
    ).toContainText(name);
    if (path === "/founder/dashboard")
      await page.screenshot({ path: "/tmp/venturex-founder-workspace.png" });
  }

  await expect(
    page.getByRole("heading", { name: "Ecosystem pulse" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Operational activity" }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/venturex-admin-workspace.png" });
});

test("the atmospheric design system is present across every public page type", async ({
  page,
}) => {
  const routes = [
    ["/marketplace", "marketplace-page"],
    ["/startups/lumina-ai", "startup-detail-page"],
    ["/login", "auth-page"],
    ["/about", "story-page"],
    ["/how-it-works", "story-page"],
    ["/contact", "story-page"],
  ] as const;

  for (const [route, pageClass] of routes) {
    await page.goto(route);
    await expect(page.locator(`main.${pageClass}`)).toBeVisible();
    await expect(page.locator(".page-atmosphere")).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.setViewportSize({ width: 1280, height: 800 });
  }
});

test("registration keeps a balanced split layout and contained artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/register");

  const layout = await page.evaluate(() => {
    const aside = document.querySelector<HTMLElement>(".auth-aside")!;
    const form = document.querySelector<HTMLElement>(".auth-form")!;
    const art = document.querySelector<HTMLElement>(".auth-art")!;
    const asideRect = aside.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    const rightColumnWidth = window.innerWidth - asideRect.right;
    return {
      formWidth: formRect.width,
      artWidth: art.getBoundingClientRect().width,
      leftGap: formRect.left - asideRect.right,
      rightGap:
        rightColumnWidth - formRect.width - (formRect.left - asideRect.right),
    };
  });

  expect(layout.formWidth).toBeGreaterThanOrEqual(500);
  expect(layout.artWidth).toBeLessThanOrEqual(110);
  expect(Math.abs(layout.leftGap - layout.rightGap)).toBeLessThan(3);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await expect(page.locator(".auth-form")).toBeVisible();
});
