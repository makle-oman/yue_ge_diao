<template>
  <view class="mxy-list-item" :class="{ clickable, divided }" @click="onClick">
    <view v-if="icon || $slots.icon" class="li-icon-wrap" :class="`tone-${iconTone}`">
      <slot name="icon">
        <mxy-icon :name="icon!" :size="36" :color="iconColor" />
      </slot>
    </view>

    <view class="li-body">
      <view class="li-title-row">
        <text class="li-title">{{ title }}</text>
        <text v-if="badge" class="li-badge">{{ badge }}</text>
      </view>
      <text v-if="subtitle" class="li-subtitle">{{ subtitle }}</text>
    </view>

    <view class="li-right">
      <slot name="right">
        <text v-if="rightText" class="li-right-text">{{ rightText }}</text>
        <mxy-icon v-if="showChevron" name="chevron_right" :size="32" color="#99A5AD" />
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const props = withDefaults(defineProps<{
  title: string;
  subtitle?: string;
  icon?: string;
  iconTone?: 'primary' | 'blue' | 'orange' | 'red' | 'neutral';
  rightText?: string;
  showChevron?: boolean;
  clickable?: boolean;
  divided?: boolean;
  badge?: string | number;
}>(), {
  iconTone: 'primary',
  showChevron: true,
  clickable: true,
  divided: true,
});

const emit = defineEmits<{ (e: 'click'): void }>();

const iconColor = computed(() => {
  const map = {
    primary: '#2D8F87',
    blue: '#5BA9C4',
    orange: '#F5A623',
    red: '#FF6B6B',
    neutral: '#6B7B85',
  } as const;
  return map[props.iconTone];
});

const onClick = () => {
  if (props.clickable) emit('click');
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-list-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  background: $bg-card;
  transition: background .12s;

  &.divided { border-bottom: 1rpx solid $border-light; }
  &.clickable:active { background: $bg-hover; }
}

.li-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.tone-primary { background: $soft-primary; }
  &.tone-blue    { background: $soft-blue; }
  &.tone-orange  { background: $soft-orange; }
  &.tone-red     { background: $soft-red; }
  &.tone-neutral { background: $bg-hover; }
}

.li-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.li-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.li-title {
  font-size: $font-base;
  color: $text-primary;
  font-weight: 700;
  line-height: 1.3;
}

.li-subtitle {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.li-badge {
  display: inline-flex;
  align-items: center;
  padding: 2rpx 12rpx;
  background: $soft-red;
  color: $warning-strong;
  font-size: $font-xs;
  font-weight: 700;
  border-radius: 16rpx;
  line-height: 1.4;
}

.li-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.li-right-text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
