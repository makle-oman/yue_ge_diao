<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">发布鱼获</text>
      <text class="placeholder-desc">9 宫格图片 + 鱼种 + 重量长度 + 钓点 + 饵料钓法 + 隐私选项</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 7.3 节</text>
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
