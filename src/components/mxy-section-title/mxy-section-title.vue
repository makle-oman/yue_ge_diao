<template>
  <view class="mxy-section-title">
    <view class="title-left">
      <view class="title-bar" />
      <text class="title-text">{{ title }}</text>
      <text v-if="subtitle" class="title-sub">{{ subtitle }}</text>
    </view>
    <view v-if="$slots.right || actionText" class="title-right" @click="$emit('action')">
      <slot name="right">
        <text class="action-text">{{ actionText }}</text>
        <mxy-icon name="chevron_right" :size="24" color="#6B7B85" />
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

defineProps<{
  title: string;
  subtitle?: string;
  actionText?: string;
}>();

defineEmits<{ (e: 'action'): void }>();
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-bar {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  background: $primary;
}

.title-text {
  font-size: $font-xl;
  font-weight: 800;
  color: $text-primary;
  line-height: 1;
}

.title-sub {
  font-size: $font-sm;
  color: $text-secondary;
  margin-left: 4rpx;
}

.title-right {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx;

  .action-text {
    font-size: $font-sm;
    color: $text-secondary;
  }
}
</style>
