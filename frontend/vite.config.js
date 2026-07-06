import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
 // Load env file based on the current mode in the root folder of frontend
 const env = loadEnv(mode, process.cwd(), "");
 const backendUrl = env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

 return {
  plugins: [react()],
  envPrefix: ["VITE_", "FIREBASE_"],
  server: {
   port: 3000,
   host: "127.0.0.1",
   allowedHosts: true,
   proxy: {
    "/api": {
     target: backendUrl,
     changeOrigin: true,
     secure: false,
    },
    "/sitemap.xml": {
     target: backendUrl,
     changeOrigin: true,
     secure: false,
    },
    "/robots.txt": {
     target: backendUrl,
     changeOrigin: true,
     secure: false,
    },
   },
  },
 };
});
