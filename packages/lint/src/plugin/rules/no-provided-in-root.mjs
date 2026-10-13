/** @type {import("eslint").Rule.RuleModule} */
export default {
    meta: {
        type: "problem",
        docs: {
            description:
                "Game remotes register services on the remote routes / app config (provideGameRemoteKernel), never providedIn root.",
        },
        schema: [],
        messages: {
            root: 'Game remote services must not use providedIn: "root"; provide them on the exported routes / app config.',
        },
    },
    create(context) {
        return {
            "Decorator[expression.callee.name='Injectable'] Property[key.name='providedIn'][value.value='root']"(node) {
                context.report({ node, messageId: "root" });
            },
        };
    },
};
