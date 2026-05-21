import { useState } from "react";
import { getAdminUser } from "../../services/adminApi";
import AdminNavbar from "../../components/AdminNavbar";
import { formatDate } from "../../services/format";

function AdminDashboard() {
    const [searchId, setSearchId] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSearch(e) {
        e.preventDefault();

        if (!searchId.trim()) {
            setError("Please enter a user ID");
            return;
        }

        try {
            setError(null);
            setLoading(true);
            setUser(null);

            const userData = await getAdminUser(searchId.trim());
            console.log("User found:", userData);
            setUser(userData);
        } catch (error) {
            setError(error.response?.data?.detail || "User not found");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <AdminNavbar />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-400 mb-8">
                    Search and manage users
                </p>

                {/* Search */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Search User by ID
                    </h2>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Enter user ID..."
                            className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-red-500 text-white text-sm rounded-md font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="relative text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-md p-3 pr-10 mb-6">
                        {error}
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-red-500 hover:text-red-400 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* User Result */}
                {user && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg font-bold">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {user.first_name} {user.last_name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    @{user.username}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700/50 rounded-md p-3">
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm text-white">{user.email}</p>
                            </div>
                            <div className="bg-gray-700/50 rounded-md p-3">
                                <p className="text-xs text-gray-400">User ID</p>
                                <p className="text-sm text-white font-mono text-xs">{user.id}</p>
                            </div>
                            <div className="bg-gray-700/50 rounded-md p-3">
                                <p className="text-xs text-gray-400">Role</p>
                                <p className="text-sm">
                                    {user.is_admin ? (
                                        <span className="text-red-400 font-semibold">Admin</span>
                                    ) : (
                                        <span className="text-green-400">User</span>
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-700/50 rounded-md p-3">
                                <p className="text-xs text-gray-400">Status</p>
                                <p className="text-sm">
                                    {user.deleted_at ? (
                                        <span className="text-red-400">Deleted</span>
                                    ) : user.is_verified ? (
                                        <span className="text-green-400">Verified</span>
                                    ) : (
                                        <span className="text-yellow-400">Unverified</span>
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-700/50 rounded-md p-3">
                                <p className="text-xs text-gray-400">Created</p>
                                <p className="text-sm text-white">{formatDate(user.created_at)}</p>
                            </div>
                            {user.deleted_at && (
                                <div className="bg-gray-700/50 rounded-md p-3">
                                    <p className="text-xs text-gray-400">Deleted</p>
                                    <p className="text-sm text-red-400">{formatDate(user.deleted_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;