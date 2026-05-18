<template>
  <view class="home-page">
    <!-- TODO: 顶部搜索栏（城市选择 + 搜索框 + 消息铃铛） -->
    <view class="placeholder-block">
      <text class="placeholder-title">钓点首页 (Tab 1)</text>
      <text class="placeholder-desc">地图主体 + 宜钓指数浮卡 + 底部钓点抽屉</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 2 章</text>
    </view>

    <!-- TODO: 全屏地图 -->
    <!-- TODO: 右上角宜钓指数胶囊浮卡 -->
    <!-- TODO: 右下角浮动按钮（定位 + 上报钓点） -->
    <!-- TODO: 底部上拉抽屉（附近钓点列表） -->

    <!-- 自定义 TabBar -->
    <CustomTabBar current="home" />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/CustomTabBar.vue';
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.home-page {
  min-height: 100vh;
  background: $bg-page;
}

.placeholder-block {
  padding: $space-lg $space-md;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}
.placeholder-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $primary;
}
.placeholder-desc {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
