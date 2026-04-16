import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);
  const navigate = useNavigate();

  const refreshGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data || []);
    } catch (err) {
      setError(err.message || "Failed to load groups");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [currentUser, groupList] = await Promise.all([api.getMe(), api.getGroups()]);
        setUser(currentUser);
        setGroups(groupList || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      showToast("error", "Please provide a group name.");
      return;
    }

    setCreating(true);
    try {
      await api.createGroup({ name: groupName, description: groupDescription });
      await refreshGroups();
      setGroupName("");
      setGroupDescription("");
      showToast("success", "Group created successfully.");
    } catch (err) {
      showToast("error", err.message || "Unable to create group.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();

    if (!joinGroupId.trim()) {
      showToast("error", "Enter a Group ID to join.");
      return;
    }

    setJoining(true);
    try {
      await api.joinGroup(joinGroupId.trim());
      const group = await api.getGroup(joinGroupId.trim());
      setGroups((prev) => {
        const exists = prev.some((g) => g.id === group.id);
        return exists ? prev : [...prev, group];
      });
      setJoinGroupId("");
      showToast("success", "Joined group successfully.");
      navigate(`/group/${joinGroupId.trim()}`);
    } catch (err) {
      showToast("error", err.message || "Unable to join group.");
    } finally {
      setJoining(false);
    }
  };

  const isMember = (group) => {
    if (!user || !group?.members) return false;
    return group.members.includes(user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white rounded-3xl shadow-xl p-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Create a group or join one using its ID.</p>
            </div>
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Dojo logo" className="h-20 w-20 rounded-3xl shadow-xl object-cover" />
              <div className="rounded-3xl bg-indigo-50 px-4 py-3 text-center shadow-inner">
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-500">Dev</p>
                <p className="mt-1 text-2xl font-bold text-indigo-700">Dojo</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create a new group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group name</label>
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="E.g. JavaScript Dojo"
                    className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Optional group description"
                    className="w-full rounded-3xl border border-gray-200 px-4 py-3 min-h-[120px] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join a group</h2>
              <form onSubmit={handleJoinGroup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group ID</label>
                  <input
                    value={joinGroupId}
                    onChange={(e) => setJoinGroupId(e.target.value)}
                    placeholder="Enter the exact group ID"
                    className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={joining}
                  className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {joining ? "Joining..." : "Join Group"}
                </button>
              </form>
              <p className="mt-4 text-sm text-gray-500">
                If you don’t have a group ID, create a new group above or ask a classmate for one.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your groups</h2>
              {groups.length === 0 ? (
                <p className="text-gray-600">No groups found yet. Create one or join by ID.</p>
              ) : (
                <div className="grid gap-4">
                  {groups.map((group) => (
                    <div key={group.id} className="rounded-3xl border border-gray-200 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{group.description || "No description"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">ID</p>
                          <p className="text-sm font-semibold text-gray-700 break-all">{group.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/group/${group.id}`)}
                        className="mt-5 w-full rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                      >
                        {isMember(group) ? "Open Group" : "View Group"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tips</h2>
              <ul className="space-y-3 text-gray-600">
                <li>• Create a group if you want a private dojo for your team.</li>
                <li>• Use the exact group ID to join existing groups.</li>
                <li>• Once joined, you can open the group and start solving challenges.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Fast access</h2>
              <p className="text-sm leading-7">
                Create a group now or paste a group ID. The dashboard will update immediately and let you open the group page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}