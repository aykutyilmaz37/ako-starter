// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'mari-ui-theme.ts'],
  },
  {
    rules: {
      // Metro tree-shaking yapmaz: kök barrel tüm bileşenleri pakete sokar. Alt yoldan import edin.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mari-ui/native',
              message: "Alt yoldan import edin, ör. '@mari-ui/native/button'.",
            },
          ],
        },
      ],
    },
  },
]);
