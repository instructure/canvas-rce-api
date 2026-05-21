"use strict";

const js = require("@eslint/js");
const globals = require("globals");
const mocha = require("eslint-plugin-mocha");
const security = require("eslint-plugin-security");
const prettier = require("eslint-config-prettier");

const mochaPlugin = mocha.default || mocha;

module.exports = [
  js.configs.recommended,
  security.configs.recommended,
  {
    files: ["app/**/*.js", "test/**/*.js", "shared/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.es2022,
      },
    },
    plugins: {
      mocha: mochaPlugin,
      security,
    },
    rules: {
      strict: 0,
      "mocha/no-exclusive-tests": 2,
      "mocha/handle-done-callback": 2,
      "mocha/no-global-tests": 2,
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
