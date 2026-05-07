import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Add this vite block to allow your Railway host
  vite: {
    server: {
      allowedHosts: ["resourceful-perception-production-0c03.up.railway.app"],
    },
    preview: {
      allowedHosts: ["resourceful-perception-production-0c03.up.railway.app"],
    },
  },
});
