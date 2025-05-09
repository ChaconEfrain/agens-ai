import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": [
        "error",
        {
          singleQuote: true,
          trailingComma: "all",
          semi: false,
          printWidth: 80,
          tabWidth: 2,
          endOfLine: "auto",
        },
      ],
      "react/no-escape-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  }),
];

export default eslintConfig;
