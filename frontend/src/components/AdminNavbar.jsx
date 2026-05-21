import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

function AdminNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("is_admin");
        navigate("/admin/login");
    }

    function isActive(path) {
        return location.pathname === path;
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                {/* Desktop + Mobile top bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <span className="text-lg font-bold text-red-500">
                            Admin
                        </span>

                        {/* Desktop nav links */}
                        <div className="hidden sm:flex items-center gap-1">
                            <Link
                                to="/admin/users"
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    isActive("/admin/users")
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                            >
                                Users
                            </Link>
                            <Link
                                to="/admin/categories"
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    isActive("/admin/categories")
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                            >
                                Categories
                            </Link>
                        </div>
                    </div>

                    {/* Desktop logout */}
                    <button
                        onClick={handleLogout}
                        className="hidden sm:block px-4 py-2 rounded-md text-sm text-red-400 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="sm:hidden text-gray-400 hover:text-white cursor-pointer p-1"
                    >
                        {menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="sm:hidden flex flex-col gap-1 mt-3 pt-3 border-t border-gray-800">
                        <Link
                            to="/admin/users"
                            onClick={() => setMenuOpen(false)}
                            className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                isActive("/admin/users")
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                        >
                            Users
                        </Link>
                        <Link
                            to="/admin/categories"
                            onClick={() => setMenuOpen(false)}
                            className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                isActive("/admin/categories")
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                        >
                            Categories
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 rounded-md text-sm text-red-400 hover:bg-gray-800 transition-colors cursor-pointer text-left"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default AdminNavbar;