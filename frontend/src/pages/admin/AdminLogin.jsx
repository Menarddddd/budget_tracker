import { useState } from "react";
import { handleLogin } from "../../services/authApi";
import { getAdminUsers } from "../../services/adminApi";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function onChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError("All fields must be filled");
            return;
        }

        try {
            setError(null);
            setLoading(true);

            const response = await handleLogin(formData.username, formData.password);

            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);

            try {
                await getAdminUsers(1);
                localStorage.setItem("is_admin", "true");
                navigate("/admin/users");
            } catch (adminError) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setError("You are not authorized as admin");
            }
        } catch (error) {
            setError(error.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-md px-8 py-12">
                <h1 className="text-2xl font-bold text-white text-center mb-8">
                    Admin
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="relative text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-md p-3 pr-10">
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

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            onChange={onChange}
                            value={formData.username}
                            className="bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={onChange}
                            value={formData.password}
                            className="bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;