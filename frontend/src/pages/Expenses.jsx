import { useState, useEffect } from "react";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../services/expenseApi";
import { formatDate, formatMoney } from "../services/format";
import { getUser } from "../services/userApi";
import { getActiveCycle } from "../services/cycleApi";
import { getCategories } from "../services/categoryApi";
import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import { useNavigate } from "react-router-dom";

function Expenses() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [cycle, setCycle] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [noCycle, setNoCycle] = useState(false);

    const [cursor, setCursor] = useState(null);
    const [hasNext, setHasNext] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await getUser();
                setUsername(userData.username);

                let activeCycle;
                try {
                    activeCycle = await getActiveCycle();
                } catch (error) {
                    const status = error.response?.status;
                    const detail = error.response?.data?.detail || "";

                    if (
                        status === 404 ||
                        detail.toLowerCase().includes("not found") ||
                        detail.toLowerCase().includes("no active")
                    ) {
                        setNoCycle(true);
                        return;
                    }
                    throw error;
                }

                setCycle(activeCycle);

                const categoriesData = await getCategories();
                setCategories(categoriesData);

                const expensesData = await getExpenses(activeCycle.id);
                setExpenses(expensesData.items);
                setCursor(expensesData.next_cursor);
                setHasNext(expensesData.has_next);
            } catch (error) {
                setError(error.response?.data?.detail || "Failed to load expenses");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    function getCategoryInfo(categoryId) {
        const cat = categories.find((c) => c.id === categoryId);
        return {
            name: cat?.name || "Unknown",
            color: cat?.color || "#6b7280",
        };
    }

    async function loadMore() {
        if (!cursor || !cycle) return;

        try {
            setLoadingMore(true);
            const data = await getExpenses(cycle.id, 10, cursor);
            setExpenses([...expenses, ...data.items]);
            setCursor(data.next_cursor);
            setHasNext(data.has_next);
        } catch (error) {
            setError("Failed to load more expenses");
        } finally {
            setLoadingMore(false);
        }
    }

    async function handleCreate(formData) {
        if (!formData.category_id || !formData.amount || !formData.expense_date) {
            setError("Category, amount, and date are required");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setSaving(true);

            const newExpense = await createExpense(formData);
            setExpenses([newExpense, ...expenses]);
            setShowForm(false);
            setSuccess("Expense added successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to create expense");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(formData) {
        if (!formData.category_id || !formData.amount || !formData.expense_date) {
            setError("Category, amount, and date are required");
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setSaving(true);

            const updated = await updateExpense(editingExpense.id, formData);
            setExpenses(
                expenses.map((exp) =>
                    exp.id === editingExpense.id ? { ...exp, ...updated } : exp
                )
            );

            setEditingExpense(null);
            setSuccess("Expense updated successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update expense");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(expenseId) {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setDeletingId(expenseId);

            await deleteExpense(expenseId);
            setExpenses(expenses.filter((exp) => exp.id !== expenseId));
            setSuccess("Expense deleted successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to delete expense");
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading expenses...</p>
            </div>
        );
    }

    if (noCycle) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar username={username} />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                        Expenses
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Track your spending
                    </p>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            No Budget Cycle Yet
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            You need to create a budget cycle before you can add expenses
                        </p>
                        <button
                            onClick={() => navigate("/home")}
                            className="px-6 py-3 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                        >
                            Go to Home to Create One
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar username={username} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                            Expenses
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">
                            {formatDate(cycle?.start_date)} → {formatDate(cycle?.end_date)}
                        </p>
                    </div>

                    {!showForm && !editingExpense && (
                        <button
                            onClick={() => {
                                setShowForm(true);
                                setSuccess(null);
                                setError(null);
                            }}
                            className="flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer whitespace-nowrap"
                        >
                            + Add
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

                {/* Add Expense Form */}
                {showForm && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            New Expense
                        </h2>
                        <ExpenseForm
                            onSubmit={handleCreate}
                            loading={saving}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {/* Edit Expense Form */}
                {editingExpense && (
                    <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-4 sm:p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Edit Expense
                        </h2>
                        <ExpenseForm
                            onSubmit={handleUpdate}
                            initialData={editingExpense}
                            loading={saving}
                            onCancel={() => setEditingExpense(null)}
                        />
                    </div>
                )}

                {/* Expenses List */}
                {expenses.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {expenses.map((expense) => {
                            const category = getCategoryInfo(expense.category_id);

                            return (
                                <div
                                    key={expense.id}
                                    className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        {/* Left side */}
                                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                            <div
                                                className="w-2.5 sm:w-3 h-10 sm:h-12 rounded-full flex-shrink-0"
                                                style={{
                                                    backgroundColor: category.color,
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                                    {expense.description || "No description"}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                                    <span
                                                        className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: category.color + "20",
                                                            color: category.color,
                                                        }}
                                                    >
                                                        {category.name}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                                        {formatDate(expense.expense_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right side */}
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 flex-shrink-0">
                                            <p className="text-sm sm:text-lg font-bold text-gray-800 whitespace-nowrap">
                                                ₱{formatMoney(expense.amount)}
                                            </p>

                                            <div className="flex items-center gap-0.5 sm:gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingExpense(expense);
                                                        setShowForm(false);
                                                        setSuccess(null);
                                                        setError(null);
                                                    }}
                                                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    disabled={deletingId === expense.id}
                                                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deletingId === expense.id
                                                        ? "..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {hasNext && (
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="w-full py-3 text-sm text-blue-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? "Loading..." : "Load More"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
                        <p className="text-gray-400 mb-4">
                            No expenses recorded yet
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-5 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                            >
                                Add your first expense
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Expenses;