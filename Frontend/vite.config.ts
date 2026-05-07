import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Add this vite block to allow your Railway host
  vite: {
    server: {
      allowedHosts: ["gregarious-truth-production-dc91.up.railway.app"],
    },
    preview: {
      allowedHosts: ["gregarious-truth-production-dc91.up.railway.app"],
    },
  },
});
