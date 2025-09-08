// src/pages/Login.tsx
import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import Button from "@/components/ui/button";

/* ---------------- Money Rain (background only) ---------------- */
function MoneyRain() {
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const items = useMemo(() => {
    if (prefersReduced) return [];
    const count = 6;
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100; // vw
      const size = 36 + Math.random() * 44; // px
      const rot = Math.random() * 360;
      const dur = 2 + Math.random() * 3; // 2–5s
      const delay = Math.random() * 4;
      const opacity = 0.55 + Math.random() * 0.35;
      const drift = (Math.random() * 40 + 20) * (i % 2 === 0 ? 1 : -1);
      return { left, size, rot, dur, delay, opacity, drift, key: i };
    });
  }, [prefersReduced]);

  if (prefersReduced) return null;

  type DriftStyle = React.CSSProperties & { ["--drift"]?: string };

  return (
    <>
      <style>{`
  @keyframes money-fall {
    0% { transform: translate3d(0, 0, 0) rotate(0deg); }
    100% { transform: translate3d(var(--drift, 0px), calc(100vh + 30vh), 0) rotate(720deg); }
  }
  .money-item {
    position: absolute;
    top: -30vh;
    animation-name: money-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }
`}</style>

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        {items.map(({ key, left, size, rot, dur, delay, opacity, drift }) => (
          <div
            key={key}
            className="money-item"
            style={
              {
                left: `${left}vw`,
                width: `${size}px`,
                opacity,
                transform: `rotate(${rot}deg)`,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
                "--drift": `${drift}px`,
              } as DriftStyle
            }
          >
            <svg
              viewBox="0 0 120 60"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <rect
                x="0"
                y="0"
                width="120"
                height="60"
                rx="6"
                fill="#dcfce7"
                fillOpacity="0.45"
              />
              <rect
                x="2.5"
                y="2.5"
                width="115"
                height="55"
                rx="4"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.2"
                strokeOpacity="0.8"
              />
              <circle
                cx="60"
                cy="30"
                r="16"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.2"
                strokeOpacity="0.85"
              />
              <text
                x="60"
                y="35"
                fontFamily="Inter, ui-sans-serif, system-ui, -apple-system"
                fontSize="20"
                fontWeight="700"
                fill="#16a34a"
                textAnchor="middle"
                opacity="0.9"
              >
                $
              </text>
            </svg>
          </div>
        ))}
      </div>
    </>
  );
}

/* ----------------------------- Login ----------------------------- */

type ApiErrorShape = { error?: string; message?: string };
function isApiErrorShape(x: unknown): x is ApiErrorShape {
  return (
    typeof x === "object" && x !== null && ("error" in x || "message" in x)
  );
}

type LoginSuccessShape = {
  token?: string;
  user?: { role?: string; [k: string]: unknown };
};

export default function Login() {
  // data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui + flow
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [entryToast, setEntryToast] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  // one-time: read and clear toast state
  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      setEntryToast(state.toast);
      navigate(".", { replace: true, state: null });
    }
    // also cleanup any legacy full-user storage
    try {
      localStorage.removeItem("user");
    } catch {
      /* ignore localStorage cleanup errors */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // parse ?next=... for post-login redirect
  const nextUrl = useMemo(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const next = sp.get("next");
      return next && next.startsWith("/") ? next : null;
    } catch {
      return null;
    }
  }, [location.search]);

  // abort controller for in-flight request
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // safe JSON parsing
  const parseJson = async (res: Response): Promise<unknown> => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const looksLikeEmail = (v: string) => /\S+@\S+\.\S+/.test(v.trim());

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!showPasswordStep) {
        if (!looksLikeEmail(email)) {
          setError("Please enter a valid email.");
          return;
        }
        setShowPasswordStep(true);
      }
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showPasswordStep && !loading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const isAbortError = (e: unknown): e is DOMException =>
    e instanceof DOMException && e.name === "AbortError";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!showPasswordStep) {
      if (!looksLikeEmail(email)) {
        setError("Please enter a valid email.");
        return;
      }
      setShowPasswordStep(true);
      return;
    }

    setLoading(true);
    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await fetch(api("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await parseJson(res)) as unknown;

      if (!res.ok) {
        const msg = isApiErrorShape(data)
          ? data.error || data.message || `Login failed (${res.status})`
          : `Login failed (${res.status})`;
        throw new Error(msg);
      }

      const payload = data as LoginSuccessShape;

      // Minimal localStorage: token only (no full user object)
      if (payload.token) localStorage.setItem("token", payload.token);
      // made sure any legacy 'user' entry is gone
      try {
        localStorage.removeItem("user");
      } catch {
        /* ignored localStorage cleanup errors */
      }

      // Redirect priority
      if (nextUrl) {
        navigate(nextUrl, { replace: true });
      } else if (payload.user?.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      setPassword("");
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setError(
        err instanceof Error ? err.message : "Unexpected error. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // shared Tailwind tokens
  const pillInput =
    "w-full bg-white border border-gray-300 rounded-full h-12 px-5 " +
    "text-base text-gray-900 placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset focus:border-transparent " +
    "caret-blue-500 transition-shadow duration-200";

  // Icons
  function EyeIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }

  return (
    <div className="relative bg-white min-h-screen flex items-center justify-center">
      {/* Money rain sits behind everything */}
      <MoneyRain />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Entry toast (from signup redirect) */}
        {entryToast && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            {entryToast}
          </div>
        )}

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2 antialiased tracking-tight leading-tight">
            Log in or sign up
          </h1>
          <p className="text-gray-600 mb-8">Sign in to Dashboard.</p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div id="email-section" className="space-y-4">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Email address"
                className={pillInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                aria-describedby="email-help"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div
            id="password-section"
            className={[
              "overflow-hidden transition-[max-height] duration-500",
              showPasswordStep ? "max-h-40 mt-4" : "max-h-0",
            ].join(" ")}
          >
            <div className="relative">
              <input
                id="password"
                name="password"
                type={reveal ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                className={`${pillInput} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                onFocus={(e) => (e.currentTarget.placeholder = "")}
                onBlur={(e) => {
                  if (!e.currentTarget.value)
                    e.currentTarget.placeholder = "Password";
                }}
                required={showPasswordStep}
              />

              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                aria-label={reveal ? "Hide password" : "Show password"}
                aria-pressed={reveal}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-full border border-transparent
                  text-gray-500 hover:bg-gray-100 hover:text-gray-700
                  focus:outline-none
                  transition-colors
                "
              >
                {reveal ? (
                  <EyeOffIcon className="h-6 w-6" />
                ) : (
                  <EyeIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* CTA */}
          <Button
            type="submit"
            isLoading={loading}
            loadingText="Signing in…"
            className="w-full mt-6"
          >
            Continue
          </Button>
        </form>

        {/* Sign up line */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
