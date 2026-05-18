<template>
  <view class="profile-page">
    <!-- 顶部 Hero 背景 -->
    <view class="hero">
      <image class="hero-bg" src="https://images.unsplash.com/photo-1598209292386-3be9c519290a?w=900" mode="aspectFill" />
      <view class="hero-shade" />

      <!-- 设置按钮 -->
      <view class="hero-setting" :style="{ top: statusBarHeight + 12 + 'px' }" @click="onSetting">
        <mxy-icon name="settings" :size="40" color="#fff" />
      </view>

      <!-- 用户信息 -->
      <view class="hero-user" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="hero-avatar">
          <image v-if="user.avatar" class="hero-avatar-img" :src="user.avatar" mode="aspectFill" />
          <mxy-icon v-else name="person" :size="60" color="#fff" />
        </view>
        <view class="hero-meta">
          <text class="hero-name">{{ user.name }}</text>
          <view class="hero-tags">
            <view class="hero-tag hero-tag--accent">
              <text class="hero-tag-text">{{ user.years }}</text>
            </view>
            <view v-for="t in user.styles" :key="t" class="hero-tag hero-tag--ghost">
              <text class="hero-tag-text">{{ t }}</text>
            </view>
          </view>
          <text class="hero-sign">{{ user.sign }}</text>
        </view>
      </view>
    </view>

    <!-- 滚动区 -->
    <scroll-view class="profile-scroll" scroll-y>
      <!-- 数据统计卡 -->
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-num">{{ stats.spots }}</text>
          <text class="stats-label">钓点</text>
        </view>
        <view class="stats-div" />
        <view class="stats-item">
          <text class="stats-num">{{ stats.catches }}</text>
          <text class="stats-label">鱼获</text>
        </view>
        <view class="stats-div" />
        <view class="stats-item">
          <text class="stats-num accent">{{ stats.max }}</text>
          <text class="stats-label">最大记录</text>
        </view>
      </view>

      <!-- 鱼库成就卡 -->
      <view class="fish-card">
        <view class="fish-head">
          <text class="fish-title">鱼库成就</text>
          <text class="fish-more" @click="onMoreFish">已收集 {{ fishCollected }}/{{ fishTotal }} ›</text>
        </view>
        <view class="fish-row">
          <view
            v-for="f in fishLib"
            :key="f.name"
            class="fish-cell"
            @click="onFishTap(f)"
          >
            <view class="fish-circle" :style="{ background: f.bg }">
              <mxy-icon name="set_meal" :size="40" :color="f.locked ? '#BFC8CE' : '#1A2B33'" />
            </view>
            <text class="fish-name" :class="{ locked: f.locked }">{{ f.name }}</text>
          </view>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-card">
        <view
          v-for="(m, idx) in menus"
          :key="m.key"
          class="menu-row"
          @click="onMenuTap(m)"
        >
          <mxy-icon :name="m.icon" :size="44" :color="m.color" />
          <text class="menu-label">{{ m.label }}</text>
          <mxy-icon name="chevron_right" :size="40" color="#99A5AD" />
          <view v-if="idx !== menus.length - 1" class="menu-div" />
        </view>
      </view>

      <view class="end-pad" />
    </scroll-view>

    <CustomTabBar current="profile" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface FishItem { name: string; bg: string; locked?: boolean }
interface MenuItem { key: string; label: string; icon: string; color: string; path?: string }

const statusBarHeight = ref(0);
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
} catch (_e) {
  statusBarHeight.value = 20;
}

const user = ref({
  name: '老王钓鱼',
  avatar: '',
  years: '5年钓龄',
  styles: ['野钓', '路亚'],
  sign: '愿者上钩，也要守规矩。',
});

const stats = ref({
  spots: 23,
  catches: 156,
  max: '4.2kg',
});

const fishCollected = ref(12);
const fishTotal = ref(56);

const fishLib = ref<FishItem[]>([
  { name: '鲫鱼', bg: '#EAF5F4' },
  { name: '鲤鱼', bg: '#FFF4E1' },
  { name: '翘嘴', bg: '#EAF6FA' },
  { name: '鳜鱼', bg: '#EAEEF1', locked: true },
]);

