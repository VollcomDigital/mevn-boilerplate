import eslint from "@eslint/js";
import vue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.vue"],
    ...tseslint.configs.disableTypeChecked
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.output/**",
      "**/.nuxt/**",
      "**/.turbo/**",
      "**/.cache/**",
      "**/.strapi/**",
      "**/coverage/**"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"]
        }
      ]
    }
  }
);
