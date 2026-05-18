<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">钓友主页（他人）</text>
      <text class="placeholder-desc">头像信息 + 数据统计 + 鱼获/钓点 Tab + 关注按钮</text>
      <text class="placeholder-desc">需求文档: 约个钓-需求文档-v1.md F4</text>
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
