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
