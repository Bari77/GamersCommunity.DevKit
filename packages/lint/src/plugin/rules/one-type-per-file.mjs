const TYPE_NODES = new Set(["ClassDeclaration", "TSInterfaceDeclaration", "TSEnumDeclaration"]);

function unwrap(statement) {
    if (statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration") {
        return statement.declaration;
    }
    return statement;
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
    meta: {
        type: "suggestion",
        docs: {
            description: "A file declares a single top-level class, interface or enum.",
        },
        schema: [],
        messages: {
            extra: "'{{name}}' must live in its own file (one class / interface / enum per file, first is '{{first}}').",
        },
    },
    create(context) {
        return {
            Program(program) {
                const declarations = program.body.map(unwrap).filter((node) => node && TYPE_NODES.has(node.type));
                if (declarations.length < 2) {
                    return;
                }

                const first = declarations[0].id?.name ?? "default";
                for (const node of declarations.slice(1)) {
                    context.report({
                        node: node.id ?? node,
                        messageId: "extra",
                        data: { name: node.id?.name ?? "default", first },
                    });
                }
            },
        };
    },
};
