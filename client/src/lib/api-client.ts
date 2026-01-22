import { auth } from "./firebase";

class ApiClient {
    private async getAuthHeaders(): Promise<HeadersInit> {
        const user = auth.currentUser;
        if (!user) {
            return {
                "Content-Type": "application/json",
            };
        }

        const token = await user.getIdToken();
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Request failed" }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async get<T = any>(url: string): Promise<T> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(url, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Request failed" }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }
}

export const apiClient = new ApiClient();
