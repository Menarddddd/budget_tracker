import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authApi";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {
            setError(null);
            setLoading(true);

            await forgotPassword(email);
            setSuccess(true);
        } catch (error) {
            setError(
                error.response?.data?.detail || "Failed to send reset email"
            );
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md px-6 sm:px-8 py-10 sm:py-12 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-7 h-7 sm:w-8 sm:h-8 text-green-500"
                        >
                            <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        Check Your Email
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">
                        We&apos;ve sent a password reset link to your email.
                        Please check your inbox.
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
                    Forgot Password
                </h1>
                <p className="text-sm text-center text-gray-500 mb-8">
                    Enter your email and we&apos;ll send you a reset link
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="relative text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3 pr-10">
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

                    <div className="flex flex-col gap-1">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder="Enter your email"
                            className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 active:scale-[0.99] transition-all duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 pt-8">
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

export default ForgotPassword;