import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [challengeTopic, setChallengeTopic] = useState("");
  const [challengeDifficulty, setChallengeDifficulty] = useState("medium");
  const [activeTab, setActiveTab] = useState("challenges");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [challengeMessage, setChallengeMessage] = useState("");

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const isMember = !!group?.members?.includes(user?.id);

  useEffect(() => {
    async function fetchData() {
      try {
        const [currentUser, groupData, challengesData, leaderboardData] = await Promise.all([
          api.getMe(),
          api.getGroup(id),
          api.getPreviousChallenges(id),
          api.getGroupLeaderboard(id),
        ]);

        setUser(currentUser);
        setGroup(groupData);
        setChallenges(challengesData || []);
        setLeaderboard(leaderboardData || []);
      } catch (err) {
        setError(err.message || "Failed to load group data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
  if (activeTab === "leaderboard") {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getGroupLeaderboard(id);
        setLeaderboard(data || []);
      } catch (err) {
        console.error("Leaderboard refresh failed", err);
      }
    };

    fetchLeaderboard();
  }
}, [activeTab, id]);

  const handleJoinGroup = async () => {
    if (!group) return;
    setJoinLoading(true);
    setError("");
    setChallengeMessage("");

    try {
      await api.joinGroup(id);
      const updatedGroup = await api.getGroup(id);
      setGroup(updatedGroup);
      showToast("success", "You have joined this group successfully.");
      setActiveTab("challenges");
    } catch (err) {
      showToast("error", err.message || "Failed to join group");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
      return;
    }

    try {
      await api.deleteChallenge(challengeId);
      const updatedChallenges = await api.getPreviousChallenges(id);
      setChallenges(updatedChallenges || []);
      showToast("success", "Challenge deleted successfully.");
    } catch (err) {
      showToast("error", err.message || "Failed to delete challenge");
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setChallengeMessage("");
    setError("");

    if (!challengeTopic.trim()) {
      showToast("error", "Please enter a challenge topic.");
      return;
    }

    setCreatingChallenge(true);
    try {
      await api.createChallenge({
        group_id: id,
        topic: challengeTopic,
        difficulty: challengeDifficulty,
      });
      const updatedChallenges = await api.getPreviousChallenges(id);
      setChallenges(updatedChallenges || []);
      setChallengeTopic("");
      setChallengeDifficulty("medium");
      showToast("success", "Challenge created successfully.");
      setActiveTab("challenges");
    } catch (err) {
      showToast("error", err.message || "Failed to create challenge");
    } finally {
      setCreatingChallenge(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-4">Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-3xl shadow-xl p-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-indigo-600 hover:text-indigo-700 font-semibold mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{group?.name || `Group ${id}`}</h1>
            <p className="text-gray-600 mb-2">{group?.description || "No description available."}</p>
            <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500 mb-8">
              <div className="rounded-2xl bg-indigo-50 px-4 py-3">
                <span className="font-semibold text-indigo-700">Group ID:</span>{" "}
                <span className="break-all">{id}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(id);
                  showToast("success", "Group ID copied to clipboard.");
                }}
                className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                Copy ID
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl bg-indigo-50 p-5">
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-3xl font-bold text-indigo-700 mt-2">{group?.members?.length || 0}</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-5">
                <p className="text-sm text-gray-500">Created By</p>
                <p className="text-3xl font-bold text-indigo-700 mt-2">{group?.created_by || "Unknown"}</p>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
                  {error}
                </div>
              )}
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

              {!isMember ? (
                <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Join this group</h2>
                  <p className="text-indigo-100 mb-4">Become a member to take part in challenges and climb the leaderboard.</p>
                  <button
                    onClick={handleJoinGroup}
                    disabled={joinLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-white py-3 px-6 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {joinLoading ? "Joining..." : "Join Group"}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl bg-green-50 p-6">
                  <h2 className="text-xl font-bold text-green-900 mb-2">Member access granted</h2>
                  <p className="text-green-700">You already belong to this group. Start solving challenges now.</p>
                </div>
              )}

              <div className="rounded-3xl bg-white shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Group Options</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setActiveTab("challenges")}
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    View Challenges
                  </button>
                  <button
                    onClick={() => setActiveTab("leaderboard")}
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>

              {isMember && (
                <div className="rounded-3xl bg-white shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Create Challenge</h2>
                  <form onSubmit={handleCreateChallenge} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                      <input
                        value={challengeTopic}
                        onChange={(e) => setChallengeTopic(e.target.value)}
                        placeholder="Enter challenge topic"
                        className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={challengeDifficulty}
                        onChange={(e) => setChallengeDifficulty(e.target.value)}
                        className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={creatingChallenge}
                      className="w-full rounded-3xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {creatingChallenge ? "Creating..." : "Create Challenge"}
                    </button>
                  </form>
                  {challengeMessage && (
                    <p className="mt-4 text-sm text-green-700">{challengeMessage}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-80 space-y-4">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Group Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleJoinGroup}
                  disabled={isMember || joinLoading}
                  className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isMember ? "Already Joined" : joinLoading ? "Joining..." : "Join Group"}
                </button>
                <button
                  onClick={() => {
                    const firstChallengeId = challenges?.[0]?.id;
                    if (firstChallengeId) navigate(`/challenge/${firstChallengeId}`);
                  }}
                  disabled={!challenges?.length}
                  className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {challenges?.length ? "Open First Challenge" : "No Challenges Yet"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
              <p className="text-gray-600">This group currently has {group?.members?.length || 0} members.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex gap-4 flex-wrap mb-8 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-6 py-3 rounded-2xl font-semibold transition ${
                activeTab === "challenges"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-3 rounded-2xl font-semibold transition ${
                activeTab === "leaderboard"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Leaderboard
            </button>
          </div>

          {activeTab === "challenges" ? (
            <div className="space-y-4">
              {challenges.length === 0 ? (
                <div className="text-center py-12 rounded-3xl bg-gray-50">
                  <p className="text-gray-600">No challenges yet. Check back soon!</p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="rounded-3xl border border-gray-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{challenge.topic}</h3>
                        <div className="flex items-center gap-4 mb-2">
                          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                            challenge.difficulty === "easy"
                              ? "bg-green-100 text-green-700"
                              : challenge.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {challenge.difficulty || "Medium"}
                          </span>
                          {challenge.time_remaining && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {challenge.time_remaining}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/challenge/${challenge.id}`)}
                          disabled={challenge.time_remaining === "Expired"}
                          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                          {challenge.time_remaining === "Expired" ? "Expired" : "Attempt Challenge"}
                        </button>
                        {user?.id === group?.created_by && (
                          <button
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-200 overflow-hidden">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No leaderboard data yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold">Rank</th>
                        <th className="px-6 py-4 text-sm font-semibold">User</th>
                        <th className="px-6 py-4 text-sm font-semibold">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr key={entry.user_id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                          <td className="px-6 py-4">#{index + 1}</td>
                          <td className="px-6 py-4">{entry.username}</td>
                          <td className="px-6 py-4 font-semibold">{entry.xp || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}