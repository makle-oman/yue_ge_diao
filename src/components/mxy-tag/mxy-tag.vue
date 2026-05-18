<template>
  <view class="app-tag" :class="[`tone-${tone}`, `size-${size}`, { outline }]">
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'primary' | 'blue' | 'orange' | 'red' | 'neutral';
  size?: 'sm' | 'md';
  outline?: boolean;
}>(), {
  tone: 'primary',
  size: 'sm',
  outline: false,
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.app-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 24rpx;
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;

  &.size-sm { padding: 6rpx 14rpx; font-size: 22rpx; }
  &.size-md { padding: 8rpx 18rpx; font-size: 24rpx; }

  &.tone-primary { background: $soft-primary; color: $primary; }
  &.tone-blue    { background: $soft-blue;    color: $secondary; }
  &.tone-orange  { background: $soft-orange;  color: $accent; }
  &.tone-red     { background: $soft-red;     color: $warning-strong; }
  &.tone-neutral { background: $bg-hover;     color: $text-secondary; }

  &.outline {
    background: transparent;
    border: 2rpx solid currentColor;
  }
}
</style>
