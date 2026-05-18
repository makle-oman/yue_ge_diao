<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">发起组队</text>
      <text class="placeholder-desc">选钓点 + 时间 + 目标鱼种 + 人数 + AA方式 + 拼车 + 备注</text>
      <text class="placeholder-desc">需求文档: 约个钓-需求文档-v1.md F7.1</text>
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
