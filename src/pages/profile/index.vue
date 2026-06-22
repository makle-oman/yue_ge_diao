<template>
  <view class="profile-page">
    <!-- 顶部 Hero 背景 -->
    <view class="hero">
      <image class="hero-bg" src="https://images.unsplash.com/photo-1598209292386-3be9c519290a?w=900" mode="aspectFill" />
      <view class="hero-shade" />

      <!-- 设置按钮 (仅登录可见) -->
      <view
        v-if="authStore.isLoggedIn"
        class="hero-setting"
        :style="heroSettingStyle"
        @click="onSetting"
      >
        <mxy-icon name="settings" :size="36" color="#fff" />
      </view>

      <!-- 用户信息 (点击卡片可去往个人中心或跳转登录) -->
      <view class="hero-user" :style="{ paddingTop: statusBarHeight + 'px' }" @click="onHeaderClick">
        <view class="hero-avatar" :class="{ 'not-logged': !authStore.isLoggedIn }">
          <image v-if="user.avatar" class="hero-avatar-img" :src="user.avatar" mode="aspectFill" />
          <mxy-icon v-else name="person" :size="64" color="#fff" />
          <view v-if="!authStore.isLoggedIn" class="avatar-edit-badge">
            <mxy-icon name="arrow_forward" :size="18" color="#fff" />
          </view>
        </view>
        <view class="hero-meta">
          <view class="hero-name-row">
            <text class="hero-name">{{ user.name }}</text>
            <mxy-icon v-if="authStore.isLoggedIn" name="chevron_right" :size="36" color="rgba(255,255,255,0.7)" />
          </view>
          
          <view class="hero-tags" v-if="authStore.isLoggedIn">
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

    <!-- 数据统计卡 (脱离 scroll-view, 悬浮在 hero 底部) -->
    <view class="stats-card">
      <view class="stats-item" @click="onStatClick('spot')">
        <text class="stats-num">{{ stats.spots }}</text>
        <text class="stats-label">我的钓点</text>
      </view>
      <view class="stats-div" />
      <view class="stats-item" @click="onStatClick('catch')">
        <text class="stats-num">{{ stats.catches }}</text>
        <text class="stats-label">我的鱼获</text>
      </view>
      <view class="stats-div" />
      <view class="stats-item" @click="onStatClick('catch')">
        <text class="stats-num accent">{{ stats.max }}</text>
        <text class="stats-label">最大记录</text>
      </view>
    </view>

    <!-- 滚动区 -->
    <scroll-view class="profile-scroll" scroll-y>
      <!-- 鱼库成就卡 -->
      <view class="fish-card">
        <view class="fish-head">
          <view class="fish-title-col">
            <text class="fish-title">鱼库成就</text>
            <text class="fish-subtitle">记录您在水域解锁的物种成就</text>
          </view>
          <text class="fish-more" @click="onMoreFish">
            已收集 {{ fishCollected }}/{{ fishTotal }} ›
          </text>
        </view>
        <view class="fish-row">
          <view
            v-for="f in displayedFishLib"
            :key="f.name"
            class="fish-cell"
            @click="onFishTap(f)"
          >
            <view class="fish-circle" :style="{ background: f.bg }" :class="{ locked: f.locked }">
              <mxy-icon v-if="f.locked" name="lock" :size="32" color="#A5B5BD" />
              <mxy-icon v-else name="set_meal" :size="40" color="#2D8F87" />
            </view>
            <text class="fish-name" :class="{ locked: f.locked }">{{ f.name }}</text>
          </view>
        </view>
      </view>

      <!-- 菜单列表组 1：垂钓记录 -->
      <view class="menu-card">
        <view class="menu-row" @click="onMenuTap(menus[0])">
          <view class="menu-icon-bg bg-teal">
            <mxy-icon :name="menus[0].icon" :size="32" color="#2D8F87" />
          </view>
          <text class="menu-label">{{ menus[0].label }}</text>
          <mxy-icon name="chevron_right" :size="36" color="#BAC6CD" />
        </view>
        <view class="menu-div" />
        
        <view class="menu-row" @click="onMenuTap(menus[1])">
          <view class="menu-icon-bg bg-blue">
            <mxy-icon :name="menus[1].icon" :size="32" color="#4A90E2" />
          </view>
          <text class="menu-label">{{ menus[1].label }}</text>
          <mxy-icon name="chevron_right" :size="36" color="#BAC6CD" />
        </view>
        <view class="menu-div" />

        <view class="menu-row" @click="onMenuTap(menus[3])">
          <view class="menu-icon-bg bg-orange">
            <mxy-icon :name="menus[3].icon" :size="32" color="#F5A623" />
          </view>
          <text class="menu-label">{{ menus[3].label }}</text>
          <mxy-icon name="chevron_right" :size="36" color="#BAC6CD" />
        </view>
      </view>

      <!-- 菜单列表组 2：社区社交 -->
      <view class="menu-card">
        <view class="menu-row" @click="onMenuTap(menus[2])">
          <view class="menu-icon-bg bg-purple">
            <mxy-icon :name="menus[2].icon" :size="32" color="#8B572A" />
          </view>
          <text class="menu-label">{{ menus[2].label }}</text>
          <mxy-icon name="chevron_right" :size="36" color="#BAC6CD" />
        </view>
      </view>

      <!-- 退出登录（独立卡片，仅在登录时展示） -->
      <view v-if="authStore.isLoggedIn" class="logout-card" @click="onLogout">
        <mxy-icon name="logout" :size="38" color="#FF6B6B" />
        <text class="logout-text">退出登录</text>
      </view>
      
      <!-- 未登录的占位底部提示 -->
      <view v-else class="login-tip-card" @click="onHeaderClick">
        <text class="login-tip-title">登录解锁完整垂钓数据</text>
        <text class="login-tip-btn">立即登录</text>
      </view>

    </scroll-view>

    <CustomTabBar current="profile" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import CustomTabBar from '@/components/CustomTabBar.vue';
