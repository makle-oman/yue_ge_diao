/**
 * useSystemInfo
 *
 * 统一获取状态栏高度 + 底部安全区域，消除每个页面里都要写的 try/catch 样板：
 *
 *   const statusBarHeight = ref(0);
 *   try { statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20; }
 *   catch (_e) { statusBarHeight.value = 20; }
 *
 * 用法：
 *   import { useSystemInfo } from '@/utils/useSystemInfo';
 *   const { statusBarHeight, safeBottom } = useSystemInfo();
 */

import { ref } from 'vue';

export function useSystemInfo() {
  const statusBarHeight = ref(20);
  const safeBottom = ref(0);

  try {
    const info = uni.getSystemInfoSync();
    statusBarHeight.value = info.statusBarHeight || 20;
    safeBottom.value = info.safeAreaInsets?.bottom || 0;
  } catch (_e) {
    // SSR / H5 等非小程序环境，落到默认值
  }

  return { statusBarHeight, safeBottom };
}
