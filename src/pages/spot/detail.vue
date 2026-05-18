<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">钓点详情</text>
      <text class="placeholder-desc">轮播图 + 基础信息 + 实用信息 + 主要鱼种 + 历史鱼获 + 评价</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 7.1 节</text>
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
