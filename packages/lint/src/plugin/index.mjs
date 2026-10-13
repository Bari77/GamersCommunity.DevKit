import filenameKebabCase from "./rules/filename-kebab-case.mjs";
import noProvidedInRoot from "./rules/no-provided-in-root.mjs";
import oneTypePerFile from "./rules/one-type-per-file.mjs";
import privateStateSignals from "./rules/private-state-signals.mjs";

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
    meta: {
        name: "@bari77/eslint-plugin-gc",
    },
    rules: {
        "filename-kebab-case": filenameKebabCase,
        "no-provided-in-root": noProvidedInRoot,
        "one-type-per-file": oneTypePerFile,
        "private-state-signals": privateStateSignals,
    },
};

export default plugin;
