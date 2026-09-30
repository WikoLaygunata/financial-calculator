import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

/**
 * Konfigurasi ESLint (flat config).
 *
 * Adanya file ini penting bukan hanya untuk menyalakan lint, tapi juga untuk
 * MEMBATASI-nya: tanpa config lokal, ekstensi editor bisa memakai preset
 * bawaannya sendiri dan membanjiri semua file dengan peringatan gaya penulisan.
 *
 * Pembagiannya:
 * - Aturan yang menangkap BUG tetap menyala (essential + recommended).
 * - Aturan yang hanya mengatur FORMAT dimatikan, karena formatting ditangani
 *   editor/Prettier dan aturan-aturan itu bertabrakan dengan class Tailwind
 *   yang memang panjang dan ditulis multi-baris.
 */
export default [
  {
    name: 'financi/ignores',
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.ssr-tmp/**'],
  },

  {
    name: 'financi/js-recommended',
    ...js.configs.recommended,
  },

  ...pluginVue.configs['flat/recommended'],

  {
    name: 'financi/language',
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      /*
       * Diteruskan eksplisit ke vue-eslint-parser. Ekspresi di dalam <template>
       * diparsing memakai parserOptions ini; kalau ecmaVersion-nya tertinggal di
       * bawah 2021, fitur seperti numeric separator (1_000_000) akan dilaporkan
       * sebagai "Parsing error: Identifier directly after number".
       */
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2025,
      },
    },
  },

  {
    name: 'financi/rules',
    files: ['**/*.{js,mjs,vue}'],
    rules: {
      /* ---- Aturan yang menangkap bug: dinaikkan ke error ---- */
      'no-unused-vars': [
        'error',
        { args: 'after-used', caughtErrors: 'none', ignoreRestSiblings: true },
      ],
      'vue/no-unused-properties': ['error', { groups: ['props'] }],
      'vue/no-unused-refs': 'error',
      'vue/no-undef-components': 'off', // komponen selalu diimpor eksplisit lewat <script setup>
      'vue/require-explicit-emits': 'error',
      'vue/no-v-html': 'error', // kita tidak pernah merender HTML mentah
      eqeqeq: ['error', 'smart'],
      'vue/eqeqeq': ['error', 'smart'], // eqeqeq inti tidak memeriksa ekspresi di <template>
      'prefer-const': 'error',

      /* ---- Format/kosmetik: dimatikan, bukan urusan linter di proyek ini ---- */
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/attributes-order': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
    },
  },
]
