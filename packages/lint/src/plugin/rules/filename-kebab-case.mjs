import path from "node:path";

const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** @type {import("eslint").Rule.RuleModule} */
export default {
    meta: {
        type: "suggestion",
        docs: {
            description: "File names are kebab-case, with dot-separated kebab-case suffixes (foo-bar.service.ts).",
        },
        schema: [],
        messages: {
            name: "File name '{{name}}' must be kebab-case (e.g. game-type.model.ts).",
        },
    },
    create(context) {
        return {
            Program(program) {
                const name = path.basename(context.filename);
                const segments = name.replace(/\.(m|c)?[jt]s$/, "").split(".");
                if (segments.every((segment) => SEGMENT.test(segment))) {
                    return;
                }

                context.report({ node: program, loc: { line: 1, column: 0 }, messageId: "name", data: { name } });
            },
        };
    },
};
