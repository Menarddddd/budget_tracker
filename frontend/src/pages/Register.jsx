import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleRegister } from "../services/authApi";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function onChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const cleanedData = {
            ...formData,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
        };

        if (
            !cleanedData.first_name ||
            !cleanedData.last_name ||
            !cleanedData.username ||
            !cleanedData.email ||
            !cleanedData.password ||
            !cleanedData.confirm_password
        ) {
            setError("Please fill out all the fields");
            return;
        }

        if (cleanedData.password !== cleanedData.confirm_password) {
            setError("Password and confirm password must match");
            return;
        }

        try {
            setError(null);
            setLoading(true);

            const { confirm_password, ...payload } = cleanedData;
            await handleRegister(payload);
            navigate("/login?registered=true");
        } catch (error) {
            const detail = error.response?.data?.detail;

            if (Array.isArray(detail)) {
                const messages = detail.map((err) => {
                    const field = err.loc?.[err.loc.length - 1] || "field";
                    return `${field}: ${err.msg}`;
                });
                setError(messages.join("\n"));
            } else {
                setError(detail || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl px-5 sm:px-8 py-8 sm:py-12 md:px-10 md:py-14">
                <div className="flex flex-col">
                    <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
                        Create an account
                    </h1>
                    <p className="text-sm text-center text-gray-500 mb-6 sm:mb-8">
                        Start tracking your budget in a smarter way
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <div className="flex flex-col gap-1">
                                <input
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    placeholder="First Name"
                                    onChange={onChange}
                                    value={formData.first_name}
                                    className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <input
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    placeholder="Last Name"
                                    onChange={onChange}
                                    value={formData.last_name}
                                    className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                name="username"
                                id="username"
                                placeholder="Username"
                                onChange={onChange}
                                value={formData.username}
                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Email"
                                onChange={onChange}
                                value={formData.email}
                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <div className="flex flex-col gap-1">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    onChange={onChange}
                                    value={formData.password}
                                    className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <input
                                    type="password"
                                    name="confirm_password"
                                    id="confirm_password"
                                    placeholder="Confirm Password"
                                    onChange={onChange}
                                    value={formData.confirm_password}
                                    className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                />
                            </div>
                        </div>

                        <div className="pt-1 sm:pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 active:scale-[0.99] transition-all duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? "Creating account..." : "Sign up"}
                            </button>
                        </div>
                    </form>

                    <p className="text-sm text-center text-gray-500 pt-6 sm:pt-8">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;