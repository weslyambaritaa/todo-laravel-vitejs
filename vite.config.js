import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path"; // 1. PASTIKAN 'path' DI-IMPORT

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: "0.0.0.0",
        hmr: {
            host: "localhost",
        },
    },
    // 2. BLOK 'resolve' INI TELAH DIPERBAIKI
    resolve: {
        alias: {
            // Gunakan path.resolve agar Node.js mengerti path-nya
            "@": path.resolve(__dirname, "resources/js"),
            "@/components": path.resolve(__dirname, "resources/js/Components"),
            "@/lib": path.resolve(__dirname, "resources/js/lib"),
        },
    },
    optimizeDeps: {
        include: ["lucide-react"],
    },
});