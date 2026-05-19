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

    <!-- 数据统计卡(脱离 scroll-view, 悬浮在 hero 底部) -->
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

    <!-- 滚动区 -->
    <scroll-view class="profile-scroll" scroll-y>
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
import { useSystemInfo } from '@/utils/useSystemInfo';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface FishItem { name: string; bg: string; locked?: boolean }
interface MenuItem { key: string; label: string; icon: string; color: string; path?: string }

const { statusBarHeight } = useSystemInfo();

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
  { key: 'catch', label: '我的鱼获', icon: 'phishing',     color: '#2D8F87', path: '/subpackages/profile/catches' },
  { key: 'spot',  label: '我的钓点', icon: 'add_location', color: '#5BA9C4', path: '/subpackages/profile/spots' },
  { key: 'team',  label: '我的组队', icon: 'groups',       color: '#F5A623', path: '/subpackages/team/list' },
  { key: 'favor', label: '我的收藏', icon: 'star',         color: '#F5A623', path: '/subpackages/profile/favorites' },
]);

const onSetting = () => uni.navigateTo({ url: '/subpackages/profile/setting' });
const onMoreFish = () => uni.navigateTo({ url: '/subpackages/profile/fish-library' });
const onFishTap = (f: FishItem) => uni.showToast({ title: f.locked ? '尚未解锁' : f.name, icon: 'none' });
const onMenuTap = (m: MenuItem) => {
  if (m.path) { uni.navigateTo({ url: m.path }); return; }
  uni.showToast({ title: `${m.label} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
