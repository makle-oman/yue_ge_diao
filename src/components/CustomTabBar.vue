<template>
  <view class="custom-tabbar">
    <!-- 普通 Tab 项 -->
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tab-item"
      :class="{ active: current === item.key }"
      @click="onTabClick(item)"
    >
      <view class="tab-icon">
        <!-- TODO: 替换为实际 icon。当前用 emoji 占位 -->
        <text>{{ current === item.key ? item.iconActive : item.icon }}</text>
      </view>
      <text class="tab-label">{{ item.label }}</text>
    </view>

    <!-- 中间凸起 "+" 按钮 -->
    <view class="tab-fab" @click="onPublishClick">
      <text class="tab-fab-plus">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface TabItem {
  key: 'home' | 'community' | 'placeholder' | 'message' | 'profile';
  label: string;
  icon: string;
  iconActive: string;
  path: string;
}

defineProps<{
  current: 'home' | 'community' | 'message' | 'profile';
}>();

/**
 * 注意：占位符 emoji 仅用于开发期。
 * 设计稿出图后替换为 PNG 图标（建议 84x84 PNG，static/tabbar/ 下）。
 */
const tabs = ref<TabItem[]>([
  { key: 'home',      label: '钓点', icon: '🗺',  iconActive: '🗺', path: '/pages/index/index' },
  { key: 'community', label: '社区', icon: '🐟',  iconActive: '🐟', path: '/pages/community/index' },
  { key: 'placeholder', label: '', icon: '', iconActive: '', path: '' }, // 中间凸起按钮占位
  { key: 'message',   label: '消息', icon: '💬',  iconActive: '💬', path: '/pages/message/index' },
  { key: 'profile',   label: '我的', icon: '👤',  iconActive: '👤', path: '/pages/profile/index' },
]);

const onTabClick = (item: TabItem) => {
  if (item.key === 'placeholder' || !item.path) return;
  uni.switchTab({ url: item.path }).catch(() => {
    uni.reLaunch({ url: item.path });
  });
};

const onPublishClick = () => {
  // 弹出 ActionSheet：发鱼获 / 上报钓点 / 发起组队
  uni.showActionSheet({
    itemList: ['🐟 发布鱼获', '📍 上报新钓点', '👥 发起组队约钓'],
    success: (res) => {
      const routes = [
        '/pages/catch/create',
        '/pages/spot/create',
        '/pages/team/create',
      ];
      const target = routes[res.tapIndex];
      if (target) {
        uni.navigateTo({ url: target });
      }
    },
  });
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
}

.tab-item {
  flex: 1;
  height: $tabbar-height;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;

  .tab-icon {
    font-size: 40rpx;
    line-height: 1;
  }
  .tab-label {
    font-size: $font-xs;
    color: $text-secondary;
  }

  &.active {
    .tab-label {
      color: $primary;
      font-weight: 600;
    }
  }
}

/* 中间凸起 "+" 按钮 */
.tab-fab {
  position: absolute;
  left: 50%;
  bottom: calc(#{$tabbar-height} - #{$tabbar-fab-size} + #{$tabbar-fab-offset} + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: $tabbar-fab-size;
  height: $tabbar-fab-size;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary 0%, darken($primary, 8%) 100%);
  box-shadow: 0 6rpx 20rpx rgba(45, 143, 135, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;

  .tab-fab-plus {
    color: #fff;
    font-size: 64rpx;
    font-weight: 300;
    line-height: 1;
    margin-top: -6rpx;
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
  }
}
</style>
