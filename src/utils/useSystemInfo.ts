/**
 * useSystemInfo
 *
 * 统一封装小程序「自定义导航栏 + 安全胶囊避让」所需的尺寸信息，
 * 消除每个页面里 try/catch + getMenuButtonBoundingClientRect 的样板。
 *
 * 返回值（全部为 px，rpx 自行换算）：
 *   statusBarHeight   - 状态栏高度
 *   safeBottom        - 底部安全区（iPhone Home Indicator）
 *   windowWidth       - 屏幕逻辑宽度
 *   menuButtonTop     - 微信胶囊距屏幕顶距离
 *   menuButtonHeight  - 微信胶囊高
 *   menuButtonLeft    - 微信胶囊左边 X
 *   navBarHeight      - 自定义导航栏推荐高度 = (top - statusBar)*2 + height，
 *                       让自定义内容与胶囊垂直居中对齐。
 *                       ⚠️ 仅 MP-WEIXIN 返回真实值；其他端返回 0，
 *                       由调用方根据值是否 > 0 决定是否应用 inline 高度
 *                       （H5/App 应让 CSS 自带的固定高度生效）。
 *   capsuleRightWidth - 顶部右侧应预留宽度 = windowWidth - menuButton.left + 8，
 *                       任何顶部右侧浮元素用它作 padding-right / right，
 *                       即可避免被胶囊盖住。
 *                       MP-WEIXIN：实测胶囊位置；
 *                       H5/App：按 MP 胶囊最小宽度 96px 预留，保持跨端右边距视觉一致。
 *
 * 用法：
 *   const { statusBarHeight, navBarHeight, capsuleRightWidth } = useSystemInfo();
 *   const navStyle = computed(() => {
 *     // #ifdef MP-WEIXIN
 *     return { height: navBarHeight.value + 'px', paddingRight: capsuleRightWidth.value + 'px' };
 *     // #endif
 *     // #ifndef MP-WEIXIN
 *     return {};
 *     // #endif
 *   });
 */

import { computed, ref } from 'vue';

export function useSystemInfo() {
  const statusBarHeight = ref(20);
  const safeBottom = ref(0);
  const windowWidth = ref(375);
  const menuButtonTop = ref(28);
  const menuButtonHeight = ref(32);
  const menuButtonLeft = ref(281);

  try {
    const info = uni.getSystemInfoSync();
    statusBarHeight.value = info.statusBarHeight || 20;
    safeBottom.value = info.safeAreaInsets?.bottom || 0;
    windowWidth.value = info.windowWidth || 375;
  } catch (_e) {
    // SSR / H5 非微信环境，落到默认值
  }

  // #ifdef MP-WEIXIN
  try {
    const mb = uni.getMenuButtonBoundingClientRect?.();
    if (mb && mb.height > 0) {
      menuButtonTop.value = mb.top;
      menuButtonHeight.value = mb.height;
      menuButtonLeft.value = mb.left;
    }
  } catch (_e) {
    // 模拟器/早期基础库可能拿不到，保留默认值
  }
  // #endif

  /**
   * 推荐的自定义导航栏可见高度 (不含状态栏)。胶囊在其中天然垂直居中。
   * 非微信小程序返回 0,表示「不要应用 inline 高度,让 CSS 默认值生效」。
   */
  const navBarHeight = computed((): number => {
    let v = 0;
    // #ifdef MP-WEIXIN
    v = Math.max(
      44,
      (menuButtonTop.value - statusBarHeight.value) * 2 + menuButtonHeight.value,
    );
    // #endif
    return v;
  });

  /**
   * 顶部右侧需为胶囊预留的最小宽度（含 8px 视觉间距），px。
   * MP-WEIXIN：按胶囊实测左缘 + 8 反推预留；
   * H5/App：返回 0；调用方应仅在 MP-WEIXIN 端把它写进 inline style，
   *         让 H5 保留 CSS 自身的右侧间距。
   */
  const capsuleRightWidth = computed((): number => {
    let v = 0;
    // #ifdef MP-WEIXIN
    v = Math.max(96, windowWidth.value - menuButtonLeft.value + 8);
    // #endif
    return v;
  });

  return {
    statusBarHeight,
    safeBottom,
    windowWidth,
    menuButtonTop,
    menuButtonHeight,
    menuButtonLeft,
    navBarHeight,
    capsuleRightWidth,
  };
}
