<template>
  <view class="mxy-chip" :class="{ active }" @click="$emit('click')">
    <mxy-icon v-if="icon" :name="icon" :size="24" class="chip-icon" />
    <text class="chip-label"><slot>{{ label }}</slot></text>
  </view>
</template>

<script setup lang="ts">
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

withDefaults(defineProps<{
  label?: string;
  active?: boolean;
  icon?: string;
}>(), {
  active: false,
});

defineEmits<{ (e: 'click'): void }>();
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 24rpx;
  border-radius: 32rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  transition: all .15s;

  &:active { transform: scale(.96); }

  &.active {
    background: $primary;
    border-color: $primary;
    color: #fff;
    font-weight: 700;
  }
}

.chip-icon { line-height: 1; }
.chip-label { line-height: 1; }
</style>
