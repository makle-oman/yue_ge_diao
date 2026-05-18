<template>
  <view class="user-detail">
    <view class="hero">
      <image class="hero-img" :src="user.cover" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="icon-btn" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="icon-btn" @click="onMore">
          <mxy-icon name="more_horiz" :size="40" color="#fff" />
        </view>
      </view>

      <view class="hero-content">
        <view class="avatar-ring">
          <mxy-avatar :src="user.avatar" :size="128" />
        </view>
        <view class="hero-text">
          <text class="hero-name">{{ user.name }}</text>
          <text class="hero-meta">{{ user.years }}年钓龄 · {{ user.style }} · {{ user.distance }}</text>
          <view class="credit-pill">
            <mxy-icon name="verified" :size="24" color="#F5A623" />
            <text class="credit-text">信用 {{ user.credit }}</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="panel">
        <view class="stats-card">
          <view class="stats-cell">
            <text class="stats-num primary">{{ user.stats.catch }}</text>
            <text class="stats-label">鱼获</text>
          </view>
          <view class="stats-div" />
          <view class="stats-cell">
            <text class="stats-num secondary">{{ user.stats.spot }}</text>
            <text class="stats-label">钓点</text>
          </view>
          <view class="stats-div" />
          <view class="stats-cell">
            <text class="stats-num accent">{{ user.stats.best }}</text>
            <text class="stats-label">最大记录</text>
          </view>
        </view>

        <view class="actions">
          <view
            class="follow-btn"
            :class="{ following: user.following }"
            @click="onFollow"
          >
            <text class="follow-btn-text">{{ user.following ? '已关注' : '关注' }}</text>
          </view>
          <view class="invite-btn" @click="onInvite">
            <text class="invite-btn-text">约他出钓</text>
          </view>
        </view>

        <view class="tabs">
          <view
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="activeTab = t.key"
          >
            <text>{{ t.label }}</text>
          </view>
        </view>

        <view v-if="activeTab === 'catch'" class="feed-grid">
          <view
            v-for="(f, idx) in feed"
            :key="idx"
            class="feed-card"
            @click="onFeed"
          >
            <image class="feed-img" :src="f.img" mode="aspectFill" />
            <view class="feed-text">
              <text class="feed-title">{{ f.title }}</text>
              <text class="feed-sub">{{ f.sub }}</text>
            </view>
          </view>
        </view>

        <view v-else class="empty">
          <text class="empty-text">暂未公开钓点</text>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const statusBarHeight = ref(0);
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
} catch (_e) {
  statusBarHeight.value = 20;
}

const user = ref({
  cover: 'https://images.unsplash.com/photo-1767884161822-2c890bdae11f?w=900',
  avatar: '',
  name: '阿峰路亚',
  years: 3,
  style: '路亚',
  distance: '3.4km',
  credit: 96,
  following: false,
  stats: {
    catch: 42,
    spot: 8,
    best: '3.6kg',
  },
});

type TabKey = 'catch' | 'spot';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'catch', label: '鱼获' },
  { key: 'spot',  label: '钓点' },
];
const activeTab = ref<TabKey>('catch');

const feed = ref([
  {
    img: 'https://images.unsplash.com/photo-1638474690238-4a55f6007635?w=400',
    title: '翘嘴 · 3.6斤',
    sub: '江心洲北汊 · 今天',
  },
  {
    img: 'https://images.unsplash.com/photo-1611110176776-ea2a9ba5d376?w=400',
    title: '鲈鱼 · 2斤',
    sub: '六合码头 · 昨天',
  },
]);

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onMore = () => uni.showActionSheet({
  itemList: ['举报', '屏蔽', '复制主页链接'],
  success: () => uni.showToast({ title: '操作 (待开发)', icon: 'none' }),
});
const onFollow = () => {
  user.value.following = !user.value.following;
  uni.showToast({ title: user.value.following ? '已关注' : '已取消关注', icon: 'success' });
};
const onInvite = () => uni.showToast({ title: '已发送出钓邀请', icon: 'success' });
const onFeed = () => uni.navigateTo({ url: '/pages/catch/detail?id=demo' });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.user-detail {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.hero {
  position: relative;
  width: 100%;
  height: 496rpx;
  flex: none;
}
.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.hero-shade {
  position: absolute;
  inset: 0;
  background: rgba(18, 52, 45, 0.66);
}
.hero-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 16rpx 32rpx 0;
  display: flex;
  justify-content: space-between;
  z-index: 3;
}
.icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-content {
  position: absolute;
  left: 48rpx;
  right: 48rpx;
  bottom: 56rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 3;
}
.avatar-ring {
  width: 144rpx;
  height: 144rpx;
  border-radius: 50%;
  background: $soft-primary;
  border: 6rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.hero-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;

  .hero-name {
    font-size: 44rpx;
    color: #fff;
    font-weight: 900;
  }
  .hero-meta {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 700;
  }
}
.credit-pill {
  align-self: flex-start;
  height: 52rpx;
  padding: 0 16rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 4rpx;

  .credit-text {
    font-size: 22rpx;
    color: #fff;
    font-weight: 900;
  }
}

.content {
  flex: 1;
  min-height: 0;
}
.panel {
  margin-top: -40rpx;
  padding: 24rpx 32rpx;
  background: $bg-page;
  border-radius: 48rpx 48rpx 0 0;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  position: relative;
  z-index: 4;
}

.stats-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx 16rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(26, 43, 51, 0.10);
}
.stats-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;

  .stats-num {
    font-size: 44rpx;
    line-height: 1;
    font-weight: 900;
    color: $text-primary;

    &.primary   { color: $primary; }
    &.secondary { color: $secondary; }
    &.accent    { color: $accent; }
  }
  .stats-label {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.stats-div {
  width: 2rpx;
  height: 80rpx;
  background: $border-light;
}

.actions {
  display: flex;
  gap: 20rpx;
}
.follow-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: scale(.98); }
  &.following { background: $bg-hover; .follow-btn-text { color: $text-secondary; } }

  .follow-btn-text {
    font-size: 30rpx;
    color: #fff;
    font-weight: 900;
  }
}
.invite-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: scale(.98); }

  .invite-btn-text {
    font-size: 30rpx;
    color: $text-primary;
    font-weight: 900;
  }
}

.tabs {
  display: flex;
  gap: 16rpx;
  background: $bg-card;
  border-radius: 36rpx;
  padding: 8rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.tab {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 24rpx;
    color: $text-secondary;
    font-weight: 800;
  }
  &.active {
    background: $primary;

    text { color: #fff; font-weight: 900; }
  }
}

.feed-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}
.feed-card {
  width: calc(50% - 12rpx);
  background: $bg-card;
  border-radius: 24rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  box-sizing: border-box;

  &:active { transform: scale(.98); }
}
.feed-img {
  width: 100%;
  height: 284rpx;
  border-radius: 18rpx;
}
.feed-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 4rpx 8rpx 8rpx;

  .feed-title {
    font-size: 26rpx;
    color: $text-primary;
    font-weight: 900;
  }
  .feed-sub {
    font-size: 22rpx;
    color: $text-secondary;
  }
}

.empty {
  padding: 80rpx 0;
  display: flex;
  justify-content: center;

  .empty-text {
    font-size: 26rpx;
    color: $text-secondary;
  }
}

.end-pad { height: 48rpx; }
</style>
