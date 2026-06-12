const getBackendUrl = () => {
 // Vite will inline import.meta.env.VITE_BACKEND_URL from .env at build time.
 // Do NOT hardcode backend URLs in source; keep it configurable via env.
 const envUrl = import.meta.env.VITE_BACKEND_URL;
 return (envUrl || "").trim();
};

export const BACKEND_URL = getBackendUrl();

export const apiUrl = (path = "") => {
 const cleanPath = String(path).startsWith("/") ? path : `/${path}`;
 // When VITE_BACKEND_URL is set, return absolute URL. Otherwise use relative paths
 // (Vite dev proxy will route /api/*).
 if (!BACKEND_URL) return cleanPath;
 return `${BACKEND_URL}${cleanPath}`;
};
