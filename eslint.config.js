import js from "@eslint/js";
import globals from "globals";
import mocha from "eslint-plugin-mocha";
import security from "eslint-plugin-security";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

const mochaPlugin = mocha.default || mocha;

export default [
  js.configs.recommended,
  security.configs.recommended,
  {
    files: ["app/**/*.js", "test/**/*.js", "shared/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.es2022,
      },
    },
    plugins: {
      mocha: mochaPlugin,
      security,
      import: importPlugin,
    },
    rules: {
      strict: 0,
      "mocha/no-exclusive-tests": 2,
      "mocha/handle-done-callback": 2,
      "mocha/no-global-tests": 2,
      "import/newline-after-import": ["error", { count: 1 }],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      "eol-last": ["error", "always"],
      // Allow intentionally unused identifiers when prefixed with `_`.
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  // TODO: address these pre-existing violations in a follow-up commit and
  // remove the per-file overrides below.
  {
    files: [
      "app/api/file.js",
      "app/api/images.js",
      "app/utils/fetch.js",
      "test/service/application.test.js",
    ],
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    files: ["app/utils/search.js"],
    rules: {
      "no-undef": "off",
    },
  },
  prettier,
];
