<template>
  <view class="mxy-card" :class="{ flat, clickable }" :style="cardStyle" @click="$emit('click')">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  padding?: string | number;
  radius?: number;
  flat?: boolean;
  clickable?: boolean;
}>(), {
  padding: '24rpx',
  radius: 36,
  flat: false,
  clickable: false,
});

defineEmits<{ (e: 'click'): void }>();

const cardStyle = computed(() => {
  const p = typeof props.padding === 'number' ? props.padding + 'rpx' : props.padding;
  return {
    padding: p,
    borderRadius: props.radius + 'rpx',
  };
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-card {
  background: $bg-card;
  box-shadow: 0 6rpx 24rpx rgba(26, 43, 51, 0.06);
  &.flat { box-shadow: none; }
  &.clickable:active { transform: scale(.99); opacity: .94; }
}
</style>
