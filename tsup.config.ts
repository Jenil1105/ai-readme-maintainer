import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  platform: "node",
  bundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: [/@google\/genai/, /@actions\/core/, /@actions\/github/, /@octokit\/rest/],
});