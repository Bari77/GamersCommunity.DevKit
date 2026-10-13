const WRITABLE_SIGNALS = new Set(["signal", "linkedSignal"]);
const STATE_FILES = /\.(store|service)\.ts$/;

function isWritableSignal(value) {
    return (
        value?.type === "CallExpression" &&
        value.callee.type === "Identifier" &&
        WRITABLE_SIGNALS.has(value.callee.name)
    );
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Stores and services keep writable signals private and $-prefixed; expose them through computed() or asReadonly().",
        },
        schema: [],
        messages: {
            state: "Writable signal '{{name}}' must be `private readonly ${{bare}}` and exposed through computed() / asReadonly().",
        },
    },
    create(context) {
        if (!STATE_FILES.test(context.filename)) {
            return {};
        }

        return {
            PropertyDefinition(node) {
                if (!isWritableSignal(node.value) || node.key.type !== "Identifier") {
                    return;
                }

                const name = node.key.name;
                if (node.accessibility === "private" && name.startsWith("$")) {
                    return;
                }

                context.report({ node: node.key, messageId: "state", data: { name, bare: name.replace(/^\$/, "") } });
            },
        };
    },
};
