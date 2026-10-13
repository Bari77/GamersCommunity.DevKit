/** @type {import("prettier").Config} */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    endOfLine: "lf",
    htmlWhitespaceSensitivity: "ignore",
    embeddedLanguageFormatting: "auto",
    quoteProps: "as-needed",
    proseWrap: "preserve",
    singleAttributePerLine: false,
    overrides: [
        {
            files: "*.html",
            options: {
                parser: "angular",
            },
        },
        {
            files: ["*.yml", "*.yaml"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};

export default config;
