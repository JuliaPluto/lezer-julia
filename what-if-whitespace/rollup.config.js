import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: process.env.ROLLUP_IN,
  output: [
    {
      format: "cjs",
      file: process.env.ROLLUP_OUT + ".cjs",
    },
    {
      format: "es",
      file: process.env.ROLLUP_OUT + ".es.js",
    },
  ],
  external(id) {
    return !/^[\.\/]/.test(id);
  },
  plugins: [nodeResolve()],
};
