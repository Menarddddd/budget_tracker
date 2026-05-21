import api from "./api";

export async function createExpense(data) {
    const response = await api.post("/expenses", data);
    return response.data;
}

export async function getExpenses(cycleId, limit = 10, cursor = null) {
    const params = { cycle_id: cycleId, limit };
    if (cursor) params.cursor = cursor;
    const response = await api.get("/expenses", { params });
    return response.data;
}

export async function updateExpense(expenseId, data) {
    const response = await api.patch(`/expenses/${expenseId}`, data);
    return response.data;
}

export async function deleteExpense(expenseId) {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
}