const menus = ref<MenuItem[]>([
  { key: 'catch',  label: '我的鱼获', icon: 'phishing',     color: '#2D8F87', path: '/pages/catch/create' },
  { key: 'spot',   label: '我的钓点', icon: 'add_location', color: '#5BA9C4' },
  { key: 'team',   label: '我的组队', icon: 'groups',       color: '#F5A623', path: '/pages/team/list' },
  { key: 'favor',  label: '我的收藏', icon: 'star',         color: '#F5A623' },
]);

const onSetting = () => uni.navigateTo({ url: '/pages/profile/setting' });
const onMoreFish = () => uni.showToast({ title: '鱼库成就 (待开发)', icon: 'none' });
const onFishTap = (f: FishItem) => uni.showToast({ title: f.locked ? '尚未解锁' : f.name, icon: 'none' });
const onMenuTap = (m: MenuItem) => {
  if (m.path) { uni.navigateTo({ url: m.path }); return; }
  uni.showToast({ title: `${m.label} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

/* ---------- Hero ---------- */
.hero {
  flex: none;
  position: relative;
  width: 100%;
  height: 472rpx; /* 236px */
  overflow: visible;
}
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.hero-shade {
  position: absolute;
  inset: 0;
  background: rgba(18, 52, 45, 0.6);
}
.hero-setting {
  position: absolute;
  right: 32rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
.hero-user {
  position: absolute;
  inset: 0;
  display: flex;
  padding: 96rpx 32rpx 28rpx;
  gap: 28rpx;
  align-items: flex-start;
  z-index: 2;
}
.hero-avatar {
  width: 144rpx;
  height: 144rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  background: $soft-primary;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .hero-avatar-img {
    width: 100%;
    height: 100%;
  }
}
.hero-meta {
  flex: 1;
  min-width: 0;
  padding-top: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .hero-name {
    font-size: 44rpx;
    font-weight: 900;
    color: #fff;
    line-height: 1;
  }
  .hero-sign {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
}
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.hero-tag {
  height: 44rpx;
  padding: 0 20rpx;
  border-radius: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .hero-tag-text {
    font-size: 22rpx;
    color: #fff;
    font-weight: 700;
    line-height: 1;
  }
  &--accent { background: rgba(245, 166, 35, 0.86); }
  &--ghost  { background: rgba(255, 255, 255, 0.18); }
}

/* ---------- 滚动区域 ---------- */
.profile-scroll {
  flex: 1;
  min-height: 0;
  padding-bottom: calc(#{$tabbar-height} + env(safe-area-inset-bottom));
}

/* ---------- 统计卡 (上浮覆盖 Hero) ---------- */
.stats-card {
  margin: -80rpx 32rpx 0;
  height: 168rpx;
  background: $bg-card;
  border-radius: 28rpx;
  box-shadow: 0 12rpx 36rpx rgba(26, 43, 51, 0.14);
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  position: relative;
  z-index: 4;
}
.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;

  .stats-num {
    font-size: 48rpx;
    font-weight: 900;
    color: $primary;
    line-height: 1;

    &.accent { color: $accent; }
  }
  .stats-label {
    font-size: $font-sm;
    color: $text-secondary;
  }
}
.stats-div {
  width: 2rpx;
  height: 80rpx;
  background: $border-light;
}

/* ---------- 鱼库成就 ---------- */
.fish-card {
  margin: 28rpx 32rpx 0;
  padding: 28rpx;
  background: $bg-card;
  border-radius: 28rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.fish-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .fish-title {
    font-size: $font-lg;
    font-weight: 900;
    color: $text-primary;
  }
  .fish-more {
    font-size: $font-sm;
    color: $primary;
    font-weight: 700;
  }
}
.fish-row {
  display: flex;
  gap: 24rpx;
}
.fish-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &:active { transform: scale(.96); }
}
.fish-circle {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fish-name {
  font-size: 22rpx;
  color: $text-primary;

  &.locked { color: $text-placeholder; }
}

/* ---------- 菜单 ---------- */
.menu-card {
  margin: 28rpx 32rpx 0;
  background: $bg-card;
  border-radius: 28rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  overflow: hidden;
}
.menu-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 0 32rpx;
  height: 104rpx;

  &:active { background: $bg-hover; }

  .menu-label {
    flex: 1;
    font-size: 30rpx;
    font-weight: 800;
    color: $text-primary;
  }
}
.menu-div {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 0;
  height: 1rpx;
  background: $border-light;
}

.end-pad { height: 32rpx; }
</style>
