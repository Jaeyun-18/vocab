import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Notion API does not allow browser CORS, so requests are proxied through
// this local dev server. NOTION_TOKEN stays in .env (no VITE_ prefix) so it
// is only readable here in Node and never reaches the client bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/notion": {
          target: "https://api.notion.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/notion/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("Authorization", `Bearer ${env.NOTION_TOKEN}`);
            });
          },
        },
      },
    },
  };
});
