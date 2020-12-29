module.exports = {
  plugins: [
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        // caller.target 等于 webpack 配置的 target 选项
        targets: { chrome: "58", ie: "11" },
      },
    ],
  ],
};
