/**
 * Pinia 入口
 *
 * - `setupPinia()` 在 main.ts 调一次,返回 pinia 实例
 * - 默认装上 `persistedStatePlugin`(新增 store 想持久化时 `{ persist: true }` 即可)
 * - 顶层 re-export 业务 store,页面统一从 `@/stores` 引入,避免内部路径暴露
 */

import { createPinia } from 'pinia';
import { persistedStatePlugin } from './persist';

export function setupPinia() {
  const pinia = createPinia();
  pinia.use(persistedStatePlugin);
  return pinia;
}

export { useAuthStore } from './auth';
export { useAppStore } from './app';
