const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl)
        return envUrl.replace(/\/$/, "");
    // Fallback to origin if proxy is handled by path or default port
    return "http://localhost:3001";
};
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
const request = async (path, options = {}) => {
    const baseUrl = getBaseUrl();
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const token = localStorage.getItem("ludes_token");
    const headers = new Headers(options.headers);
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const response = await fetch(url, {
        ...options,
        headers,
    });
    if (response.status === 401) {
        localStorage.removeItem("ludes_token");
        localStorage.removeItem("ludes_user");
        // Trigger redirect if not already on login page
        if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
        }
        throw new ApiError("Sesi telah berakhir. Silakan login kembali.", 401);
    }
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    }
    else {
        data = await response.text();
    }
    if (!response.ok) {
        const message = data?.error || data?.message || "Terjadi kesalahan pada server";
        throw new ApiError(message, response.status);
    }
    return data;
};
export const api = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, {
        ...options,
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    put: (path, body, options) => request(path, {
        ...options,
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    patch: (path, body, options) => request(path, {
        ...options,
        method: "PATCH",
        body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
//# sourceMappingURL=api-client.js.map