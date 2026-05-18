<template>
  <view class="publish-page">
    <view class="placeholder-block">
      <text class="placeholder-title">发布入口</text>
      <text class="placeholder-desc">说明：中间"+" tab 点击后会弹 ActionSheet</text>
      <text class="placeholder-desc">这个页面预留给"如果用户深链直接打开发布入口"的备用场景</text>
    </view>
    <!-- TODO: 三选项 ActionSheet（发鱼获 / 上报钓点 / 发起组队） -->
  </view>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
@import '@/uni.scss';
.publish-page {
  min-height: 100vh;
  background: $bg-page;
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
