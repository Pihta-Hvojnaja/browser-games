import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module', // поддержка import/export
      globals: {
        ...globals.browser, // глобальные переменные браузера (window, document и т.д.)
        ...globals.es2021, // современные возможности JS
      }
    },
    rules: {
      // Возможные ошибки
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // предупреждать о неиспользуемых переменных
      'no-undef': 'error', // ошибка при использовании необъявленных переменных
      'no-constant-condition': 'warn', // предупреждать о постоянных условиях в if/while

      // Лучшие практики
      'eqeqeq': ['error', 'always'], // требовать строгое равенство (=== вместо ==)
      'no-implicit-coercion': 'warn', // предупреждать о неявных преобразованиях (!!foo, +bar)

      // Стилистические правила (опционально, можно настроить под себя)
      'semi': ['error', 'always'], // точка с запятой обязательна
      'quotes': ['error', 'single'], // одинарные кавычки
      'indent': ['error', 2], // отступ 2 пробела
      'comma-dangle': ['error', 'never'], // без висячих запятых
    }
  },
  // Игнорируемые файлы и папки
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js']
  }
];

