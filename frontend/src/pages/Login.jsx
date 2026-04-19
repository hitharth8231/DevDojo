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
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur md:p-12">
          <div className="absolute inset-y-0 right-0 hidden w-40 bg-[radial-gradient(circle,_rgba(250,204,21,0.18),_transparent_70%)] lg:block" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Development-Focused Practice</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            DevDojo gives developers a better way to practice, ship, and grow together.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
            DevDojo helps students, job seekers, and working developers take on focused development work with a clear flow. You create a group, start a development challenge, submit your approach, and track growth without jumping between random tools.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Who Uses It</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Students use it for placements, job seekers use it to stay sharp, and working developers use it to keep improving with a team.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">What You Do</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                You bring people into a dojo, run development challenges, and give everyone one place to practice with consistency.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Why It Matters</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                DevDojo turns practice into a repeatable habit and makes progress visible instead of vague.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Dojo Flow</p>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-100">
                <p>You create a group for people who want to grow as developers together.</p>
                <p>You start a development challenge, and each member works on the same real-world task in their own way.</p>
                <p>You review submissions, compare approaches, and track progress as everyone becomes a stronger developer over time.</p>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Built For Growth</p>
              <p className="mt-4 text-sm leading-7 text-slate-100">
                DevDojo focuses on the development journey itself. It helps people practice with intention, not just solve one question and disappear.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md justify-self-center">
          <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 text-slate-900 shadow-2xl md:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">Welcome Back</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900">Sign in to DevDojo</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Pick up your coding routine, rejoin your dojo, and keep moving forward.
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
            Copyright 2026 DevDojo. Designed for developers who grow faster when practice feels real.
          </p>
        </section>
      </div>
    </div>
  );
}
