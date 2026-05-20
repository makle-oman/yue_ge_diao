<template>
  <view v-if="visible" class="mxy-sheet" @touchmove.stop.prevent>
    <view class="mxy-sheet-mask" @click="onCancel" />
    <view class="mxy-sheet-panel" :style="{ paddingBottom: 'calc(28rpx + ' + safeBottom + 'px)' }" @click.stop>
      <view class="mxy-sheet-handle" />

      <view v-if="!hideHeader" class="mxy-sheet-head">
        <text class="mxy-sheet-cancel" @click="onCancel">{{ cancelText }}</text>
        <text class="mxy-sheet-title">{{ title }}</text>
        <text class="mxy-sheet-done" @click="onDone">{{ doneText }}</text>
      </view>

      <view class="mxy-sheet-body">
        <slot />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/utils/useSystemInfo';

defineOptions({
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
    addGlobalClass: true,
  },
});

withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  cancelText?: string;
  doneText?: string;
  hideHeader?: boolean;
}>(), {
  title: '',
  cancelText: '取消',
  doneText: '完成',
  hideHeader: false,
});

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'done'): void;
  (e: 'update:visible', v: boolean): void;
}>();

const { safeBottom } = useSystemInfo();

const onCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
const onDone = () => {
  emit('done');
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
.mxy-sheet {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.mxy-sheet-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  animation: mxy-fade-in 0.18s ease-out;
}
.mxy-sheet-panel {
  position: relative;
  z-index: 1;
  background: $bg-card;
  border-radius: 28rpx 28rpx 0 0;
  padding: 24rpx 32rpx 0;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  animation: mxy-slide-up 0.22s ease-out;
}
.mxy-sheet-handle {
  width: 88rpx;
  height: 10rpx;
  border-radius: 6rpx;
  background: $border-base;
  align-self: center;
}
.mxy-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56rpx;

  .mxy-sheet-cancel {
    min-width: 96rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: $text-secondary;

    &:active { opacity: .6; }
  }
  .mxy-sheet-title {
    font-size: 34rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .mxy-sheet-done {
    min-width: 96rpx;
    text-align: right;
    font-size: 30rpx;
    font-weight: 900;
    color: $primary;

    &:active { opacity: .6; }
  }
}
.mxy-sheet-body {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

@keyframes mxy-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes mxy-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
