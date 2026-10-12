import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "frontend/src/main.ts",
  output: {
    file: "custom_components/heating_schedule/frontend/heating-schedule-card.js",
    format: "es",
    inlineDynamicImports: true,
  },
  plugins: [resolve(), typescript(), terser({ format: { comments: false } })],
};
