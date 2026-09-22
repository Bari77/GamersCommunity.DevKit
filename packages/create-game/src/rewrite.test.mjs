import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveNames, rewriteTemplateContent } from "./index.mjs";

const lol = { ...deriveNames("LeagueOfLegends"), FrontPort: "4203", GatewayPort: "8083" };

test("keeps Angular templateUrl", () => {
  assert.equal(
    rewriteTemplateContent('templateUrl: "./home-container.component.html"', lol),
    'templateUrl: "./home-container.component.html"',
  );
});

test("keeps ng-template", () => {
  assert.equal(
    rewriteTemplateContent("<ng-template #menu></ng-template>", lol),
    "<ng-template #menu></ng-template>",
  );
});

test("keeps inline template: and rewrites Pascal identity", () => {
  const out = rewriteTemplateContent("@Component({ template: `<p>Template Playground</p>` })", lol);
  assert.match(out, /template:/);
  assert.match(out, /LeagueOfLegends Playground/);
});

test("rewrites template.front project id", () => {
  assert.equal(
    rewriteTemplateContent('"template.front:serve-original"', lol),
    '"leagueoflegends.front:serve-original"',
  );
});

test("does not smash babel template in package-lock", () => {
  const src =
    '{"name":"template.front","@babel/template":"^7.29.7","resolved":"https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz"}';
  const out = rewriteTemplateContent(src, lol, "package-lock.json");
  assert.match(out, /"name":"leagueoflegends\.front"/);
  assert.match(out, /@babel\/template/);
  assert.match(out, /template-7\.29\.7/);
});
