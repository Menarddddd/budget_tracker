import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

function Navbar({ username }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("is_admin");
        navigate("/login?loggedout=true");
    }

    const navLinks = [
        { path: "/home", label: "Home" },
        { path: "/expenses", label: "Expenses" },
        { path: "/budget-cycles", label: "Cycles" },
        { path: "/categories", label: "Categories" },
        { path: "/profile", label: "Profile" },
    ].filter((link) => link.path !== location.pathname);

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/home"
                        className="text-lg font-bold text-blue-500 hover:text-blue-600"
                    >
                        ZJTracker
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="px-3 lg:px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}

 
                        <button
                            onClick={handleLogout}
                            className="px-3 lg:px-4 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile - username + hamburger */}
                    <div className="flex md:hidden items-center gap-3">
                        <span className="text-sm font-medium text-gray-800">
                            @{username}
                        </span>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-600 hover:text-gray-800 cursor-pointer p-1"
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
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden flex flex-col gap-1 mt-3 pt-3 border-t border-gray-200">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMenuOpen(false)}
                                className="px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2.5 rounded-md text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;