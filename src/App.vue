<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { fetchAppConfig } from "@/api/common";

onLaunch(async () => {
  console.log("[约个钓] App Launch");
  // 启动即拉一次 /common/config：拉到当前服务端版本、特性开关、上传约束、字典等
  // 失败不阻塞 UI（showErrorToast: false），让用户在弱网下仍能进入应用
  try {
    const cfg = await fetchAppConfig();
    console.log("[约个钓] config loaded:", cfg);
    // 后续可挂到 pinia store / globalProperties
  } catch (e) {
    console.warn("[约个钓] config load failed", e);
  }
});

onShow(() => {
  console.log("[约个钓] App Show");
});

onHide(() => {
  console.log("[约个钓] App Hide");
});
</script>

<style lang="scss">
/* Material Symbols Outlined 子集字体 (base64 内联,启动即可用,零网络请求) */
@import "./styles/icon-font.scss";

/* 全局原子工具类（直接在所有页面使用 class="flex items-center gap-sm ..."） */
@import "./styles/utilities.scss";

/**
 * 全局 box-sizing: border-box
 *
 * 不用通配符 *,因为微信小程序对 * 选择器有警告/报错;改成枚举 uni-app
 * 内置标签选择器,uni-app 编译时会自动在 H5 端把 view 等重写为 uni-view,
 * 所以一份代码三端通吃。新增 uni-app 内置组件时按需在这里补一行。
 */
page, view, scroll-view, swiper, swiper-item, cover-view, cover-image,
text, image, button, input, textarea, navigator,
picker, picker-view, picker-view-column,
radio, radio-group, checkbox, checkbox-group, switch, slider,
label, form, icon, rich-text, progress,
movable-view, movable-area, map, video, audio, web-view {
  box-sizing: border-box;
}

page {
  background-color: $bg-page;
  color: $text-primary;
  font-size: $font-base;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
}

/* 卡片基类（直接用 class="card"，不走 mixin） */
.card {
  background-color: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-base;
}
</style>
