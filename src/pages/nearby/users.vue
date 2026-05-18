<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">附近钓友</text>
      <text class="placeholder-desc">LBS 钓友列表（列表/地图视图）+ 距离 + 活跃度排序</text>
      <text class="placeholder-desc">需求文档: 约个钓-需求文档-v1.md F6</text>
    </view>
  </view>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
@import '@/uni.scss';
.page { min-height: 100vh; background: $bg-page; padding: $space-md; }
.placeholder-block { display: flex; flex-direction: column; gap: $space-sm; }
.placeholder-title { font-size: $font-xl; font-weight: 600; color: $primary; }
.placeholder-desc { font-size: $font-sm; color: $text-secondary; }
</style>
