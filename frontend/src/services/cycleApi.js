import api from "./api";

export async function createBudgetCycle(data) {
    const response = await api.post("/budget-cycles", data);
    return response.data;
}

export async function getAllCycles() {
    const response = await api.get("/budget-cycles/all");
    return response.data;
}

export async function getActiveCycle() {
    const response = await api.get("/budget-cycles/active");
    return response.data;
}

export async function getCycle(cycleId) {
    const response = await api.get(`/budget-cycles/${cycleId}`);
    return response.data;
}

export async function updateCycle(cycleId, data) {
    const response = await api.patch(`/budget-cycles/${cycleId}`, data);
    return response.data;
}

export async function getCycleSummary(cycleId) {
    const response = await api.get(`/budget-cycles/${cycleId}/summary`);
    return response.data;
}