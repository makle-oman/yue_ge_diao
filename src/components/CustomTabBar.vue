<template>
  <view class="custom-tabbar">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tab-item"
      :class="{ active: current === item.key, ghost: item.key === 'placeholder' }"
      @click="onTabClick(item)"
    >
      <template v-if="item.key !== 'placeholder'">
        <mxy-icon
          class="tab-icon"
          :name="item.icon"
          :size="48"
          :filled="current === item.key"
          :color="current === item.key ? primaryColor : mutedColor"
        />
        <text class="tab-label">{{ item.label }}</text>
      </template>
    </view>

    <view class="tab-fab" @click="onPublishClick">
      <mxy-icon name="add" :size="56" color="#fff" :weight="500" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

interface TabItem {
  key: 'home' | 'community' | 'placeholder' | 'message' | 'profile';
  label: string;
  icon: string;
  path: string;
}

defineProps<{
  current: 'home' | 'community' | 'message' | 'profile';
}>();

const primaryColor = '#2D8F87';
const mutedColor = '#6B7B85';

const tabs = ref<TabItem[]>([
  { key: 'home',        label: '钓点', icon: 'map',           path: '/pages/index/index' },
  { key: 'community',   label: '社区', icon: 'photo_library', path: '/pages/community/index' },
  { key: 'placeholder', label: '',     icon: '',              path: '' },
  { key: 'message',     label: '消息', icon: 'chat',          path: '/pages/message/index' },
  { key: 'profile',     label: '我的', icon: 'person',        path: '/pages/profile/index' },
]);

const onTabClick = (item: TabItem) => {
  if (item.key === 'placeholder' || !item.path) return;
  uni.switchTab({ url: item.path }).catch(() => {
    uni.reLaunch({ url: item.path });
  });
};

const onPublishClick = () => {
  uni.navigateTo({ url: '/pages/publish/index' });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.custom-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  height: calc(#{$tabbar-height} + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
  background: $bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  border-top: 1rpx solid $border-light;
}

.tab-item {
  flex: 1;
  height: $tabbar-height;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;

  &.ghost { visibility: hidden; pointer-events: none; }

  .tab-icon { line-height: 1; }

  .tab-label {
    font-size: $font-xs;
    color: $text-secondary;
    line-height: 1;
  }

  &.active {
    .tab-label {
      color: $primary;
      font-weight: 700;
    }
  }
}

.tab-fab {
  position: absolute;
  left: 50%;
  bottom: calc(#{$tabbar-height} - #{$tabbar-fab-size} + #{$tabbar-fab-offset} + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: $tabbar-fab-size;
  height: $tabbar-fab-size;
  border-radius: 50%;
  background: $primary;
  box-shadow: 0 6rpx 20rpx rgba(45, 143, 135, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: translateX(-50%) scale(0.95); }
}
</style>
