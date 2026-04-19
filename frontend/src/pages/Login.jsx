import { useState } from "react";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem("dojo_token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_32%),linear-gradient(135deg,#111827_0%,#172554_45%,#0f766e_100%)] px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Placement Project</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            DevDojo turns coding practice into a team-based interview simulator.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
            DevDojo helps students practice real coding challenges in groups, track improvement on leaderboards, and receive structured feedback in one workflow recruiters can understand quickly.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Problem</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Placement preparation is usually scattered across sheets, chats, and random coding links with no shared accountability.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Solution</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Students create or join dojo groups, solve curated challenges, compare progress, and learn in a social practice loop.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Value</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                The project demonstrates product thinking, full-stack engineering, collaboration, and placement-focused execution.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-emerald-300/20 bg-emerald-400/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">How It Works</p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-100">
              <p>1. Sign in and create a dojo group for your class, team, or interview-prep circle.</p>
              <p>2. Launch coding challenges and let members submit solutions in a shared environment.</p>
              <p>3. Review leaderboard movement, feedback, and participation to understand consistent performers.</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md justify-self-center">
          <div className="rounded-[2rem] bg-white p-8 text-slate-900 shadow-2xl md:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">Welcome Back</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900">Sign in to DevDojo</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Access your placement-prep dashboard, coding groups, and challenge history.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                error={emailError}
              />

              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                error={passwordError}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-3 text-sm text-gray-500">or</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Sign up
              </Link>
            </p>

            <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
              Full-stack placement showcase
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-white/70">
            Copyright 2026 DevDojo. Built to demonstrate product clarity, collaboration, and interview readiness.
          </p>
        </section>
      </div>
    </div>
  );
}
