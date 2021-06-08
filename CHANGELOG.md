# [2.1.0](https://github.com/posva/vue-promised/compare/v2.0.3...v2.1.0) (2021-06-08)

- Update vue-demi

## [2.0.3](https://github.com/posva/vue-promised/compare/v2.0.2...v2.0.3) (2021-02-02)

### Bug Fixes

- fix npm install ([40931b6](https://github.com/posva/vue-promised/commit/40931b636aed17132b0b2fc39bfff3a8199aab73))

## [2.0.2](https://github.com/posva/vue-promised/compare/v2.0.1...v2.0.2) (2020-11-21)

### Bug Fixes

- **build:** global builds for vue 2 ([45e42e8](https://github.com/posva/vue-promised/commit/45e42e899abd62e9b7dfe6222c921d666297cfb5))
- **build:** use vue demi as global ([014253e](https://github.com/posva/vue-promised/commit/014253e415af3a923541a4fdba5b80d85d2ea723))

### Features

- use warn if possible ([1d06e7c](https://github.com/posva/vue-promised/commit/1d06e7c2ccb54e51c5cc2018fe8c7a9cf66e819e))

## [2.0.1](https://github.com/posva/vue-promised/compare/v2.0.0...v2.0.1) (2020-11-21)

Fix build for Vue 2

# [2.0.0](https://github.com/posva/vue-promised/compare/1.2.2...2.0.0) (2020-11-16)

New Release

BREAKING CHANGES: Browser ESM build removed, Global build (iife) replaced with 2 builds:

- `dist/vue-promised-global-vue-2.js` / `dist/vue-promised-global-vue-2.prod.js`: for Vue 2. Requires `VueCompositionAPI` as a global
- `dist/vue-promised-global-vue-3.js` / `dist/vue-promised-global-vue-3.prod.js`: for Vue 3. Requires `Vue` as a global

Both require [vue-demi](https://github.com/antfu/vue-demi) (can be added through any CDN).

By default vue-promised will point to the Vue 2 version on CDNs.

Vue Promised now supports both Vue 2 and Vue 3 but requires [Vue composition API](https://github.com/vuejs/composition-api) if you are using Vue 2. If you don't want to add this library to your application, you can keep using the v1, which is stable but does not expose `usePromise`.
