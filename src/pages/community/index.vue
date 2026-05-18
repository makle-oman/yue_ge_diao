<template>
  <view class="community-page">
    <view class="placeholder-block">
      <text class="placeholder-title">社区 Feed (Tab 2)</text>
      <text class="placeholder-desc">顶部 Tab 切换（推荐/附近/关注）+ 鱼获瀑布流</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 3 章</text>
    </view>

    <!-- TODO: 顶部 Tab 切换 -->
    <!-- TODO: 双列瀑布流 Feed -->

    <CustomTabBar current="community" />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/CustomTabBar.vue';
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.community-page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: calc($tabbar-height + env(safe-area-inset-bottom));
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
