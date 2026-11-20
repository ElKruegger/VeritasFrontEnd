import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Unit and component tests (Vitest + Testing Library), run in a simulated
// browser (jsdom). End-to-end tests against the real app come later
// (Playwright) and live outside src/.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The "@/..." import alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
