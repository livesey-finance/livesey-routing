import js from "@eslint/js";
import google from "eslint-config-google";
import prettier from "eslint-config-prettier";

const combinedRules = {
  ...google.rules,
  "require-jsdoc": "off",
  "valid-jsdoc": "off",
  "quotes": ["error", "double"],
  "indent": ["error", 2],
  "max-len": ["error", { code: 100 }],
  ...prettier.rules,
};

export default [
  {
    ...js.configs.recommended,
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },
    rules: combinedRules,
  },
];
