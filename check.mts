import assert from "node:assert/strict";
import { briefDescription, groupBoardForHorizon } from "./src/utils/getBoardList.ts";

assert.equal(briefDescription(null), "");
assert.equal(briefDescription("   \n\t  "), "");
assert.equal(briefDescription("  Short   note "), "Short note");
assert.equal(briefDescription("abcdefghij", 5), "abcde…");

const grouped = groupBoardForHorizon([
  { id: "s0", type: "section", title: "Showcase", description: "Custom apps." },
  { id: "s1", type: "section", title: "thelook Pulse", description: "Executive commerce suites" },
  { id: "386", type: "dashboard", title: "TheLook Etch A Sketch" },
  { id: "s2", type: "section", title: "Section" },
  { id: "400", type: "dashboard", title: "Pulse" },
]);

assert.equal(grouped.subtitle, "Custom apps.");
assert.equal(grouped.groups.length, 2);
assert.equal(grouped.groups[0].title, "thelook Pulse");
assert.equal(grouped.groups[0].description, "Executive commerce suites");
assert.equal(grouped.groups[0].items[0].id, "386");
assert.equal(grouped.groups[1].title, undefined);
assert.equal(grouped.groups[1].items[0].id, "400");
