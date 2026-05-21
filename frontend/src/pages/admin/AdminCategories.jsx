import { useState, useEffect } from "react";
import {
    getDefaultCategories,
    createDefaultCategory,
    updateDefaultCategory,
    deleteDefaultCategory,
} from "../../services/adminApi";
import AdminNavbar from "../../components/AdminNavbar";
import ColorPicker from "../../components/ColorPicker";

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Create
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", color: "#3b82f6" });
    const [creating, setCreating] = useState(false);

    // Edit
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", color: "" });
    const [saving, setSaving] = useState(false);

    // Delete
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await getDefaultCategories();
                console.log("Categories:", data);
                setCategories(data);
            } catch (error) {
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();

        if (!createForm.name || !createForm.color) {
            setError("Name and color are required");
            return;
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(createForm.color)) {
            setError("Color must be in #ffffff format");
            return;
        }

        try {
            setError(null);
            setCreating(true);

            const newCat = await createDefaultCategory(createForm);
            setCategories([...categories, newCat]);
            setShowCreateForm(false);
            setCreateForm({ name: "", color: "#3b82f6" });
            setSuccess("Category created successfully");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to create category");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdate(categoryId) {
        if (!editForm.name || !editForm.color) {
            setError("Name and color are required");
            return;
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(editForm.color)) {
            setError("Color must be in #ffffff format");
            return;
        }

        try {
            setError(null);
            setSaving(true);

            const updated = await updateDefaultCategory(categoryId, editForm);
            setCategories(categories.map((c) => (c.id === categoryId ? { ...c, ...updated } : c)));
            setEditingId(null);
            setSuccess("Category updated successfully");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update category");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(categoryId) {
        if (!window.confirm("Delete this default category?")) return;

        try {
            setDeletingId(categoryId);
            setError(null);

            await deleteDefaultCategory(categoryId);
            setCategories(categories.filter((c) => c.id !== categoryId));
            setSuccess("Category deleted successfully");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to delete category");
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <AdminNavbar />
                <div className="flex items-center justify-center py-20">
                    <p className="text-gray-400">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <AdminNavbar />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            Default Categories
                        </h1>
                        <p className="text-sm text-gray-400">
                            Manage default categories for all users
                        </p>
                    </div>

                    {!showCreateForm && (
                        <button
                            onClick={() => {
                                setShowCreateForm(true);
                                setEditingId(null);
                                setSuccess(null);
                            }}
                            className="px-5 py-2.5 bg-red-500 text-white text-sm rounded-md font-semibold hover:bg-red-600 cursor-pointer"
                        >
                            + New Category
                        </button>
                    )}
                </div>

                {/* Messages */}
                {error && (
                    <div className="relative text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-md p-3 pr-10 mb-6">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-red-500 hover:text-red-400 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="relative text-sm text-green-400 bg-green-900/30 border border-green-800 rounded-md p-3 pr-10 mb-6">
                        {success}
                        <button
                            onClick={() => setSuccess(null)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-green-500 hover:text-green-400 font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Create Default Category
                        </h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Category Name</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder="e.g. Food, Transport"
                                    className="bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Color</label>
                                <ColorPicker
                                    value={createForm.color}
                                    onChange={(color) => setCreateForm({ ...createForm, color })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2.5 bg-red-500 text-white text-sm rounded-md font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {creating ? "Creating..." : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-5 py-2.5 bg-gray-700 text-gray-300 text-sm rounded-md font-semibold hover:bg-gray-600 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories List */}
                <div className="flex flex-col gap-3">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-gray-800 rounded-lg border border-gray-700 p-5"
                        >
                            {editingId === category.id ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-400">Category Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-400">Color</label>
                                        <ColorPicker
                                            value={editForm.color}
                                            onChange={(color) => setEditForm({ ...editForm, color })}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUpdate(category.id)}
                                            disabled={saving}
                                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-md font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-md font-semibold hover:bg-gray-600 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-md"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <div>
                                            <p className="font-semibold text-white">
                                                {category.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {category.color}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingId(category.id);
                                                setEditForm({ name: category.name, color: category.color });
                                                setShowCreateForm(false);
                                            }}
                                            className="px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            disabled={deletingId === category.id}
                                            className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/30 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {deletingId === category.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminCategories;