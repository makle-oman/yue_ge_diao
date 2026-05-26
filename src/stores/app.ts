/**
 * 应用级 store
 *
 * 承载启动期拉到的 `/common/config`:
 *   - features: 特性开关(catches/spots/upload/oss/...)
 *   - upload: 上传约束(maxImageMB / accept)
 *   - dicts: 字典(钓龄段、水域类型等;前端 enum 兜底,后端覆盖即可)
 *   - serverTime: 服务端时间(用作 client clock skew 修正,本次先不用)
 *
 * 不持久化:config 每次 onLaunch 重拉,简单粗暴避免脏数据。
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { type AppConfig, fetchAppConfig } from '@/api/common';

export const useAppStore = defineStore('app', () => {
  const config = ref<AppConfig | null>(null);
  const loading = ref(false);
  const lastFetchedAt = ref(0);

  const features = computed<Record<string, boolean>>(
    () => config.value?.features ?? {},
  );

  /** 上传单文件大小上限(byte),没拉到 config 就用 10MB 默认 */
  const uploadMaxBytes = computed(
    () => (config.value?.upload.maxImageMB ?? 10) * 1024 * 1024,
  );

  const uploadAccept = computed(
    () => config.value?.upload.accept ?? ['image/jpeg', 'image/png', 'image/webp'],
  );

  function isFeatureEnabled(key: string): boolean {
    return features.value[key] === true;
  }

  async function fetchConfig(): Promise<AppConfig | null> {
    if (loading.value) return config.value;
    loading.value = true;
    try {
      const cfg = await fetchAppConfig();
      config.value = cfg;
      lastFetchedAt.value = Date.now();
      return cfg;
    } catch (e) {
      console.warn('[app] fetchConfig failed', e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    config,
    loading,
    lastFetchedAt,
    features,
    uploadMaxBytes,
    uploadAccept,
    isFeatureEnabled,
    fetchConfig,
  };
});
