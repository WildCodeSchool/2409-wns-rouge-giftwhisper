import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },

    proxy: {
      "/api": {
        target: "http://back:5500",
      },
    },
  },
});

// nodemon -L ./src/index.ts
