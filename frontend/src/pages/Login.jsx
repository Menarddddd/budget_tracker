import { useState } from "react";
import { handleLogin } from "../services/authApi";
import { resendVerificationEmail } from "../services/authApi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../components/Toast";

function Login() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Toast state
    const [toast, setToast] = useState(() => {
        if (searchParams.get("registered") === "true") {
            return {
                message: "Account created successfully! Please check your email to verify your account.",
                type: "success",
            };
        }
        if (searchParams.get("loggedout") === "true") {
            return {
                message: "You have been logged out successfully.",
                type: "info",
            };
        }
        if (searchParams.get("verified") === "true") {
            return {
                message: "Email verified successfully! You can now log in.",
                type: "success",
            };
        }
        return null;
    });

    // Verification form
    const [showVerifyForm, setShowVerifyForm] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState("");
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState(null);
    const [verifyError, setVerifyError] = useState(null);

    function onChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    }

    // Clear URL params after toast shows
    function handleToastClose() {
        setToast(null);
        setSearchParams({});
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

            navigate("/home");
        } catch (error) {
            const detail = error.response?.data?.detail || "Login failed";

            if (
                error.response?.status === 403 ||
                detail.toLowerCase().includes("verify") ||
                detail.toLowerCase().includes("verified")
            ) {
                setShowVerifyForm(true);
                setError(null);
            } else {
                setError(detail);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleResendVerification(e) {
        e.preventDefault();

        if (!verifyEmail) {
            setVerifyError("Please enter your email");
            return;
        }

        try {
            setVerifyError(null);
            setVerifySuccess(null);
            setVerifyLoading(true);

            await resendVerificationEmail(verifyEmail);

            setVerifySuccess("Verification email sent! Please check your inbox.");
        } catch (error) {
            setVerifyError(
                error.response?.data?.detail || "Failed to send verification email"
            );
        } finally {
            setVerifyLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={handleToastClose}
                />
            )}

            <div className="bg-white rounded-lg shadow-xl border border-gray-200 flex w-full max-w-4xl overflow-hidden px-8">
                <div className="hidden md:block md:w-1/2">
                    <img
                        src="/money.jpg"
                        alt="Money"
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                        draggable="false"
                    />
                </div>

                <div className="w-full md:w-1/2 px-10 py-14 flex flex-col">
                    {/* Show verification form */}
                    {showVerifyForm ? (
                        <>
                            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                                Verify Your Email
                            </h1>
                            <p className="text-sm text-center text-gray-500 mb-8">
                                Your account needs email verification before you can log in.
                                Enter your email to receive a verification link.
                            </p>

                            <form
                                onSubmit={handleResendVerification}
                                className="flex flex-col gap-6"
                            >
                                {verifyError && (
                                    <div className="relative text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3 pr-10">
                                        {verifyError}
                                        <button
                                            type="button"
                                            onClick={() => setVerifyError(null)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-red-400 hover:text-red-600 font-bold cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {verifySuccess && (
                                    <div className="relative text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 pr-10">
                                        {verifySuccess}
                                        <button
                                            type="button"
                                            onClick={() => setVerifySuccess(null)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-green-400 hover:text-green-600 font-bold cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <input
                                        type="email"
                                        value={verifyEmail}
                                        onChange={(e) => setVerifyEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifyLoading}
                                    className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {verifyLoading
                                        ? "Sending..."
                                        : "Send Verification Email"}
                                </button>
                            </form>

                            <button
                                onClick={() => {
                                    setShowVerifyForm(false);
                                    setVerifyError(null);
                                    setVerifySuccess(null);
                                }}
                                className="text-sm text-center text-blue-500 hover:underline cursor-pointer mt-6"
                            >
                                ← Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                                Let&apos;s track your budget now!
                            </h1>

                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-6"
                            >
                                {error && (
                                    <div className="relative text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3 pr-10">
                                        {error}
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
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        onChange={onChange}
                                        value={formData.username}
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        onChange={onChange}
                                        value={formData.password}
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <span
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-xs text-blue-500 hover:underline cursor-pointer text-right mt-1"
                                >
                                    Forgot password?
                                </span>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 active:scale-[0.99] transition-all duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? "Logging in..." : "Login"}
                                    </button>
                                </div>
                            </form>

                            <p className="text-sm text-center text-gray-500 py-8">
                                Don&apos;t have an account?{" "}
                                <span
                                    onClick={() => navigate("/register")}
                                    className="text-blue-500 hover:underline cursor-pointer"
                                >
                                    Register here
                                </span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;