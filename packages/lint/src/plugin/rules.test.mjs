import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import plugin from "./index.mjs";

const tester = new RuleTester({
    languageOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2022,
        sourceType: "module",
    },
});

tester.run("one-type-per-file", plugin.rules["one-type-per-file"], {
    valid: [
        { code: "export class Foo {}\nexport type FooKind = 'a' | 'b';" },
        { code: "export interface FooDto { id: number; }" },
    ],
    invalid: [
        {
            code: "export class LfgChatService {}\n@Injectable()\nexport class PostableTeamsService {}",
            errors: [{ messageId: "extra" }],
        },
        {
            code: "export interface ADto {}\ninterface BDto {}\nexport enum C { X }",
            errors: [{ messageId: "extra" }, { messageId: "extra" }],
        },
    ],
});

tester.run("filename-kebab-case", plugin.rules["filename-kebab-case"], {
    valid: [
        { code: "", filename: "/src/game-type.model.ts" },
        { code: "", filename: "/src/widget-registry.editor.ts" },
    ],
    invalid: [
        { code: "", filename: "/src/gameType.model.ts", errors: [{ messageId: "name" }] },
        { code: "", filename: "/src/Foo_bar.ts", errors: [{ messageId: "name" }] },
    ],
});

tester.run("private-state-signals", plugin.rules["private-state-signals"], {
    valid: [
        {
            code: "class S { private readonly $rows = signal([]); public readonly rows = computed(() => 1); }",
            filename: "/x/a.store.ts",
        },
        { code: "class C { public readonly open = signal(false); }", filename: "/x/a.component.ts" },
    ],
    invalid: [
        {
            code: "class S { public readonly rows = signal([]); }",
            filename: "/x/a.store.ts",
            errors: [{ messageId: "state" }],
        },
        {
            code: "class S { private readonly busy = signal(false); }",
            filename: "/x/a.service.ts",
            errors: [{ messageId: "state" }],
        },
    ],
});

tester.run("no-provided-in-root", plugin.rules["no-provided-in-root"], {
    valid: [{ code: "@Injectable() class S {}" }],
    invalid: [{ code: "@Injectable({ providedIn: 'root' }) class S {}", errors: [{ messageId: "root" }] }],
});
