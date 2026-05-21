import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../services/authApi";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");

    const hasCalled = useRef(false);

    useEffect(() => {
        async function verify() {
            if (hasCalled.current) return;
            hasCalled.current = true;

            if (!token) {
                setStatus("failed");
                setMessage("No verification token found.");
                return;
            }

            try {
                const response = await verifyEmail(token);
                setStatus("success");
                setMessage(response.message || "Email verified successfully.");
            } catch (error) {
                const detail = error.response?.data?.detail || "";

                if (detail.toLowerCase().includes("already verified")) {
                    setStatus("success");
                    setMessage("Your email is already verified. You can log in.");
                    return;
                }

                setStatus("failed");
                setMessage(
                    detail ||
                    "Verification failed. The token may be invalid or expired."
                );
            }
        }

        verify();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md px-6 sm:px-8 py-10 sm:py-12 text-center">

                {/* Verifying */}
                {status === "verifying" && (
                    <>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5 sm:mb-6" />
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            Verifying your email...
                        </h1>
                        <p className="text-sm text-gray-500">
                            Please wait while we verify your email address.
                        </p>
                    </>
                )}

                {/* Success */}
                {status === "success" && (
                    <>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-green-500">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            Email Verified!
                        </h1>
                        <p className="text-sm text-gray-500 mb-6 sm:mb-8">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                        >
                            Go to Login
                        </button>
                    </>
                )}

                {/* Failed */}
                {status === "failed" && (
                    <>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-red-500">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-sm text-gray-500 mb-6 sm:mb-8">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;