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

  // Don't show navbar on login/register pages
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">🥋</div>
            <span className="text-white font-bold text-xl hidden sm:inline">Dojo</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/dashboard"
              className={`transition-colors ${
                location.pathname === "/dashboard"
                  ? "text-white font-semibold"
                  : "text-indigo-100 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`transition-colors ${
                location.pathname === "/profile"
                  ? "text-white font-semibold"
                  : "text-indigo-100 hover:text-white"
              }`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              currentColor="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/dashboard"
              className="block px-2 py-2 text-indigo-100 hover:text-white hover:bg-indigo-700 rounded transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="block px-2 py-2 text-indigo-100 hover:text-white hover:bg-indigo-700 rounded transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}