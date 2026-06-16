import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
 plugins: [react()],
 server: {
  port: 3000,
  host: "127.0.0.1",
  allowedHosts: true,
  proxy: {
   "/api": {
    // Uses VITE_BACKEND_URL from frontend/.env when available
    target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:5000",
    changeOrigin: true,
    secure: false,
   },
   "/sitemap.xml": {
    target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:5000",
    changeOrigin: true,
    secure: false,
   },
   "/robots.txt": {
    target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:5000",
    changeOrigin: true,
    secure: false,
   },
  },
 },
});
