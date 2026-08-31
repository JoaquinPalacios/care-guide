import babelParser from "@babel/eslint-parser";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig, globalIgnores } from "eslint/config";

const nextCoreWebVitals = nextPlugin.configs["core-web-vitals"];

// eslint-config-next still loads typescript-eslint 8.x, which crashes on
// TypeScript 7 (no ts.Extension). Use the Next plugin + Babel TS parsing.
const eslintConfig = defineConfig([
  {
    name: "care-guide/next",
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: nextCoreWebVitals.plugins,
    rules: nextCoreWebVitals.rules,
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: {
            plugins: ["typescript", "jsx"],
          },
        },
      },
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
