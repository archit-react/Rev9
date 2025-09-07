// src/pages/signup.tsx
import { useState, type SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api"; // keep your existing helper

// ---- Types & type-guard to avoid `any` --------------------------------
type ApiErrorShape = { error?: string; message?: string };
function isApiErrorShape(x: unknown): x is ApiErrorShape {
  return (
    typeof x === "object" &&
    x !== null &&
    // We don't require both; presence of either key is enough to treat as error payload
    ("error" in x || "message" in x)
  );
}

export default function Signup() {
  // data
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(false); // 👁️ toggle

  const navigate = useNavigate();

  // safe JSON parsing
  const parseJson = async (res: Response): Promise<unknown> => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(api("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email: email.trim(), password }),
      });

      const data = await parseJson(res);

      if (!res.ok) {
        const msg = isApiErrorShape(data)
          ? data.error || data.message || `Registration failed (${res.status})`
          : `Registration failed (${res.status})`;
        throw new Error(msg);
      }

      // ✅ Redirect to Login with a success toast message
      navigate("/login", {
        replace: true,
        state: { toast: "Account created. Please sign in." },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Server error. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // shared Tailwind tokens
  const pillInput =
    "w-full bg-white border border-gray-300 rounded-full h-12 px-5 " +
    "text-base font-medium text-gray-900 placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset focus:border-transparent " +
    "caret-blue-500 transition-shadow duration-200";

  const ctaButton =
    "w-full rounded-full h-12 px-4 mt-3 font-semibold " +
    "bg-neutral-900 text-white shadow-sm " +
    "hover:bg-neutral-700 " +
    "active:bg-neutral-500 active:translate-y-px " +
    "focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
    "disabled:bg-neutral-800 disabled:text-white/70 disabled:cursor-not-allowed " +
    "transition-colors duration-150";

  // 👁️ Fixed Eye icons with better path definitions
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

  // Minimal inline spinner (no deps)
  function Spinner() {
    return (
      <svg
        className="animate-spin h-5 w-5 mr-2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          opacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2">
            Sign up
          </h1>
          <p className="text-gray-600 mb-8">Create your account below.</p>
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
        <form onSubmit={handleRegister} noValidate>
          {/* Username */}
          <div className="mb-4">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              autoComplete="off"
              className={pillInput}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
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
              required
            />
          </div>

          {/* Password with 👁️ toggle */}
          <div className="mb-4 relative">
            <input
              id="password"
              name="password"
              type={reveal ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password"
              className={`${pillInput} pr-12`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              <span className="sr-only">
                {reveal ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`${ctaButton} inline-flex items-center justify-center`}
          >
            {loading ? (
              <>
                <Spinner />
                Creating…
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {/* Already have an account */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
