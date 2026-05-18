<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">组队详情</text>
      <text class="placeholder-desc">钓点时间 + 倒计时 + 发起人 + 已报名钓友 + 报名按钮</text>
      <text class="placeholder-desc">设计文档: 约个钓-页面设计-v1.md 第 7.4 节</text>
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
