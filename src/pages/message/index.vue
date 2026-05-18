<template>
  <view class="message-page">
    <view class="placeholder-block">
      <text class="placeholder-title">消息中心 (Tab 4)</text>
      <text class="placeholder-desc">4 个功能入口（评论/赞/组队/系统）+ 最近互动列表</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 5 章</text>
    </view>

    <!-- TODO: 4 个互动入口 -->
    <!-- TODO: 最近互动列表 -->

    <CustomTabBar current="message" />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/CustomTabBar.vue';
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.message-page {
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
