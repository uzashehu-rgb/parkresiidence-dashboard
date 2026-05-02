import { createFileRoute } from "@tanstack/react-router";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fieldClass, Field, SubmitButton } from "@/components/dashboard/dashboard-ui";
import { getAuthToken, getSession, login, setAuthToken } from "@/lib/dashboard-api";
import { siteConfig } from "@/lib/site";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: `Login - ${siteConfig.name}` },
      {
        name: "description",
        content: `Qasje e mbrojtur ne dashboard per ${siteConfig.name}.`,
      },
    ],
  }),
});

function isAllowedPath(pathname: string, allowedRoutes: string[]) {
  const normalizedPath = pathname === "/dashboard/" ? "/dashboard" : pathname;

  return allowedRoutes.some((route) => {
    if (route === "/dashboard") return normalizedPath === "/dashboard";
    return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
  });
}

function resolveNextPath(homeRoute: string, allowedRoutes: string[]) {
  if (typeof window === "undefined") return homeRoute;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/")) return homeRoute;
  return isAllowedPath(next, allowedRoutes) ? next : homeRoute;
}

function LoginPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "januz.shehu@parkresidence.co",
    password: "",
  });

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    return new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      setCheckingSession(false);
      return;
    }

    getSession()
      .then((viewer) => {
        window.location.replace(resolveNextPath(viewer.homeRoute, viewer.allowedRoutes));
      })
      .catch(() => {
        setAuthToken(null);
        setCheckingSession(false);
      });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const session = await login(form.email, form.password);
      setAuthToken(session.sessionToken);
      window.location.replace(resolveNextPath(session.homeRoute, session.allowedRoutes));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Login failed");
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f2eb] px-4">
        <div className="rounded-2xl border border-[#ded7c9] bg-white px-8 py-10 text-center shadow-[0_22px_80px_-56px_rgba(36,33,29,0.55)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7133]">
            Auth
          </p>
          <h1 className="mt-4 font-serif text-4xl text-zinc-950">Po verifikohet sesioni</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f2eb] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(210,179,107,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(36,33,29,0.12),_transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#ded7c9] bg-white shadow-[0_30px_120px_-70px_rgba(36,33,29,0.7)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-[#24211d] px-10 py-12 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d2b36b]">
                Park Residence
              </p>
              <h1 className="mt-6 max-w-sm font-serif text-5xl leading-[0.95]">
                Dashboard me qasje te kontrolluar.
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-white/72">
                Super admini menaxhon financat, progresin dhe perdoruesit. Sales users hyjne vetem
                te banesat.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex size-10 items-center justify-center rounded-full bg-[#d2b36b] text-[#24211d]">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Role-based access</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">
                      Sales nuk mund te shohin fatura, pagesa, kliente, progres apo audit.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex size-10 items-center justify-center rounded-full bg-[#d2b36b] text-[#24211d]">
                    <LockKeyhole className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Session token</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">
                      Hyrja ruhet lokalisht dhe API pranon vetem kerkesa me sesion valid.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7133]">
              Login
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-none text-zinc-950">
              Hyr ne dashboard
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Pas hyrjes do te ridrejtohesh te{" "}
              <span className="font-medium text-zinc-900">{nextPath}</span>.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
              <Field label="Email">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className={fieldClass}
                  autoComplete="username"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className={fieldClass}
                  autoComplete="current-password"
                />
              </Field>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <SubmitButton saving={saving} label="Hyr ne dashboard" />
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
