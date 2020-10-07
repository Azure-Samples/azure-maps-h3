// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier/@typescript-eslint",
  ],
  rules: {
    "react/prop-types": [0],
    "@typescript-eslint/no-explicit-any": "off",
  },
};
