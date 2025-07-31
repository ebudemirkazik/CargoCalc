import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": "off", // Bu kuralı tamamen kapatır
      "react/prop-types": "warn", // Bu kuralı hata yerine uyarı olarak gösterir
      indent: ["error", 2], // Bu kuralı hata olarak gösterir ve 2 boşluklu girinti bekler
      "react/react-in-jsx-scope": "off", // React 17+ kullanıyorsanız bu kuralı kapatabilirsiniz
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
]);
