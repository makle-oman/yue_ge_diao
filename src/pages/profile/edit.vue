<template>
  <view class="page">
    <view class="placeholder-block">
      <text class="placeholder-title">编辑资料</text>
      <text class="placeholder-desc">头像 + 昵称 + 性别 + 钓龄 + 主玩方式 + 城市 + 签名</text>
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
