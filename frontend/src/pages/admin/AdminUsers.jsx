import { useState, useEffect } from "react";
import {
    getAdminUsers,
    getAdminUser,
    updateAdminUser,
    deleteAdminUser,
} from "../../services/adminApi";
import AdminNavbar from "../../components/AdminNavbar";
import { formatDate } from "../../services/format";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Pagination
    const [cursor, setCursor] = useState(null);
    const [hasNext, setHasNext] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Action states
    const [actionLoading, setActionLoading] = useState(null);

    // Selected user detail
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getAdminUsers();
                console.log("Users:", data);
                setUsers(data.items);
                setCursor(data.next_cursor);
                setHasNext(data.has_next);
            } catch (error) {
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    async function loadMore() {
        if (!cursor) return;

        try {
            setLoadingMore(true);
            const data = await getAdminUsers(10, cursor);
            setUsers([...users, ...data.items]);
            setCursor(data.next_cursor);
            setHasNext(data.has_next);
        } catch (error) {
            setError("Failed to load more users");
        } finally {
            setLoadingMore(false);
        }
    }

    async function handleViewUser(userId) {
        // Toggle off if clicking same user
        if (selectedUser?.id === userId) {
            setSelectedUser(null);
            return;
        }

        try {
            setDetailLoading(true);
            setError(null);

            const userData = await getAdminUser(userId);
            console.log("User detail:", userData);
            setSelectedUser(userData);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to load user details");
        } finally {
            setDetailLoading(false);
        }
    }

    async function handlePromoteAdmin(userId) {
        if (!window.confirm("Promote this user to admin?")) return;

        try {
            setActionLoading(userId);
            setError(null);

            const updated = await updateAdminUser(userId, {
                is_admin: true,
                is_verified: true,
            });

            setUsers(users.map((u) => (u.id === userId ? { ...u, ...updated } : u)));

            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, ...updated });
            }

            setSuccess("User promoted to admin");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to promote user");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleRemoveAdmin(userId) {
        if (!window.confirm("Remove admin privileges from this user?")) return;

        try {
            setActionLoading(userId);
            setError(null);

            const updated = await updateAdminUser(userId, {
                is_admin: false,
            });

            setUsers(users.map((u) => (u.id === userId ? { ...u, ...updated } : u)));

            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, ...updated });
            }

            setSuccess("Admin privileges removed");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update user");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            setActionLoading(userId);
            setError(null);

            await deleteAdminUser(userId);

            setUsers(users.filter((u) => u.id !== userId));

            if (selectedUser?.id === userId) {
                setSelectedUser(null);
            }

            setSuccess("User deleted successfully");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to delete user");
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <AdminNavbar />
                <div className="flex items-center justify-center py-20">
                    <p className="text-gray-400">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <AdminNavbar />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Users
                </h1>
                <p className="text-gray-400 mb-8">
                    Manage all registered users
                </p>

                {/* Messages */}
                {error && (
                    <div className="relative text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-md p-3 pr-10 mb-6">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-red-500 hover:text-red-400 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="relative text-sm text-green-400 bg-green-900/30 border border-green-800 rounded-md p-3 pr-10 mb-6">
                        {success}
                        <button
                            onClick={() => setSuccess(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-green-500 hover:text-green-400 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Users List */}
                <div className="flex flex-col gap-3">
                    {users.map((user) => (
                        <div key={user.id}>
                            {/* User Row */}
                            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                                <div className="flex items-center justify-between">
                                    {/* Left - Clickable user info */}
                                    <div
                                        onClick={() => handleViewUser(user.id)}
                                        className="flex items-center gap-4 cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                @{user.username}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right - Status + Actions */}
                                    <div className="flex items-center gap-4">
                                        {/* Role badge */}
                                        {user.is_admin ? (
                                            <span className="text-xs bg-red-900/50 text-red-400 border border-red-800 rounded-full px-2.5 py-0.5">
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2.5 py-0.5">
                                                User
                                            </span>
                                        )}

                                        {/* Status */}
                                        {user.deleted_at ? (
                                            <span className="text-xs text-red-400">Deleted</span>
                                        ) : user.is_verified ? (
                                            <span className="text-xs text-green-400">Active</span>
                                        ) : (
                                            <span className="text-xs text-yellow-400">Unverified</span>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {user.is_admin ? (
                                                <button
                                                    onClick={() => handleRemoveAdmin(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="px-2.5 py-1 text-xs text-yellow-400 hover:bg-yellow-900/30 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Remove Admin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePromoteAdmin(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-900/30 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Make Admin
                                                </button>
                                            )}
                                            {!user.deleted_at && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Detail Panel */}
                            {selectedUser?.id === user.id && (
                                <div className="mt-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
                                    {detailLoading ? (
                                        <p className="text-gray-400 text-center">Loading details...</p>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-lg font-bold">
                                                        {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">
                                                        {selectedUser.first_name} {selectedUser.last_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        @{selectedUser.username}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-700/50 rounded-md p-3">
                                                    <p className="text-xs text-gray-400">Email</p>
                                                    <p className="text-sm text-white">{selectedUser.email}</p>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-md p-3">
                                                    <p className="text-xs text-gray-400">User ID</p>
                                                    <p className="text-sm text-white font-mono text-xs break-all">
                                                        {selectedUser.id}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-md p-3">
                                                    <p className="text-xs text-gray-400">Role</p>
                                                    <p className="text-sm">
                                                        {selectedUser.is_admin ? (
                                                            <span className="text-red-400 font-semibold">Admin</span>
                                                        ) : (
                                                            <span className="text-green-400">User</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-md p-3">
                                                    <p className="text-xs text-gray-400">Status</p>
                                                    <p className="text-sm">
                                                        {selectedUser.deleted_at ? (
                                                            <span className="text-red-400">Deleted</span>
                                                        ) : selectedUser.is_verified ? (
                                                            <span className="text-green-400">Verified</span>
                                                        ) : (
                                                            <span className="text-yellow-400">Unverified</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-md p-3">
                                                    <p className="text-xs text-gray-400">Created</p>
                                                    <p className="text-sm text-white">
                                                        {formatDate(selectedUser.created_at)}
                                                    </p>
                                                </div>
                                                {selectedUser.deleted_at && (
                                                    <div className="bg-gray-700/50 rounded-md p-3">
                                                        <p className="text-xs text-gray-400">Deleted</p>
                                                        <p className="text-sm text-red-400">
                                                            {formatDate(selectedUser.deleted_at)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Load More */}
                {hasNext && (
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full mt-4 py-3 text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 font-semibold cursor-pointer disabled:opacity-50"
                    >
                        {loadingMore ? "Loading..." : "Load More"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;