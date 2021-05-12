module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],

  parserOptions: {
    ecmaVersion: 2020,
  },

  rules: {
    semi: [2, 'always'],
    /* Disabled */
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'class-methods-use-this': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'import/order': 'off',
    'no-useless-constructor': 'off',
    'lines-between-class-members': 'off',
    'import/prefer-default-export': 'off',
    'no-implicit-any': 'off',
    'no-param-reassign': 'off',
    'linebreak-style': 'off',

    /* Vue specific */
    'vue/dot-location': ['error', 'property'],
    'vue/eqeqeq': ['error', 'always'],
    'vue/html-closing-bracket-spacing': 2,
    'vue/html-closing-bracket-newline': 2,
    'vue/html-indent': 2,
    'vue/html-quotes': 2,
    'vue/html-self-closing': 2,
    'vue/key-spacing': 2,
    'vue/keyword-spacing': 2,
    'vue/multiline-html-element-content-newline': 2,
    'vue/mustache-interpolation-spacing': 2,
    'vue/valid-v-slot': 'off',
  },

  plugins: [
    'only-warn',
  ],

  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],

  overrides: [
    {
      "files": ["*.stories.js"],
      "rules": {
        "no-multiple-empty-lines": "off",
        "indent": "off"
      }
    }
  ]
};
