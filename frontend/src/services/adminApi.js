import api from "./api";

// Users
export async function getAdminUsers(limit = 10, cursor = null) {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const response = await api.get("/admin/users", { params });
    return response.data;
}

export async function getAdminUser(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
}

export async function updateAdminUser(userId, data) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
}

export async function deleteAdminUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
}

// Categories
export async function getDefaultCategories() {
    const response = await api.get("/admin/categories");
    return response.data;
}

export async function createDefaultCategory(data) {
    const response = await api.post("/admin/categories", data);
    return response.data;
}

export async function updateDefaultCategory(categoryId, data) {
    const response = await api.patch(`/admin/categories/${categoryId}`, data);
    return response.data;
}

export async function deleteDefaultCategory(categoryId) {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
}