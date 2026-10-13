import angular from "angular-eslint";
import tseslint from "typescript-eslint";
import gc from "./plugin/index.mjs";

export { default as gcPlugin } from "./plugin/index.mjs";

const DEFAULT_IGNORES = [
    "**/.angular/",
    "**/dist/",
    "**/node_modules/",
    "**/coverage/",
    "**/.gc-workspace/",
    "**/*.mjs",
    "**/*.js",
    "**/*.d.ts",
];

const NAMING_CONVENTION = [
    "error",
    {
        selector: "default",
        format: ["camelCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "variable",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
    },
    {
        selector: "function",
        format: ["camelCase"],
    },
    {
        selector: "parameter",
        format: ["camelCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "typeLike",
        format: ["PascalCase"],
    },
    {
        selector: "typeParameter",
        format: ["PascalCase", "camelCase"],
        prefix: ["T", "K"],
    },
    {
        selector: "enumMember",
        format: ["UPPER_CASE", "PascalCase"],
    },
    {
        selector: "classProperty",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
    },
    {
        selector: ["objectLiteralProperty", "typeProperty"],
        format: null,
    },
    {
        selector: "import",
        format: null,
    },
];

/**
 * GamersCommunity Angular front rules (Platform shell, game remotes, DevKit libraries).
 *
 * @param {object} [options]
 * @param {string | string[]} [options.prefix] Component / directive selector prefix(es): "app", "wow", "lol", "gc"...
 * @param {boolean} [options.remote] Game remote: services must not be providedIn root.
 * @param {string[]} [options.ignores] Extra ignore globs.
 */
export function gcAngular(options = {}) {
    const { prefix, remote = false, ignores = [] } = options;
    const selectorRules = prefix
        ? {
              "@angular-eslint/component-selector": ["error", { type: "element", prefix, style: "kebab-case" }],
              "@angular-eslint/directive-selector": ["error", { type: "attribute", prefix, style: "camelCase" }],
          }
        : {
              "@angular-eslint/component-selector": "off",
              "@angular-eslint/directive-selector": "off",
          };

    return tseslint.config(
        {
            ignores: [...DEFAULT_IGNORES, ...ignores],
        },
        {
            files: ["**/*.ts"],
            extends: [...tseslint.configs.recommended, ...angular.configs.tsRecommended],
            processor: angular.processInlineTemplates,
            plugins: { gc },
            rules: {
                ...selectorRules,
                "@angular-eslint/no-output-on-prefix": "off",
                "@angular-eslint/no-output-native": "off",
                "@angular-eslint/no-input-rename": "off",
                "@angular-eslint/no-inputs-metadata-property": "off",
                "@angular-eslint/no-outputs-metadata-property": "off",
                "@angular-eslint/prefer-standalone": "error",
                "@angular-eslint/prefer-signals": "error",
                "@angular-eslint/consistent-component-styles": ["error", "string"],
                "@angular-eslint/component-max-inline-declarations": [
                    "error",
                    { template: 0, styles: 0, animations: 30 },
                ],

                "@typescript-eslint/array-type": ["error", { default: "array" }],
                "@typescript-eslint/consistent-type-definitions": "error",
                "@typescript-eslint/consistent-type-imports": ["error", { prefer: "no-type-imports" }],
                "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
                "@typescript-eslint/explicit-function-return-type": "error",
                "@typescript-eslint/member-ordering": "error",
                "@typescript-eslint/naming-convention": NAMING_CONVENTION,
                "@typescript-eslint/no-empty-interface": "off",
                "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-unused-vars": [
                    "error",
                    { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
                ],

                "gc/filename-kebab-case": "error",
                "gc/one-type-per-file": "error",
                "gc/private-state-signals": "error",
                "gc/no-provided-in-root": remote ? "error" : "off",
            },
        },
        {
            files: ["**/app.ts", "**/app.component.ts"],
            rules: {
                "@angular-eslint/component-selector": "off",
            },
        },
        {
            files: ["**/*.html"],
            extends: [...angular.configs.templateRecommended],
            rules: {
                "@angular-eslint/template/prefer-control-flow": "error",
                "@angular-eslint/template/prefer-self-closing-tags": "error",
                "@angular-eslint/template/no-inline-styles": ["error", { allowBindToStyle: true, allowNgStyle: false }],
            },
        },
    );
}

export default gcAngular;
