export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export declare const api: {
    get: <T>(path: string, options?: RequestInit) => Promise<T>;
    post: <T>(path: string, body?: any, options?: RequestInit) => Promise<T>;
    put: <T>(path: string, body?: any, options?: RequestInit) => Promise<T>;
    patch: <T>(path: string, body?: any, options?: RequestInit) => Promise<T>;
    delete: <T>(path: string, options?: RequestInit) => Promise<T>;
};
//# sourceMappingURL=api-client.d.ts.map