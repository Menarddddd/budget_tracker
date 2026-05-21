import api from "./api";

export async function getUser() {
    const response = await api.get("/users");
    return response.data;
}

export async function updateUser(formData) {
    const response = await api.patch("/users", formData);
    return response.data;
}

export async function changeEmail(data) {
    const response = await api.post("/users/change-email", data);
    return response.data;
}

export async function changePassword(data) {
    const response = await api.post("/users/change-password", data);
    return response.data;
}

export async function deleteAccount(data) {
    const response = await api.post("/users/delete-account", data);
    return response.data;
}