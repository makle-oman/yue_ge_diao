<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("[约个钓] App Launch");
});

onShow(() => {
  console.log("[约个钓] App Show");
});

onHide(() => {
  console.log("[约个钓] App Hide");
});
</script>

<style lang="scss">
/* 全局原子工具类（直接在所有页面使用 class="flex items-center gap-sm ..."） */
@import "./styles/utilities.scss";

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
