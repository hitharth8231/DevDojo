import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [challenge, setChallenge] = useState(null);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const renderDescription = (text) => {
    if (!text) {
      return <p className="text-gray-400">No problem description available.</p>;
    }

    const lines = text.split(/\r?\n/);
    const elements = [];
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside text-gray-300 space-y-1 mb-4">
            {listItems.map((item, index) => (
              <li key={`item-${index}`} className="text-gray-300">
                {item}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) {
        flushList();
        return elements.push(<div key={`blank-${index}`} className="h-3" />);
      }

      const listMatch = line.match(/^(?:\*|-|\d+\.)\s+(.*)$/);
      if (listMatch) {
        listItems.push(listMatch[1]);
        return;
      }

      flushList();

      const boldHeadingMatch = line.match(/^\*\*(.+)\*\*$/);
      if (boldHeadingMatch) {
        return elements.push(
          <h3 key={`heading-${index}`} className="text-xl font-semibold text-white mt-4 mb-2">
            {boldHeadingMatch[1]}
          </h3>
        );
      }

      const sectionHeadingMatch = line.match(/^#+\s*(.*)$/);
      if (sectionHeadingMatch) {
        return elements.push(
          <h3 key={`heading-${index}`} className="text-xl font-semibold text-white mt-4 mb-2">
            {sectionHeadingMatch[1]}
          </h3>
        );
      }

      elements.push(
        <p key={`p-${index}`} className="text-gray-300 leading-7 mb-3">
          {line}
        </p>
      );
    });

    flushList();
    return elements;
  };

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const [currentUser, challengeData] = await Promise.all([
          api.getMe(),
          api.getChallenge(id),
        ]);
        setUser(currentUser);
        setChallenge(challengeData);
      } catch (err) {
        showToast("error", err.message || "Failed to load challenge.");
      }
    };

    fetchChallenge();
  }, [id]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      showToast("error", "Please enter some code.");
      return;
    }

    if (!challenge) {
      showToast("error", "Challenge details are not available yet.");
      return;
    }

    if (!user) {
      showToast("error", "Unable to identify current user.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.submitSolution({
        user_id: user.id,
        challenge_id: challenge.id,
        code,
      });
      setResult(data);
      const updatedLeaderboard = await api.getGroupLeaderboard(challenge.group_id);
setLeaderboard(updatedLeaderboard);
     showToast("success", "Submission sent successfully.");
    } catch (err) {
      showToast("error", err.message || "Failed to submit code");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {challenge?.topic || `Challenge ${id}`}
              </h1>
              <div className="prose prose-invert text-gray-300">
                {challenge?.problem_statement
                  ? renderDescription(challenge.problem_statement)
                  : "No problem description available."}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold ${
              challenge?.difficulty === "easy"
                ? "bg-green-500/20 text-green-400"
                : challenge?.difficulty === "medium"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {challenge?.difficulty?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Code Editor */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <button
                  onClick={handleReset}
                  className="text-sm px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Write your solution here\nfunction solve() {\n  // Your code\n}`}
                className="w-full h-96 bg-gray-800 text-gray-100 p-6 focus:outline-none font-mono text-sm border-none"
                spellCheck="false"
              />
            </div>

            {/* Toast Message */}
            {toast.show && (
              <div className={`fixed right-6 top-6 z-50 w-full max-w-sm rounded-3xl border p-5 shadow-2xl transition ${
                toast.type === "error"
                  ? "bg-red-600 border-red-700 text-white"
                  : "bg-emerald-600 border-emerald-700 text-white"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold uppercase tracking-[0.2em] text-sm">
                      {toast.type === "error" ? "Error" : "Success"}
                    </p>
                    <p className="mt-2 text-sm leading-6">{toast.message}</p>
                  </div>
                  <button
                    onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                    className="text-white/80 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading || challenge?.time_remaining === "Expired"}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
              >
                {loading ? "Submitting..." : challenge?.time_remaining === "Expired" ? "Challenge Expired" : "Submit Solution"}
              </button>
            </div>
          </div>

          {/* Results Sidebar */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Results</h3>

              {result ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    result.passed
                      ? "bg-green-500/20 border border-green-500/50"
                      : "bg-red-500/20 border border-red-500/50"
                  }`}>
                    <p className={`font-bold text-lg ${
                      result.passed ? "text-green-400" : "text-red-400"
                    }`}>
                      {result.passed ? "✓ Passed" : "✗ Failed"}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6 mt-6">
  <h3 className="text-xl font-bold mb-4">Leaderboard</h3>

  {leaderboard.length > 0 ? (
    leaderboard.map((entry, index) => (
      <div key={entry.user_id} className="flex justify-between py-2 border-b border-gray-700">
        <span>{index + 1}. {entry.username}</span>
        <span className="text-green-400">{entry.xp} XP</span>
      </div>
    ))
  ) : (
    <p className="text-gray-400">No leaderboard data</p>
  )}
</div>

                  {result.testsPassed !== undefined && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Test Results</p>
                      <p className="text-2xl font-bold">
                        {result.testsPassed}/{result.totalTests || challenge?.testCases}
                      </p>
                    </div>
                  )}

                  {result.score !== undefined && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Score</p>
                      <p className="text-2xl font-bold text-indigo-400">{result.score.toFixed(2)}%</p>
                    </div>
                  )}

                  {result.xp !== undefined && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">XP Earned</p>
                      <p className="text-2xl font-bold text-green-400">+{result.xp}</p>
                    </div>
                  )}

                  {result.feedback && (
                    <div className="bg-gray-700 p-4 rounded-lg mt-4">
                      <p className="text-gray-400 text-sm mb-2">Feedback</p>
                      <p className="text-gray-300 text-sm">{result.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Submit your solution to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
