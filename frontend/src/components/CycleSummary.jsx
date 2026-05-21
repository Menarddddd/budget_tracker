import { useState, useEffect } from "react";
import { getActiveCycle, getCycleSummary, createBudgetCycle, updateCycle } from "../services/cycleApi";
import { formatDate, formatMoney } from "../services/format";
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

function CycleSummary() {
    const [cycle, setCycle] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noCycle, setNoCycle] = useState(false);

    // Chart view toggle
    const [chartView, setChartView] = useState("amount");

    // Create cycle form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        budget_amount: "",
        start_date: new Date().toISOString().split("T")[0],
    });
    const [creating, setCreating] = useState(false);

    // Edit budget
    const [editingBudget, setEditingBudget] = useState(false);
    const [newBudgetAmount, setNewBudgetAmount] = useState("");
    const [savingBudget, setSavingBudget] = useState(false);
    const [budgetSuccess, setBudgetSuccess] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            setError(null);
            setNoCycle(false);

            const activeCycle = await getActiveCycle();
            setCycle(activeCycle);

            const summaryData = await getCycleSummary(activeCycle.id);
            setSummary(summaryData);
        } catch (error) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail || "";

            if (
                status === 404 ||
                detail.toLowerCase().includes("not found") ||
                detail.toLowerCase().includes("no active")
            ) {
                setNoCycle(true);
            } else {
                setError(detail || "Failed to load budget summary");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();

        if (!createForm.budget_amount || !createForm.start_date) {
            setError("Budget amount and start date are required");
            return;
        }

        try {
            setError(null);
            setCreating(true);

            const newCycle = await createBudgetCycle({
                ...createForm,
                budget_amount: parseFloat(createForm.budget_amount),
            });

            setCycle(newCycle);
            setNoCycle(false);
            setShowCreateForm(false);
            setCreateForm({
                budget_amount: "",
                start_date: new Date().toISOString().split("T")[0],
            });

            try {
                const summaryData = await getCycleSummary(newCycle.id);
                setSummary(summaryData);
            } catch {
                setSummary(null);
            }
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to create budget cycle");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateBudget(e) {
        e.preventDefault();

        if (!newBudgetAmount) {
            setError("Budget amount is required");
            return;
        }

        try {
            setError(null);
            setBudgetSuccess(null);
            setSavingBudget(true);

            const updated = await updateCycle(cycle.id, {
                budget_amount: parseFloat(newBudgetAmount),
            });

            setCycle({ ...cycle, ...updated });

            try {
                const summaryData = await getCycleSummary(cycle.id);
                setSummary(summaryData);
            } catch {
                // Summary might not change
            }

            setEditingBudget(false);
            setBudgetSuccess("Budget updated successfully");

            setTimeout(() => setBudgetSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update budget");
        } finally {
            setSavingBudget(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">Loading summary...</p>
            </div>
        );
    }

    if (noCycle) {
        return (
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 sm:p-8">
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

                {showCreateForm ? (
                    <div>
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
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
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
                                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-3 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {creating ? "Creating..." : "Create Cycle"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💰</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            No Budget Cycle Yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Create your first budget cycle to start tracking your expenses
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                        >
                            Create Your First Budget Cycle
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
            </div>
        );
    }

    const budget = parseFloat(summary?.budget_amount) || 0;
    const spent = Math.abs(parseFloat(summary?.total_spent)) || 0;
    const remaining = parseFloat(summary?.remaining) || 0;
    const overspent = Math.abs(parseFloat(summary?.overspent_amount)) || 0;
    const percentageSpent = summary?.percentage_spent || 0;

    const chartData = summary?.by_category?.map((cat) => ({
        name: cat.category_name,
        spent: Math.abs(parseFloat(cat.total_spent)) || 0,
        color: cat.color || "#3b82f6",
        percentOfBudget: cat.percentage_of_budget || 0,
        percentOfSpent: cat.percentage_of_spent || 0,
    })) || [];

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
            {/* Cycle Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Budget Summary
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    {formatDate(cycle?.start_date)} → {formatDate(cycle?.end_date)}
                </span>
            </div>

            {/* Budget Success Message */}
            {budgetSuccess && (
                <div className="relative text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 pr-10 mb-6">
                    {budgetSuccess}
                    <button
                        type="button"
                        onClick={() => setBudgetSuccess(null)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-green-400 hover:text-green-600 font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Error Message */}
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

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Budget Card - Clickable to edit */}
                <div
                    onClick={() => {
                        if (!editingBudget) {
                            setEditingBudget(true);
                            setNewBudgetAmount(cycle?.budget_amount || "");
                            setBudgetSuccess(null);
                            setError(null);
                        }
                    }}
                    className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 cursor-pointer hover:border-blue-400 transition-colors relative group"
                >
                    <p className="text-xs sm:text-sm text-blue-600">Budget</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                        ₱{formatMoney(budget)}
                    </p>
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 block">
                        Click to edit
                    </span>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-orange-600">Total Spent</p>
                    <p className="text-lg sm:text-xl font-bold text-orange-700">
                        ₱{formatMoney(spent)}
                    </p>
                </div>

                {summary?.is_overspent ? (
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

            {/* Edit Budget Form */}
            {editingBudget && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 mb-6 sm:mb-8">
                    <h3 className="text-sm font-semibold text-blue-700 mb-3">
                        Update Budget Amount
                    </h3>
                    <form onSubmit={handleUpdateBudget} className="flex flex-col sm:flex-row sm:items-end gap-3">
                        <div className="flex flex-col gap-1 flex-1 sm:max-w-xs">
                            <label className="text-xs text-blue-600">
                                New Amount
                            </label>
                            <input
                                type="number"
                                value={newBudgetAmount}
                                onChange={(e) => setNewBudgetAmount(e.target.value)}
                                placeholder="2000"
                                step="0.01"
                                min="0"
                                autoFocus
                                className="border border-blue-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={savingBudget}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {savingBudget ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBudget(false);
                                    setError(null);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-100 cursor-pointer border border-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Spent Percentage Bar */}
            <div className="mb-6 sm:mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Spent</span>
                    <span>{percentageSpent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                    <div
                        className={`h-3 sm:h-4 rounded-full transition-all ${
                            summary?.is_overspent ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{
                            width: `${Math.min(percentageSpent, 100)}%`,
                        }}
                    />
                </div>
            </div>

            {/* Horizontal Bar Chart */}
            {chartData.length > 0 ? (
                <div>
                    {/* Chart Header with Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                            Spending by Category
                        </h3>

                        <div className="flex bg-gray-100 rounded-md p-1 self-start sm:self-auto">
                            <button
                                onClick={() => setChartView("amount")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                    chartView === "amount"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Amount
                            </button>
                            <button
                                onClick={() => setChartView("percentage")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                    chartView === "percentage"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                % of Budget
                            </button>
                        </div>
                    </div>

                    {/* Amount View */}
                    {chartView === "amount" && (
                        <>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="min-w-[400px] px-4 sm:px-0">
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
                                                tick={{ fontSize: 12, fill: "#374151" }}
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

                            {/* Legend - Amount */}
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
                        </>
                    )}

                    {/* Percentage of Budget View */}
                    {chartView === "percentage" && (
                        <>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="min-w-[400px] px-4 sm:px-0">
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
                                                tickFormatter={(value) => `${value}%`}
                                                domain={[0, 100]}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                tick={{ fontSize: 12, fill: "#374151" }}
                                                width={90}
                                            />
                                            <Tooltip
                                                formatter={(value) => [`${value.toFixed(1)}%`, "% of Budget"]}
                                                contentStyle={{
                                                    backgroundColor: "white",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                }}
                                            />
                                            <Bar dataKey="percentOfBudget" radius={[0, 6, 6, 0]} barSize={24}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Legend - Percentage */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                {chartData.map((cat, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="text-xs sm:text-sm text-gray-600 truncate">
                                            {cat.name} ({cat.percentOfBudget.toFixed(1)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-400">No spending recorded yet</p>
                </div>
            )}
        </div>
    );
}

export default CycleSummary;