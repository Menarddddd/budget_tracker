import { useState, useEffect } from "react";
import { getUser } from "../services/userApi";
import { getAllCycles, createBudgetCycle, updateCycle, getCycleSummary } from "../services/cycleApi";
import { formatDate, formatMoney } from "../services/format";
import Navbar from "../components/Navbar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

function BudgetCycles() {
    const [username, setUsername] = useState("");
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        budget_amount: "",
        start_date: new Date().toISOString().split("T")[0],
    });
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ budget_amount: "" });
    const [saving, setSaving] = useState(false);

    const [selectedSummary, setSelectedSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [selectedCycleId, setSelectedCycleId] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await getUser();
                setUsername(userData.username);

                const allCycles = await getAllCycles();
                setCycles(allCycles);
            } catch (error) {
                setError(error.response?.data?.detail || "Failed to load budget cycles");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();

        if (!createForm.budget_amount || !createForm.start_date) {
            setError("Budget amount and start date are required");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setCreating(true);

            const newCycle = await createBudgetCycle({
                ...createForm,
                budget_amount: parseFloat(createForm.budget_amount),
            });

            setCycles([newCycle, ...cycles]);
            setShowCreateForm(false);
            setCreateForm({
                budget_amount: "",
                start_date: new Date().toISOString().split("T")[0],
            });
            setSuccess("Budget cycle created successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to create budget cycle");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdate(cycleId) {
        if (!editForm.budget_amount) {
            setError("Budget amount is required");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setSaving(true);

            const updated = await updateCycle(cycleId, {
                budget_amount: parseFloat(editForm.budget_amount),
            });

            setCycles(
                cycles.map((c) => (c.id === cycleId ? { ...c, ...updated } : c))
            );

            setEditingId(null);
            setSuccess("Budget amount updated successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update budget cycle");
        } finally {
            setSaving(false);
        }
    }

    async function handleViewSummary(cycleId) {
        if (selectedCycleId === cycleId) {
            setSelectedCycleId(null);
            setSelectedSummary(null);
            return;
        }

        try {
            setSummaryLoading(true);
            setSelectedCycleId(cycleId);

            const summary = await getCycleSummary(cycleId);
            setSelectedSummary(summary);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to load summary");
            setSelectedCycleId(null);
        } finally {
            setSummaryLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading budget cycles...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar username={username} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                            Budget Cycles
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage your budget periods
                        </p>
                    </div>

                    {cycles.length === 0 && !showCreateForm && (
                        <button
                            onClick={() => {
                                setShowCreateForm(true);
                                setSuccess(null);
                                setError(null);
                            }}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer whitespace-nowrap"
                        >
                            + New Cycle
                        </button>
                    )}
                </div>

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

                {/* Create Form */}
                {showCreateForm && cycles.length === 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Create Your Budget Cycle
                        </h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-600">
                                        Budget Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.budget_amount}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                budget_amount: e.target.value,
                                            })
                                        }
                                        placeholder="2000"
                                        step="0.01"
                                        min="0"
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-600">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={createForm.start_date}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                start_date: e.target.value,
                                            })
                                        }
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {creating ? "Creating..." : "Create Cycle"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Cycles List */}
                {cycles.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {cycles.map((cycle) => {
                            const budget = parseFloat(cycle.budget_amount) || 0;

                            return (
                                <div key={cycle.id}>
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5">
                                        {editingId === cycle.id ? (
                                            <div className="flex flex-col gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-sm text-gray-600">
                                                        Budget Amount
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editForm.budget_amount}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                budget_amount: e.target.value,
                                                            })
                                                        }
                                                        step="0.01"
                                                        min="0"
                                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full sm:max-w-xs"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleUpdate(cycle.id)}
                                                        disabled={saving}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {saving ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-start sm:items-center justify-between gap-3">
                                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                                        <div
                                                            className={`w-3 h-3 rounded-full mt-1 sm:mt-0 flex-shrink-0 ${
                                                                cycle.is_active
                                                                    ? "bg-green-500"
                                                                    : "bg-gray-300"
                                                            }`}
                                                        />
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                                <p className="font-bold text-gray-800 text-base sm:text-lg">
                                                                    ₱{formatMoney(budget)}
                                                                </p>
                                                                {cycle.is_active && (
                                                                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 rounded-full px-2.5 py-0.5">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1">
                                                                {formatDate(cycle.start_date)} → {formatDate(cycle.end_date)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleViewSummary(cycle.id)}
                                                            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                                                selectedCycleId === cycle.id
                                                                    ? "bg-blue-50 text-blue-600"
                                                                    : "text-gray-500 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {selectedCycleId === cycle.id
                                                                ? "Hide"
                                                                : "Summary"}
                                                        </button>

                                                        {!cycle.is_active && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(cycle.id);
                                                                    setEditForm({
                                                                        budget_amount: cycle.budget_amount,
                                                                    });
                                                                    setSuccess(null);
                                                                    setError(null);
                                                                }}
                                                                className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {selectedCycleId === cycle.id && (
                                        <div className="mt-2">
                                            {summaryLoading ? (
                                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                                                    <p className="text-gray-500">
                                                        Loading summary...
                                                    </p>
                                                </div>
                                            ) : (
                                                selectedSummary && (
                                                    <SummaryPanel summary={selectedSummary} />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !showCreateForm && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
                            <p className="text-gray-400 mb-2">
                                No budget cycles yet
                            </p>
                            <p className="text-sm text-gray-400 mb-4">
                                Create your first budget cycle to start tracking expenses
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-5 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                            >
                                Create your first budget cycle
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function SummaryPanel({ summary }) {
    const budget = parseFloat(summary.budget_amount) || 0;
    const spent = Math.abs(parseFloat(summary.total_spent)) || 0;
    const remaining = parseFloat(summary.remaining) || 0;
    const overspent = Math.abs(parseFloat(summary.overspent_amount)) || 0;
    const percentageSpent = summary.percentage_spent || 0;

    const chartData = summary.by_category.map((cat) => ({
        name: cat.category_name,
        spent: Math.abs(parseFloat(cat.total_spent)) || 0,
        color: cat.color || "#3b82f6",
        percentOfBudget: cat.percentage_of_budget || 0,
        percentOfSpent: cat.percentage_of_spent || 0,
    }));

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-600">Budget</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                        ₱{formatMoney(budget)}
                    </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-orange-600">Total Spent</p>
                    <p className="text-lg sm:text-xl font-bold text-orange-700">
                        ₱{formatMoney(spent)}
                    </p>
                </div>

                {summary.is_overspent ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-red-600">Overspent</p>
                        <p className="text-lg sm:text-xl font-bold text-red-700">
                            -₱{formatMoney(overspent)}
                        </p>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-green-600">Remaining</p>
                        <p className="text-lg sm:text-xl font-bold text-green-700">
                            ₱{formatMoney(remaining)}
                        </p>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Spent</span>
                    <span>{percentageSpent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                    <div
                        className={`h-3 sm:h-4 rounded-full transition-all ${
                            summary.is_overspent ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{
                            width: `${Math.min(percentageSpent, 100)}%`,
                        }}
                    />
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
                        Spending by Category
                    </h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-[380px] px-4 sm:px-0">
                            <ResponsiveContainer
                                width="100%"
                                height={chartData.length * 50 + 40}
                            >
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e5e7eb"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 11, fill: "#6b7280" }}
                                        tickFormatter={(value) => `₱${formatMoney(value)}`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: "#374151" }}
                                        width={90}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`₱${formatMoney(value)}`, "Spent"]}
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                        }}
                                    />
                                    <Bar dataKey="spent" radius={[0, 6, 6, 0]} barSize={24}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                        {chartData.map((cat, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-xs sm:text-sm text-gray-600 truncate">
                                    {cat.name} (₱{formatMoney(cat.spent)})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-400">No spending recorded yet</p>
                </div>
            )}
        </div>
    );
}

export default BudgetCycles;