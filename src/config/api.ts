/** Empty in dev — Vite proxies `/api` to `http://localhost:8080`. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;
