import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("dojo_token");
    navigate("/");
  };

  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#0f766e_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              DD
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">DevDojo</p>
              <p className="text-sm text-slate-200">Build. Practice. Grow.</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/dashboard"
              className={`transition-colors ${
                location.pathname === "/dashboard"
                  ? "font-semibold text-white"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`transition-colors ${
                location.pathname === "/profile"
                  ? "font-semibold text-white"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Logout
            </button>
          </div>

          <button
            className="text-white md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" currentColor="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="space-y-2 pb-4 md:hidden">
            <Link
              to="/dashboard"
              className="block rounded px-2 py-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="block rounded px-2 py-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full rounded bg-rose-500 px-2 py-2 text-left text-white transition-colors hover:bg-rose-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
