<template>
  <view class="profile-page">
    <view class="placeholder-block">
      <text class="placeholder-title">我的 (Tab 5)</text>
      <text class="placeholder-desc">用户卡片 + 数据统计 + 鱼库成就墙 + 功能列表</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 6 章</text>
    </view>

    <!-- TODO: 顶部用户卡片（渐变背景 + 头像 + 昵称 + 标签） -->
    <!-- TODO: 数据统计卡（钓点/鱼获/最大记录） -->
    <!-- TODO: 鱼库成就墙 -->
    <!-- TODO: 功能列表 -->

    <CustomTabBar current="profile" />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/CustomTabBar.vue';
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile-page {
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