import { FISHING_AGE_BAND_LABEL } from '@/api/users';
import { userCatchesStats, formatWeight } from '@/api/catches';
import { userSpotsStats } from '@/api/spots';
import { fetchFishLibrary, type FishItem as FishLibraryItem } from '@/api/fishes';
import { useAuthStore } from '@/stores';

interface FishItem { name: string; bg: string; locked?: boolean }
interface MenuItem { key: string; label: string; icon: string; color: string; path?: string; danger?: boolean }

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();
const authStore = useAuthStore();

const heroSettingStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {
    top: statusBarHeight.value + 12 + 'px',
  };
  // #ifdef MP-WEIXIN
  s.right = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

// 顶部资料卡数据计算
const user = computed(() => {
  const profile = authStore.profile;
  const isLoggedIn = authStore.isLoggedIn;
  
  const name = isLoggedIn ? authStore.displayName : '立即登录 / 注册';
  const avatar = authStore.avatar;
  const years = profile?.fishingAgeBand
    ? FISHING_AGE_BAND_LABEL[profile.fishingAgeBand]
    : '钓龄未填写';
  const styles = profile?.playStyles ?? [];
  const sign = isLoggedIn 
    ? (profile?.city ? `定位：${profile.city} | 愿者上钩，守纪垂钓。` : '愿者上钩，守纪垂钓。')
    : '开启您的专属垂钓日记，记录下每一次上钩。';
    
  return { name, avatar, years, styles, sign };
});

const stats = ref({
  spots: 0,
  catches: 0,
  max: '—',
});

const fishCollected = ref(0);
const fishTotal = ref(0);
const fishLib = ref<FishItem[]>([]);

// 默认未登录或无数据时的占位成就列表
const defaultFishLib = [
  { name: '鲫鱼', bg: '#F2F4F6', locked: true },
  { name: '鲈鱼', bg: '#F2F4F6', locked: true },
  { name: '翘嘴', bg: '#F2F4F6', locked: true },
  { name: '黑鱼', bg: '#F2F4F6', locked: true },
];

const displayedFishLib = computed(() => {
  if (authStore.isLoggedIn && fishLib.value.length > 0) {
    return fishLib.value;
  }
  return defaultFishLib;
});

