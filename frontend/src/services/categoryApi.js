import api from "./api";

export async function getCategories() {
    const response = await api.get("/categories");
    return response.data;
}

export async function getCustomCategories() {
    const response = await api.get("/categories/custom");
    return response.data;
}

export async function createCategory(data) {
    const response = await api.post("/categories", data);
    return response.data;
}

export async function updateCategory(categoryId, data) {
    const response = await api.patch(`/categories/${categoryId}`, data);
    return response.data;
}