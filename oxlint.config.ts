import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "oxc"],
  categories: {
    correctness: "error",
    suspicious: "error",
  },
  rules: {
    "typescript/no-floating-promises": [
      "error",
      {
        allowForKnownSafeCalls: [{ from: "package", package: "node:test", name: ["describe", "test"] }],
      },
    ],
  },
  options: {
    typeAware: true,
  },
});