const menus = ref<MenuItem[]>([
  { key: 'catch',  label: '我的鱼获', icon: 'phishing',     color: '#2D8F87', path: '/subpackages/profile/catches/index' },
  { key: 'spot',   label: '我的钓点', icon: 'explore',      color: '#4A90E2', path: '/subpackages/profile/spots/index' },
  { key: 'team',   label: '我的组队', icon: 'groups',       color: '#8B572A', path: '/subpackages/team/list/index' },
  { key: 'favor',  label: '我的收藏', icon: 'star',         color: '#F5A623', path: '/subpackages/profile/favorites/index' },
]);

// 获取统计项数据
async function loadStats() {
  if (!authStore.isLoggedIn) {
    stats.value = { spots: 0, catches: 0, max: '—' };
    return;
  }
  const [cs, ss] = await Promise.allSettled([userCatchesStats(), userSpotsStats()]);
  if (cs.status === 'fulfilled') {
    stats.value.catches = cs.value.total;
    stats.value.max = cs.value.heaviest ? formatWeight(cs.value.heaviest.weightG) : '—';
  }
  if (ss.status === 'fulfilled') {
    stats.value.spots = ss.value.total;
  }
}

function fishBg(f: FishLibraryItem): string {
  if (!f.unlocked) return '#F2F4F6';
  if (f.category === 'sea') return '#EAF6FA';
  return f.common ? '#EAF5F4' : '#FFF4E1';
}

// 获取鱼库汇总
async function loadFishLibrarySummary() {
  if (!authStore.isLoggedIn) {
    fishCollected.value = 0;
    fishTotal.value = 0;
    fishLib.value = [];
    return;
  }
  try {
    const resp = await fetchFishLibrary();
    fishCollected.value = resp.stats.fresh.done + resp.stats.sea.done;
    fishTotal.value = resp.stats.fresh.total + resp.stats.sea.total;
    fishLib.value = resp.list
      .slice()
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (a.common !== b.common) return a.common ? -1 : 1;
        return a.name.localeCompare(b.name, 'zh-Hans-CN');
      })
      .slice(0, 4)
      .map((f) => ({
        name: f.name,
        bg: fishBg(f),
        locked: !f.unlocked,
      }));
  } catch (e) {
    console.warn('[profile] fishLibrary failed', e);
  }
}

function loadProfileData() {
  void loadStats();
  void loadFishLibrarySummary();
}

onMounted(() => {
  if (authStore.isLoggedIn && !authStore.profile) {
    authStore.refreshMe();
  }
  loadProfileData();
});

onShow(() => {
  if (authStore.isLoggedIn) {
    loadProfileData();
  } else {
    // 退出登录时，清空统计
    stats.value = { spots: 0, catches: 0, max: '—' };
    fishCollected.value = 0;
    fishTotal.value = 0;
    fishLib.value = [];
  }
});

// 交互操作
const onHeaderClick = () => {
  if (!authStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
  } else {
    uni.navigateTo({ url: '/subpackages/profile/setting/index' });
  }
};

const onStatClick = (type: 'spot' | 'catch') => {
  if (!authStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  if (type === 'spot') {
    uni.navigateTo({ url: '/subpackages/profile/spots/index' });
  } else {
    uni.navigateTo({ url: '/subpackages/profile/catches/index' });
  }
};

const onSetting = () => uni.navigateTo({ url: '/subpackages/profile/setting/index' });
const onMoreFish = () => {
  if (!authStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  uni.navigateTo({ url: '/subpackages/profile/fish-library/index' });
};

const onFishTap = (f: FishItem) => {
  if (!authStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  uni.showToast({ title: f.locked ? '解锁该鱼获记录后开启' : f.name, icon: 'none' });
};

const onLogout = () => uni.showModal({
  title: '退出登录',
  content: '确定退出并返回登录页吗？',
  confirmText: '退出',
  confirmColor: '#FF6B6B',
  success: (r) => {
    if (r.confirm) {
      authStore.logout();
      uni.reLaunch({ url: '/pages/login/index' });
    }
  },
});

const onMenuTap = (m: MenuItem) => {
  if (!authStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  if (m.path) { uni.navigateTo({ url: m.path }); return; }
  uni.showToast({ title: `${m.label} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
