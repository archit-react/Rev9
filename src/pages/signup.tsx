// src/pages/signup.tsx
import { useState, type SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import Button from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";

type ApiErrorShape = { error?: string; message?: string };
function isApiErrorShape(x: unknown): x is ApiErrorShape {
  return (
    typeof x === "object" && x !== null && ("error" in x || "message" in x)
  );
}

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(false);

  const navigate = useNavigate();

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

  const pillInput =
    "w-full bg-white border border-gray-300 rounded-full h-12 px-5 " +
    "text-base font-medium text-gray-900 placeholder-gray-400 " +
    "focus:outline-none focus:ring-0 focus:border-transparent " +
    "caret-blue-500 transition-shadow duration-200";

  function EyeIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <PageTitle title="Sign Up" />

      {/* Border trace animation styles */}
      <style>{`
        @keyframes rev9-border-reveal {
          from { stroke-dashoffset: var(--len, 300); }
          to   { stroke-dashoffset: 0; }
        }
        .reveal-outline {
          stroke-dasharray: var(--len, 300);
          stroke-dashoffset: var(--len, 300);
          opacity: 0;
        }
       .group input:focus ~ svg .reveal-outline {

          opacity: 1;
          animation: rev9-border-reveal 700ms ease-out forwards;
        }
      `}</style>

      <div className="w-full max-w-md px-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2">
            Sign up
          </h1>
          <p className="text-gray-600 mb-8">Create your account below.</p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} noValidate>
          {/* Username */}
          <div className="relative group mb-4">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              autoComplete="off"
              className={`${pillInput} relative z-0`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <svg
              className="pointer-events-none absolute left-0 top-0 w-full h-full z-10"
              viewBox="0 0 400 48"
              preserveAspectRatio="none"
            >
              <g className="[--len:1000]">
                <rect
                  x="2"
                  y="2"
                  width="396"
                  height="44"
                  rx="22"
                  ry="22"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.0"
                  className="reveal-outline"
                />
              </g>
            </svg>
          </div>

          {/* Email */}
          <div className="relative group mb-4">
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email address"
              className={`${pillInput} relative z-0`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <svg
              className="pointer-events-none absolute left-0 top-0 w-full h-full z-10"
              viewBox="0 0 400 48"
              preserveAspectRatio="none"
            >
              <g className="[--len:1000]">
                <rect
                  x="2"
                  y="2"
                  width="396"
                  height="44"
                  rx="22"
                  ry="22"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.0"
                  className="reveal-outline"
                />
              </g>
            </svg>
          </div>

          {/* Password */}
          <div className="relative group mb-4">
            <input
              id="password"
              name="password"
              type={reveal ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password"
              className={`${pillInput} pr-12 relative z-0`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide password" : "Show password"}
              aria-pressed={reveal}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
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
            <svg
              className="pointer-events-none absolute left-0 top-0 w-full h-full z-10"
              viewBox="0 0 400 48"
              preserveAspectRatio="none"
            >
              <g className="[--len:1000]">
                <rect
                  x="2"
                  y="2"
                  width="396"
                  height="44"
                  rx="22"
                  ry="22"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.0"
                  className="reveal-outline"
                />
              </g>
            </svg>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            loadingText="Creating…"
            className="w-full mt-3"
          >
            Continue
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
