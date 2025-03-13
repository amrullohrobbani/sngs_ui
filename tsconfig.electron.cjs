// tsconfig.electron.cjs
module.exports = {
  extends: "./tsconfig.json",
  compilerOptions: {
    module: "commonjs",
    noEmit: false,
    outDir: "./dist-electron"
  },
  include: ["electron/**/*.ts"]
};
