import { useState, useEffect } from "react";
import { getUser, updateUser, changeEmail, changePassword, deleteAccount } from "../services/userApi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [activeSection, setActiveSection] = useState(null);
    const [saving, setSaving] = useState(false);

    const [profileForm, setProfileForm] = useState({
        first_name: "",
        last_name: "",
        username: "",
    });

    const [emailForm, setEmailForm] = useState({
        new_email: "",
        password: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [deleteForm, setDeleteForm] = useState({
        password: "",
        reason: "",
    });

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getUser();
                setUser(userData);
                setProfileForm({
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    username: userData.username,
                });
            } catch (error) {
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    function openSection(section) {
        setActiveSection(activeSection === section ? null : section);
        setError(null);
        setSuccess(null);
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();

        if (!profileForm.first_name || !profileForm.last_name || !profileForm.username) {
            setError("All fields must be filled");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setSaving(true);

            const updatedUser = await updateUser(profileForm);
            setUser({ ...user, ...updatedUser });
            setProfileForm({
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                username: updatedUser.username,
            });

            setActiveSection(null);
            setSuccess("Profile updated successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    async function handleChangeEmail(e) {
        e.preventDefault();

        if (!emailForm.new_email || !emailForm.password) {
            setError("Email and password are required");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setSaving(true);

            await changeEmail(emailForm);

            setUser({ ...user, email: emailForm.new_email });
            setEmailForm({ new_email: "", password: "" });
            setActiveSection(null);
            setSuccess("Email changed successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to change email");
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();

        if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            setError("All password fields are required");
            return;
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError("New passwords do not match");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setSaving(true);

            await changePassword({
                old_password: passwordForm.old_password,
                new_password: passwordForm.new_password,
            });

            setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
            setActiveSection(null);
            setSuccess("Password changed successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to change password");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteAccount(e) {
        e.preventDefault();

        if (!deleteForm.password) {
            setError("Password is required to delete your account");
            return;
        }

        if (!window.confirm("Are you sure? This action cannot be undone.")) {
            return;
        }

        try {
            setError(null);
            setSaving(true);

            await deleteAccount(deleteForm);

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to delete account");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar username={user?.username} />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Messages */}
                {error && (
                    <div className="relative text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3 pr-10 mb-6">
                        {error}
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-red-400 hover:text-red-600 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="relative text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 pr-10 mb-6">
                        {success}
                        <button
                            type="button"
                            onClick={() => setSuccess(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-green-400 hover:text-green-600 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 sm:p-8 mb-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg sm:text-2xl font-bold">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                                {user?.first_name} {user?.last_name}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-xs sm:text-sm truncate">{user?.username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                                >
                                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                                </svg>
                                <span className="text-xs sm:text-sm truncate">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="flex flex-col gap-3 sm:gap-4">

                    {/* Edit Profile */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <button
                            onClick={() => openSection("edit-profile")}
                            className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base sm:text-lg">👤</span>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Edit Profile</p>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        Update your name and username
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-400 text-sm flex-shrink-0 ml-2">
                                {activeSection === "edit-profile" ? "▲" : "▼"}
                            </span>
                        </button>

                        {activeSection === "edit-profile" && (
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4">
                                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">First Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.first_name}
                                                onChange={(e) =>
                                                    setProfileForm({ ...profileForm, first_name: e.target.value })
                                                }
                                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Last Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.last_name}
                                                onChange={(e) =>
                                                    setProfileForm({ ...profileForm, last_name: e.target.value })
                                                }
                                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600">Username</label>
                                        <input
                                            type="text"
                                            value={profileForm.username}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, username: e.target.value })
                                            }
                                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(null)}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Change Email */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <button
                            onClick={() => openSection("change-email")}
                            className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base sm:text-lg">✉️</span>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Change Email</p>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        Update your email address
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-400 text-sm flex-shrink-0 ml-2">
                                {activeSection === "change-email" ? "▲" : "▼"}
                            </span>
                        </button>

                        {activeSection === "change-email" && (
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4">
                                <form onSubmit={handleChangeEmail} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600">New Email</label>
                                        <input
                                            type="email"
                                            value={emailForm.new_email}
                                            onChange={(e) =>
                                                setEmailForm({ ...emailForm, new_email: e.target.value })
                                            }
                                            placeholder="newemail@example.com"
                                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600">
                                            Confirm with Password
                                        </label>
                                        <input
                                            type="password"
                                            value={emailForm.password}
                                            onChange={(e) =>
                                                setEmailForm({ ...emailForm, password: e.target.value })
                                            }
                                            placeholder="Enter your password"
                                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {saving ? "Changing..." : "Change Email"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(null)}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <button
                            onClick={() => openSection("change-password")}
                            className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base sm:text-lg">🔒</span>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Change Password</p>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        Update your password
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-400 text-sm flex-shrink-0 ml-2">
                                {activeSection === "change-password" ? "▲" : "▼"}
                            </span>
                        </button>

                        {activeSection === "change-password" && (
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4">
                                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.old_password}
                                            onChange={(e) =>
                                                setPasswordForm({ ...passwordForm, old_password: e.target.value })
                                            }
                                            placeholder="Enter current password"
                                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.new_password}
                                                onChange={(e) =>
                                                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                                                }
                                                placeholder="Enter new password"
                                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirm_password}
                                                onChange={(e) =>
                                                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                                                }
                                                placeholder="Confirm new password"
                                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {saving ? "Changing..." : "Change Password"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(null)}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Delete Account */}
                    <div className="bg-white rounded-lg border border-red-200 shadow-sm">
                        <button
                            onClick={() => openSection("delete-account")}
                            className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-red-50 transition-colors rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base sm:text-lg">⚠️</span>
                                <div className="text-left">
                                    <p className="font-semibold text-red-600 text-sm sm:text-base">Delete Account</p>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-400 text-sm flex-shrink-0 ml-2">
                                {activeSection === "delete-account" ? "▲" : "▼"}
                            </span>
                        </button>

                        {activeSection === "delete-account" && (
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-red-100 pt-4">
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4 mb-4">
                                    <p className="text-sm text-red-600 font-semibold mb-1">
                                        Warning: This action cannot be undone
                                    </p>
                                    <p className="text-xs sm:text-sm text-red-500">
                                        All your data including expenses, budget cycles, and categories will be permanently deleted.
                                    </p>
                                </div>

                                <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600">
                                            Confirm with Password
                                        </label>
                                        <input
                                            type="password"
                                            value={deleteForm.password}
                                            onChange={(e) =>
                                                setDeleteForm({ ...deleteForm, password: e.target.value })
                                            }
                                            placeholder="Enter your password"
                                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-600">
                                            Reason for leaving (optional)
                                        </label>
                                        <textarea
                                            value={deleteForm.reason}
                                            onChange={(e) =>
                                                setDeleteForm({ ...deleteForm, reason: e.target.value })
                                            }
                                            placeholder="Tell us why you're leaving..."
                                            rows={3}
                                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 resize-none w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-red-500 text-white text-sm rounded-md font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {saving ? "Deleting..." : "Delete My Account"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(null)}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;