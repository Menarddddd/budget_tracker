import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyResetPassword } from "../services/authApi";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        new_password: "",
        confirm_password: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function onChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.new_password || !formData.confirm_password) {
            setError("Please fill out all fields");
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        if (formData.new_password.length < 7) {
            setError("Password must be at least 7 characters");
            return;
        }

        try {
            setError(null);
            setLoading(true);

            await verifyResetPassword(token, formData.new_password);
            setSuccess(true);
        } catch (error) {
            const detail = error.response?.data?.detail;

            if (Array.isArray(detail)) {
                const messages = detail.map((err) => {
                    const field = err.loc?.[err.loc.length - 1] || "field";
                    return `${field}: ${err.msg}`;
                });
                setError(messages.join("\n"));
            } else {
                setError(detail || "Failed to reset password");
            }
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md px-6 sm:px-8 py-10 sm:py-12 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-red-500">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        Invalid Reset Link
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">
                        No reset token found. Please request a new password reset.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md px-6 sm:px-8 py-10 sm:py-12 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-green-500">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        Password Reset!
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md px-6 sm:px-8 py-10 sm:py-12">
                <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
                    Reset Password
                </h1>
                <p className="text-sm text-center text-gray-500 mb-6 sm:mb-8">
                    Enter your new password below
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                    {error && (
                        <div className="relative text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3 pr-10">
                            {error.split("\n").map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-red-400 hover:text-red-600 font-bold text-base cursor-pointer"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">New Password</label>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={onChange}
                            placeholder="Enter new password"
                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={onChange}
                            placeholder="Confirm new password"
                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                        />
                    </div>

                    <div className="pt-1 sm:pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 active:scale-[0.99] transition-all duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-500 pt-6 sm:pt-8">
                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-500 hover:underline cursor-pointer"
                    >
                        ← Back to Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;