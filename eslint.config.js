import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser"; // Add this import
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parser: tsParser, // Use the imported parser
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/react-in-jsx-scope": "off",
      "@next/next/no-html-link-for-pages": "error",
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    extends: ["plugin:@next/next/recommended"],
  },
];
