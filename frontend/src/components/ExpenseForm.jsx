import { useState, useEffect } from "react";
import { getCategories } from "../services/categoryApi";

function ExpenseForm({ onSubmit, initialData, loading, onCancel }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: "",
        amount: "",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.log("Failed to load categories:", error);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                category_id: initialData.category_id || "",
                amount: initialData.amount || "",
                description: initialData.description || "",
                expense_date: initialData.expense_date || new Date().toISOString().split("T")[0],
            });
        }
    }, [initialData]);

    function onChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Category</label>
                <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={onChange}
                    className="border border-gray-300 rounded-md px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-white w-full"
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Amount</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={onChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="border border-gray-300 rounded-md px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Date</label>
                    <input
                        type="date"
                        name="expense_date"
                        value={formData.expense_date}
                        onChange={onChange}
                        className="border border-gray-300 rounded-md px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Description</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={onChange}
                    placeholder="What did you spend on?"
                    className="border border-gray-300 rounded-md px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 active:scale-[0.99] transition-all duration-150 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading
                        ? "Saving..."
                        : initialData
                        ? "Update Expense"
                        : "Add Expense"}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default ExpenseForm;