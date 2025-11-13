//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
  ...tanstackConfig,
  {
    "parser": "@typescript-eslint/parser",
    "plugins": ["solid"],
    "extends": ["eslint:recommended", "plugin:solid/typescript"]
  }
];
