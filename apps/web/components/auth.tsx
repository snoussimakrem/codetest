"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight } from "lucide-react";
import { Nav } from "./nav";
import { post } from "./api";
import { registerSchema, loginSchema } from "../../../packages/shared/src";
import { PageAtmosphere } from "./page-atmosphere";
export default function Auth({
  mode,
}: {
  mode: "login" | "register" | "forgot-password";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const schema =
    mode === "register"
      ? registerSchema
      : mode === "login"
        ? loginSchema
        : z.object({ email: z.email() });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      role: params.get("role") === "FOUNDER" ? "FOUNDER" : "INVESTOR",
    },
  });
  async function submit(values: any) {
    setError("");
    try {
      const result = await post(
        "/auth/" + (mode === "forgot-password" ? "forgot" : mode),
        values,
      );
      if (mode === "forgot-password") setNotice(result.message);
      else
        router.push(
          mode === "register"
            ? "/onboarding"
            : result.role === "FOUNDER"
              ? "/founder/dashboard"
              : result.role === "PROJECT_OWNER"
                ? "/projects/dashboard"
                : result.role === "ADMIN"
                  ? "/admin/dashboard"
                  : "/investor/dashboard",
        );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function demo(role: string) {
    await submit({
      email: role + "@venturex.demo",
      password: "VentureX-demo-2026!",
    });
  }
  return (
    <>
      <Nav />
      <main className="auth-layout public-page auth-page">
        <aside className="auth-aside">
          <PageAtmosphere compact />
          <div className="auth-art">✳</div>
          <div className="eyebrow">FOR THE PEOPLE BUILDING TOMORROW</div>
          <h2 style={{ marginTop: 25 }}>
            Extraordinary
            <br />
            starts with
            <br />
            <span>a connection.</span>
          </h2>
          <p>
            A space for bold ideas, shared ambition, and meaningful progress.
          </p>
          <small className="muted-text">
            Fictional demonstration ecosystem · No securities offered
          </small>
        </aside>
        <section className="auth-form">
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            YOUR NEXT CHAPTER
          </div>
          <h1>
            {mode === "login"
              ? "Welcome back."
              : mode === "register"
                ? "A world of possibility awaits."
                : "Let’s get you back in."}
          </h1>
          <p>
            {mode === "login"
              ? "Explore your VENTUREX frontend preview. No real authentication is connected."
              : mode === "register"
                ? "Choose a preview persona and explore the frontend. No account is created."
                : "Request a link to reset your password."}
          </p>
          <form className="form-stack" onSubmit={handleSubmit(submit)}>
            {mode === "register" && (
              <label>
                Full name
                <input autoComplete="name" {...register("name")} />
                {errors.name && (
                  <span className="error-text">
                    {String(errors.name.message)}
                  </span>
                )}
              </label>
            )}
            <label>
              Email address
              <input type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <span className="error-text">
                  {String(errors.email.message)}
                </span>
              )}
            </label>
            {mode !== "forgot-password" && (
              <label>
                Password
                <input
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  {...register("password")}
                />
                {errors.password && (
                  <span className="error-text">
                    {String(errors.password.message)}
                  </span>
                )}
                {mode === "register" && (
                  <span className="form-note">Use at least 12 characters.</span>
                )}
              </label>
            )}
            {mode === "register" && (
              <label>
                I’m here as
                <select {...register("role")}>
                  <option value="INVESTOR">
                    An investor — discover opportunities
                  </option>
                  <option value="FOUNDER">
                    A founder — build my startup story
                  </option>
                  <option value="PROJECT_OWNER">
                    A project owner — bring an idea to life
                  </option>
                </select>
              </label>
            )}
            {mode === "login" && (
              <Link className="text-link" href="/forgot-password">
                Forgot password?
              </Link>
            )}
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            {notice && (
              <div className="success-box" role="status">
                {notice}
              </div>
            )}
            <button className="button primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : mode === "register"
                    ? "Create account"
                    : "Request reset"}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <p className="form-note">
            {mode === "login" ? (
              <>
                New to the ecosystem?{" "}
                <Link href="/register">Create an account</Link>
              </>
            ) : (
              <>
                Already have an account? <Link href="/login">Sign in</Link>
              </>
            )}
          </p>
          {mode === "login" && (
            <div className="demo-login">
              <strong>Take a look around.</strong>
              <p>
                Use a seeded demonstration account. All portfolio figures are
                simulated. No password is stored.
              </p>
              <div className="row-actions">
                <button
                  className="button outline small"
                  onClick={() => demo("investor")}
                >
                  Demo investor
                </button>
                <button
                  className="button outline small"
                  onClick={() => demo("founder")}
                >
                  Demo founder
                </button>
              </div>
            </div>
          )}
          {mode === "forgot-password" && (
            <p className="form-note">
              Frontend preview only. No account recovery or email service is
              connected.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
