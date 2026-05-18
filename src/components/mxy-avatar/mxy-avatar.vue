<template>
  <view class="mxy-avatar" :class="[`size-${size}`]" :style="{ width: pxSize, height: pxSize, borderRadius: pxSize }">
    <image
      v-if="src"
      class="avatar-img"
      :src="src"
      mode="aspectFill"
      :style="{ width: pxSize, height: pxSize, borderRadius: pxSize }"
    />
    <view v-else class="avatar-fallback" :style="{ width: pxSize, height: pxSize, borderRadius: pxSize }">
      <mxy-icon name="person" :size="fallbackIconSize" color="#2D8F87" />
    </view>

    <view v-if="badge" class="avatar-badge" :class="`badge-${badgeType}`" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const props = withDefaults(defineProps<{
  src?: string;
  /** rpx 尺寸,默认 80rpx */
  size?: number;
  /** 是否显示徽标 */
  badge?: boolean;
  badgeType?: 'dot' | 'online';
}>(), {
  size: 80,
  badge: false,
  badgeType: 'dot',
});

const pxSize = computed(() => props.size + 'rpx');
const fallbackIconSize = computed(() => Math.round(props.size * 0.55));
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  overflow: visible;
}

.avatar-img {
  display: block;
  background: $soft-primary;
  object-fit: cover;
}

.avatar-fallback {
  background: $soft-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-badge {
  position: absolute;
  right: 0;
  top: 0;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;

  &.badge-dot { background: $warning-strong; }
  &.badge-online { background: $success; }
}
</style>
