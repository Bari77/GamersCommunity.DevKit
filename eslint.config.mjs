import { gcAngular } from "@bari77/gc-lint";

export default gcAngular({
    prefix: ["gc", "gcd"],
    ignores: ["apps/docs/.astro/", "packages/create-game/", "src/"],
});
