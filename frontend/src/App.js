import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/Grouppage";
import ChallengePage from "./pages/Challenges";
import Profile from "./pages/ProfilePage";

// Components
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>

      {/* Navbar (optional but recommended) */}
      <Navbar />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group/:id" element={<GroupPage />} />
        <Route path="/challenge/:id" element={<ChallengePage />} />
        <Route path="/profile" element={<Profile />} />

        {/* Fallback */}
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;