import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import RubyPlugin from "vite-plugin-ruby";

export default defineConfig({
  plugins: [RubyPlugin(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app/frontend", import.meta.url)),
    },
  },
});
