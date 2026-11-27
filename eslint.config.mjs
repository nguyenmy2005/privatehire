import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Ranh giới MVC — xem CONTRIBUTING.md
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", {
        patterns: [{ group: ["@/models/*"], allowTypeImports: true, message: "View chỉ được import *type* từ Model. Gọi dữ liệu qua @/controllers/*." }],
      }],
    },
  },
  {
    files: ["models/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", {
        patterns: [{ group: ["@/controllers/*", "@/components/*", "@/app/*", "../controllers/*"], message: "Model không được phụ thuộc Controller hay View." }],
      }],
    },
  },
  {
    files: ["controllers/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", {
        patterns: [{ group: ["@/components/*", "@/app/*", "react", "react-dom", "next/*"], message: "Controller không được đụng tới UI." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
