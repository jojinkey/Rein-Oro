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
    target: "http://127.0.0.1:5000",
    changeOrigin: true,
    secure: false,
   },
   "/sitemap.xml": {
    target: "http://localhost:5000",
    changeOrigin: true,
    secure: false,
   },
   "/robots.txt": {
    target: "http://localhost:5000",
    changeOrigin: true,
    secure: false,
   },
  },
 },
});
