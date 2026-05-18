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
/* 全局样式 */
@import "./uni.scss";

page {
  background-color: $bg-page;
  color: $text-primary;
  font-size: $font-base;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
}

/* 通用工具类 */
.flex {
  display: flex;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-col {
  display: flex;
  flex-direction: column;
}

.text-primary { color: $text-primary; }
.text-regular { color: $text-regular; }
.text-secondary { color: $text-secondary; }
.text-accent { color: $accent; }
.text-brand { color: $primary; }

.bg-card { background-color: $bg-card; }
.bg-page { background-color: $bg-page; }

.card {
  background-color: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-base;
}

.divider {
  height: 1rpx;
  background-color: $border-light;
}

/* 单行省略 */
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 多行省略 */
.ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
