<template>
  <view class="app-button" :class="[`type-${type}`, `size-${size}`, { block, disabled }]" @click="onClick">
    <slot name="prefix" />
    <text class="app-button__label"><slot>{{ text }}</slot></text>
    <slot name="suffix" />
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string;
  type?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  disabled?: boolean;
}>(), {
  type: 'primary',
  size: 'md',
  block: false,
  disabled: false,
});

const emit = defineEmits<{ (e: 'click', evt: Event): void }>();

const onClick = (evt: Event) => {
  if (props.disabled) return;
  emit('click', evt);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-weight: 600;
  border-radius: 48rpx;
  transition: opacity .15s, transform .1s;

  &:active:not(.disabled) { transform: scale(.97); opacity: .92; }

  &.block { display: flex; width: 100%; }

  &.disabled { opacity: .45; }

  // sizes
  &.size-sm { height: 56rpx; padding: 0 24rpx; font-size: 24rpx; }
  &.size-md { height: 76rpx; padding: 0 32rpx; font-size: 28rpx; }
  &.size-lg { height: 92rpx; padding: 0 40rpx; font-size: 32rpx; }

  // types
  &.type-primary  { background: $primary; color: #fff; }
  &.type-secondary{ background: $secondary; color: #fff; }
  &.type-ghost    {
    background: transparent;
    color: $primary;
    border: 2rpx solid $primary;
  }
  &.type-soft     { background: $soft-primary; color: $primary; }
  &.type-danger   { background: $warning-strong; color: #fff; }
}

.app-button__label {
  line-height: 1;
}
</style>
