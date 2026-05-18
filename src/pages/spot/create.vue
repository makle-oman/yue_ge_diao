<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">上报新钓点</text>
      <text class="placeholder-desc">名称 + 位置（强制现场定位）+ 类型 + 水域 + 鱼种 + 实用信息 + 照片</text>
      <text class="placeholder-desc">设计文档: 约个钓-需求文档-v1.md F2.3</text>
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
