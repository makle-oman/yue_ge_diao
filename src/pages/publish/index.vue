<template>
  <view class="publish-sheet" @click="onClose">
    <!-- 底部弹层（阻止冒泡，避免点击面板内部触发关闭） -->
    <view class="sheet" @click.stop>
      <view class="handle" />
      <text class="title">发布内容</text>

      <view
        v-for="(it, idx) in items"
        :key="it.key"
        class="row"
        @click="onPick(it)"
      >
        <view class="row-icon" :class="`tone-${it.tone}`">
          <mxy-icon :name="it.icon" :size="40" color="#fff" />
        </view>
        <view class="row-text">
          <text class="row-main">{{ it.main }}</text>
          <text class="row-sub">{{ it.sub }}</text>
        </view>
        <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
        <view v-if="idx < items.length - 1" class="row-divider" />
      </view>

      <view class="spacer" />

      <view class="cancel-btn" @click="onClose">
        <text class="cancel-text">取消</text>
      </view>

      <view class="safe-pad" :style="{ height: safeBottom + 'px' }" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const safeBottom = ref(0);
try {
  const info = uni.getSystemInfoSync();
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
} catch (_e) { /* ignore */ }

type Tone = 'primary' | 'secondary' | 'accent';

interface PickItem {
  key: 'catch' | 'spot' | 'team';
  main: string;
  sub: string;
  icon: string;
  tone: Tone;
  path: string;
}

const items: PickItem[] = [
  { key: 'catch', main: '发布鱼获',     sub: '晒出今日战绩',     icon: 'phishing',     tone: 'primary',   path: '/pages/catch/create' },
  { key: 'spot',  main: '上报新钓点',   sub: '分享你发现的好地方', icon: 'add_location', tone: 'secondary', path: '/pages/spot/create' },
  { key: 'team',  main: '发起组队约钓', sub: '找搭子一起出钓',   icon: 'groups',       tone: 'accent',    path: '/pages/team/create' },
];

const onPick = (it: PickItem) => {
  // redirectTo 让发布面板不堆积在导航栈里
  uni.redirectTo({ url: it.path }).catch(() => {
    uni.navigateTo({ url: it.path });
  });
};

const onClose = () => uni.navigateBack({ delta: 1 }).catch(() => {});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.publish-sheet {
  position: relative;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sheet {
  background: $bg-card;
  border-radius: 56rpx 56rpx 0 0;
  padding: 24rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.handle {
  align-self: center;
  width: 96rpx;
  height: 10rpx;
  border-radius: 6rpx;
  background: $border-base;
  margin-bottom: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 800;
  color: $text-primary;
  text-align: center;
  margin-bottom: 16rpx;
}

.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  height: 144rpx;
  padding: 0 8rpx;

  &:active { background: $bg-hover; }
}

.row-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.tone-primary   { background: $primary; }
  &.tone-secondary { background: $secondary; }
  &.tone-accent    { background: $accent; }
}

.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;

  .row-main {
    font-size: 32rpx;
    font-weight: 800;
    color: $text-primary;
  }
  .row-sub {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.row-divider {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  bottom: 0;
  height: 1rpx;
  background: $border-light;
}

.spacer { height: 24rpx; }

.cancel-btn {
  height: 104rpx;
  border-radius: 32rpx;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { opacity: .8; }

  .cancel-text {
    font-size: 32rpx;
    color: $text-secondary;
    font-weight: 700;
  }
}

.safe-pad { width: 100%; }
</style>
