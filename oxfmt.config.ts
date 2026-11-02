import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 120,
  sortImports: {
    groups: [
      ["builtin", "external"],
      ["internal", "parent", "sibling", "index", "unknown"],
    ],
  },
});
