import { useEffect, useState } from "react";
import { getUser } from "../services/userApi";
import Navbar from "../components/Navbar";
import CycleSummary from "../components/CycleSummary";

function Home() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const data = await getUser();
                setUser(data);
            } catch (error) {
                setError(error.response?.data?.detail || "Failed to fetch user");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar username={user.username} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                    Welcome back, {user.first_name}!
                </h1>
                <p className="text-sm text-gray-500 mb-6 sm:mb-8">
                    Here&apos;s your budget overview
                </p>

                <CycleSummary />
            </div>
        </div>
    );
}

export default Home;