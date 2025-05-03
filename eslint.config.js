import ts from "@typescript-eslint/eslint-plugin"; // Add this import
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": ts, // Add this plugin registration
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        // Now properly recognized
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);
