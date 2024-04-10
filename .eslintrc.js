module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'angular', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:angular/johnpapa',
    'prettier',
  ],
  rules: {
    "semi": ["error", "always"],
    "no-console": "warn",
    "no-unused-vars": ["error", {"args": "none"}],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_",
      },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {"selector": "variable", "format": ["camelCase", "UPPER_CASE"]},
      {"selector": "function", "format": ["camelCase"]},
      {"selector": "interface", "format": ["PascalCase"]}
    ],
    "@typescript-eslint/no-unused-vars": ["error", {
      "vars": "all",
      "args": "after-used",
      "ignoreRestSiblings": false
    }],
    'angular/controller-as-vm': ['error', 'never'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
