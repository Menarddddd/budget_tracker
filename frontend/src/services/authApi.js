import axios from "axios";
import api from "./api";

const rawAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export async function handleLogin(username, password) {
    const response = await api.post(
        "/auth/login",
        new URLSearchParams({ username, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data;
}

export async function handleRegister(formData) {
    const response = await api.post("/auth/register", formData);
    return response.data;
}

export async function resendVerificationEmail(email) {
    const response = await api.post("/auth/resend-verification-email", {
        email: email,
    });
    return response.data;
}

export async function verifyEmail(token) {
    const response = await rawAxios.get("/auth/verify-email", {
        params: { token },
    });
    return response.data;
}

export async function forgotPassword(email) {
    const response = await api.post("/auth/reset-password", {
        email: email,
    });
    return response.data;
}

export async function verifyResetPassword(token, newPassword) {
    const response = await api.post("/auth/verify-reset-password", {
        token: token,
        new_password: newPassword,
    });
    return response.data;
}