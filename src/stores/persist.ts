/**
 * Pinia 持久化插件 — uni-app storage 适配
 *
 * 为什么不直接用 `pinia-plugin-persistedstate`:
 *   官方插件默认走 `localStorage`,小程序端无此 API。
 *   uni-app 三端通用的 KV 是 `uni.setStorageSync` / `uni.getStorageSync`,
 *   所以这里写一个 30 行的轻量替代,语义保持一致即可。
 *
 * 用法:
 *   defineStore('app', () => { ... }, { persist: true })
 *   defineStore('app', () => { ... }, { persist: { key: 'custom', paths: ['config'] } })
 *
 * 注意:
 *   - 写在 store 内部用 setToken/setUser 这种"显式落 storage"的 store
 *     (例如 useAuthStore 复用 `utils/auth` 的兼容 key)可以 **不开 persist**;
 *     新增的纯响应式 store(useAppStore 等)推荐用本插件统一管理。
 */

import type { PiniaPluginContext } from 'pinia';

export interface PersistOptions {
  /** storage key,默认 `pinia_<storeId>` */
  key?: string;
  /** 需要持久化的字段名(白名单);不填 = 全 state 持久化 */
  paths?: string[];
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions | boolean;
  }
}

function readStorage(key: string): unknown {
  try {
    const raw = uni.getStorageSync(key);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value));
  } catch {
    // 容量满或被禁,忽略
  }
}

export function persistedStatePlugin(ctx: PiniaPluginContext): void {
  const opts = ctx.options.persist;
  if (!opts) return;
  const cfg: PersistOptions = typeof opts === 'object' ? opts : {};
  const key = cfg.key ?? `pinia_${ctx.store.$id}`;
  const paths = cfg.paths;

  // ─── 恢复
  const saved = readStorage(key);
  if (saved && typeof saved === 'object') {
    ctx.store.$patch(saved as Parameters<typeof ctx.store.$patch>[0]);
  }

  // ─── 订阅
  ctx.store.$subscribe(
    (_mutation, state) => {
      const toSave = paths
        ? paths.reduce<Record<string, unknown>>((acc, p) => {
            acc[p] = (state as Record<string, unknown>)[p];
            return acc;
          }, {})
        : (state as Record<string, unknown>);
      writeStorage(key, toSave);
    },
    { detached: true },
  );
}
