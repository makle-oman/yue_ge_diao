<template>
  <view class="profile-page">
    <!-- 顶部 Hero 背景 -->
    <view class="hero">
      <image class="hero-bg" src="https://images.unsplash.com/photo-1598209292386-3be9c519290a?w=900" mode="aspectFill" />
      <view class="hero-shade" />

      <!-- 设置按钮 -->
      <view
        class="hero-setting"
        :style="heroSettingStyle"
        @click="onSetting"
      >
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
interface MenuItem { key: string; label: string; icon: string; color: string; path?: string; action?: 'logout' }

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

// 顶部资料卡:全部来自 authStore.profile / user 的响应式 computed,
// 编辑页保存后回到本页 store 已更新 → 视图自动响应,不再依赖 onShow 重拉
const user = computed(() => {
  const profile = authStore.profile;
  const u = authStore.user;
  const name = authStore.isLoggedIn ? authStore.displayName : '未登录';
  const avatar = authStore.avatar;
  const years = profile?.fishingAgeBand
    ? FISHING_AGE_BAND_LABEL[profile.fishingAgeBand]
    : '钓龄待填';
  const styles = profile?.playStyles ?? [];
  const sign = profile?.city
    ? `坐标 ${profile.city}，愿者上钩。`
    : u?.nickname
      ? '愿者上钩，也要守规矩。'
      : '愿者上钩，也要守规矩。';
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

const menus = ref<MenuItem[]>([
  { key: 'catch',  label: '我的鱼获', icon: 'phishing',     color: '#2D8F87', path: '/subpackages/profile/catches/index' },
  { key: 'spot',   label: '我的钓点', icon: 'add_location', color: '#5BA9C4', path: '/subpackages/profile/spots/index' },
  { key: 'team',   label: '我的组队', icon: 'groups',       color: '#F5A623', path: '/subpackages/team/list/index' },
  { key: 'favor',  label: '我的收藏', icon: 'star',         color: '#F5A623', path: '/subpackages/profile/favorites/index' },
  { key: 'logout', label: '退出登录', icon: 'logout',       color: '#C0392B', action: 'logout' },
]);

// 「我的」Tab 顶部 stats 卡:鱼获 total + 最大记录由 /users/catches/stats 拉,
// 钓点数由 /users/spots/stats 拉。两个统计并发,互不阻塞。
async function loadStats() {
  if (!authStore.isLoggedIn) return;
  const [cs, ss] = await Promise.allSettled([userCatchesStats(), userSpotsStats()]);
  if (cs.status === 'fulfilled') {
    stats.value.catches = cs.value.total;
    stats.value.max = cs.value.heaviest ? formatWeight(cs.value.heaviest.weightG) : '—';
  } else {
    console.warn('[profile] userCatchesStats failed', cs.reason);
  }
  if (ss.status === 'fulfilled') {
    stats.value.spots = ss.value.total;
  } else {
    console.warn('[profile] userSpotsStats failed', ss.reason);
  }
}

function fishBg(f: FishLibraryItem): string {
  if (!f.unlocked) return '#EAEEF1';
  if (f.category === 'sea') return '#EAF6FA';
  return f.common ? '#EAF5F4' : '#FFF4E1';
}

async function loadFishLibrarySummary() {
  if (!authStore.isLoggedIn) return;
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
  // store 初始已 hydrate token/user;profile 若未拉过(冷启动)就拉一次
  if (authStore.isLoggedIn && !authStore.profile) {
    authStore.refreshMe();
  }
  loadProfileData();
});

// 从其它页面(如编辑资料/发布鱼获)返回时,刷新 stats 和鱼库摘要
onShow(() => {
  if (authStore.isLoggedIn) {
    loadProfileData();
  }
});

const onSetting = () => uni.navigateTo({ url: '/subpackages/profile/setting/index' });
const onMoreFish = () => uni.navigateTo({ url: '/subpackages/profile/fish-library/index' });
const onFishTap = (f: FishItem) => uni.showToast({ title: f.locked ? '尚未解锁' : f.name, icon: 'none' });
const onMenuTap = (m: MenuItem) => {
  if (m.action === 'logout') {
    uni.showModal({
      title: '提示',
      content: '确认退出登录？',
      success: ({ confirm }) => {
        if (!confirm) return;
        authStore.logout();
        uni.showToast({ title: '已退出', icon: 'success' });
        setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 400);
      },
    });
    return;
  }
  if (m.path) { uni.navigateTo({ url: m.path }); return; }
  uni.showToast({ title: `${m.label} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
