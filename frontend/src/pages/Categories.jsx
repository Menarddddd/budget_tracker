import { useState, useEffect } from "react";
import { getCustomCategories, updateCategory, createCategory } from "../services/categoryApi";
import { getUser } from "../services/userApi";
import Navbar from "../components/Navbar";
import ColorPicker from "../components/ColorPicker";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", color: "#3b82f6" });
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", color: "" });
    const [saving, setSaving] = useState(false);

    const [username, setUsername] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await getUser();
                setUsername(userData.username);

                const data = await getCustomCategories();
                setCategories(data);
            } catch (error) {
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
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
            setSuccess(null);
            setCreating(true);

            const newCategory = await createCategory(createForm);
            setCategories([...categories, newCategory]);
            setShowCreateForm(false);
            setCreateForm({ name: "", color: "#3b82f6" });
            setSuccess("Category created successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to create category");
        } finally {
            setCreating(false);
        }
    }

    function startEditing(category) {
        setEditingId(category.id);
        setEditForm({
            name: category.name,
            color: category.color,
        });
        setShowCreateForm(false);
        setSuccess(null);
        setError(null);
    }

    function cancelEditing() {
        setEditingId(null);
        setEditForm({ name: "", color: "" });
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
            setSuccess(null);
            setSaving(true);

            const updated = await updateCategory(categoryId, editForm);
            setCategories(
                categories.map((cat) =>
                    cat.id === categoryId ? { ...cat, ...updated } : cat
                )
            );

            setEditingId(null);
            setSuccess("Category updated successfully");
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to update category");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading categories...</p>
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
                            My Categories
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage your custom categories
                        </p>
                    </div>

                    {!showCreateForm && (
                        <button
                            onClick={() => {
                                setShowCreateForm(true);
                                setEditingId(null);
                                setSuccess(null);
                                setError(null);
                            }}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer whitespace-nowrap"
                        >
                            + New
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
                {showCreateForm && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Create New Category
                        </h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-600">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, name: e.target.value })
                                    }
                                    placeholder="e.g. Groceries, Gym, Netflix"
                                    className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-600">
                                    Color
                                </label>
                                <ColorPicker
                                    value={createForm.color}
                                    onChange={(color) =>
                                        setCreateForm({ ...createForm, color: color })
                                    }
                                />
                            </div>

                            {/* Preview */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-md p-3 sm:p-4">
                                <div
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex-shrink-0"
                                    style={{ backgroundColor: createForm.color }}
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">
                                        {createForm.name || "Category Name"}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        {createForm.color}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {creating ? "Creating..." : "Create Category"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setCreateForm({ name: "", color: "#3b82f6" });
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories List */}
                {categories.length > 0 ? (
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5"
                            >
                                {editingId === category.id ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">
                                                Category Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, name: e.target.value })
                                                }
                                                className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 w-full"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">
                                                Color
                                            </label>
                                            <ColorPicker
                                                value={editForm.color}
                                                onChange={(color) =>
                                                    setEditForm({ ...editForm, color: color })
                                                }
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleUpdate(category.id)}
                                                disabled={saving}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {saving ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-md font-semibold hover:bg-gray-200 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div
                                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex-shrink-0"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {category.name}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-400">
                                                    {category.color}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => startEditing(category)}
                                            className="flex-shrink-0 px-3 sm:px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    !showCreateForm && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
                            <p className="text-gray-400 mb-4">
                                You don&apos;t have any custom categories yet
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-5 py-2.5 bg-blue-500 text-white text-sm rounded-md font-semibold hover:bg-blue-600 cursor-pointer"
                            >
                                Create your first category
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default Categories;