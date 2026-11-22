import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const wixMock = (name) => ({
  find: new RegExp("^" + name + "$"),
  replacement: root("./tests/mocks/" + name + ".js"),
});

export default defineConfig({
  resolve: {
    alias: [
      // Wix resolves "backend/..." to src/backend; Wix modules exist only on Wix servers.
      { find: /^backend\//, replacement: root("./src/backend/") },
      { find: /^public\//, replacement: root("./src/public/") },
      wixMock("wix-fetch"),
      wixMock("wix-secrets-backend"),
      wixMock("wix-data"),
      wixMock("wix-http-functions"),
      wixMock("wix-payment-provider-backend"),
    ],
  },
  test: {
    include: ["tests/**/*.test.js"],
    setupFiles: ["./tests/setup.js"],
    passWithNoTests: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/backend/**/*.js", "src/public/**/*.js"],
      reporter: ["text", "html"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
