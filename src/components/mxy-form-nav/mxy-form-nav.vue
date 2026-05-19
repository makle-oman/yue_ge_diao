<template>
  <view class="mxy-form-nav-wrap" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="mxy-form-nav">
      <view class="nav-left" @click="onBack">
        <mxy-icon v-if="leftText" name="" :size="0" />
        <text v-if="leftText" class="left-text">{{ leftText }}</text>
        <mxy-icon v-else name="arrow_back" :size="44" color="#1A2B33" />
      </view>

      <text class="nav-title">{{ title }}</text>

      <view
        v-if="actionText"
        class="nav-action"
        :class="{ disabled: actionDisabled }"
        @click="onAction"
      >
        <text class="action-text">{{ actionText }}</text>
      </view>
      <view v-else class="nav-action-placeholder" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const props = defineProps<{
  title: string;
  /** 默认显示返回箭头，传 leftText 则显示文字（如「取消」） */
  leftText?: string;
  actionText?: string;
  actionDisabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'action'): void;
  (e: 'back'): void;
}>();

const { statusBarHeight } = useSystemInfo();

const onBack = () => {
  emit('back');
  uni.navigateBack({ delta: 1 }).catch(() => {});
};

const onAction = () => {
  if (props.actionDisabled) return;
  emit('action');
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-form-nav-wrap {
  flex: none;
  background: $bg-card;
  border-bottom: 1rpx solid $border-light;
}
.mxy-form-nav {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}
.nav-left {
  width: 120rpx;
  display: flex;
  align-items: center;

  &:active { opacity: .6; }

  .left-text {
    font-size: 28rpx;
    color: $text-secondary;
    font-weight: 700;
  }
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 900;
  color: $text-primary;
}
.nav-action {
  min-width: 120rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  &:active { opacity: .8; }
  &.disabled .action-text { background: $border-base; }

  .action-text {
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 22rpx;
    border-radius: 30rpx;
    background: $primary;
    color: #fff;
    font-size: 26rpx;
    font-weight: 800;
  }
}
.nav-action-placeholder {
  width: 120rpx;
}
</style>
