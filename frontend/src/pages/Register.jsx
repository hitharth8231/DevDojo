import { useState } from "react";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    } else if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      isValid = false;
    }

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

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
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
      await api.register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_32%),linear-gradient(135deg,#111827_0%,#172554_45%,#0f766e_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur md:p-12">
          <div className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Why DevDojo</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            Build a coding habit that feels structured, social, and worth coming back to.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200">
            DevDojo gives developers one place to practice in groups, take on focused development challenges, and see real progress. Students are part of the audience, but the product also fits job seekers and working professionals who want steady growth.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Start</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">Create a group for classmates, peers, or coworkers who want a better practice loop.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Practice</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">Run development challenges in a space that keeps people active and accountable.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Grow</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">Track consistency, compare progress, and keep your development momentum alive.</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md justify-self-center">
          <div className="rounded-[2rem] bg-white p-8 shadow-2xl md:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">Create Account</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900">Join DevDojo</h2>
              <p className="mt-3 text-sm text-slate-500">Start building your coding rhythm with people who want to improve.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                error={usernameError}
              />

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

              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                error={confirmPasswordError}
              />

              <Button type="submit" disabled={loading} className="mt-6 w-full">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-3 text-sm text-gray-500">or</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-white/70">
            Copyright 2026 DevDojo. Practice with people who make you better.
          </p>
        </section>
      </div>
    </div>
  );
}
