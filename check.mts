import assert from "node:assert/strict";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("./") && !specifier.endsWith(".ts")) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { briefDescription, groupBoardForHorizon } = await import(
  "./src/utils/getBoardList.ts"
);
const { createDashboardTheme, getHorizonStyle } = await import(
  "./src/utils/constants.ts"
);

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

const defaultHz = getHorizonStyle({}) as Record<string, string>;
assert.equal(defaultHz["--hz-bg"], "#2563eb");
assert.equal(defaultHz["--hz-paper"], "#ffffff");
assert.equal(defaultHz["--hz-accent"], "#2563eb");
assert.equal(defaultHz["--hz-accent-fg"], "#ffffff");
assert.equal(defaultHz["--hz-ink"], "#0f172a");
assert.equal(defaultHz["--hz-rim"], "rgba(255, 255, 255, 0.85)");

const customHz = getHorizonStyle({
  horizon_background_color: "#ffffff",
  horizon_paper_color: "#1e293b",
  horizon_accent_color: "#facc15",
}) as Record<string, string>;
assert.equal(customHz["--hz-ink"], "#f8fafc");
assert.equal(customHz["--hz-accent-fg"], "#000000");
assert.equal(customHz["--hz-rim"], "rgba(15, 23, 42, 0.12)");

const hzTheme = JSON.parse(
  createDashboardTheme({
    theme: "horizon",
    background_color: "#A3B3C9",
    paper_color: "#f6f8fa",
    horizon_paper_color: "#1e293b",
    horizon_accent_color: "#dc2626",
  })._theme
);
assert.equal(hzTheme.background_color, "#1e293b");
assert.equal(hzTheme.primary_button_color, "#dc2626");
assert.equal(hzTheme.tile_text_color, "#ffffff");
