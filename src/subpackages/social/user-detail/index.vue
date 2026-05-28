<template>
  <view class="user-detail">
    <!-- 顶部悬浮（脱离滚动流） -->
    <view
      class="hero-top"
      :style="heroTopStyle"
    >
      <view class="icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="icon-btn" @click="onMore">
        <mxy-icon name="more_horiz" :size="40" color="#fff" />
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="hero">
        <image class="hero-img" :src="user.cover" mode="aspectFill" />
        <view class="hero-shade" />

        <view class="hero-content">
          <view class="avatar-ring">
            <mxy-avatar :src="user.avatar" :size="128" />
          </view>
          <view class="hero-text">
            <text class="hero-name">{{ user.name }}</text>
            <text class="hero-meta">{{ user.years }} · {{ user.style }} · {{ user.distance }}</text>
            <view class="credit-pill">
              <mxy-icon name="verified" :size="24" color="#F5A623" />
              <text class="credit-text">信用 {{ user.credit }}</text>
            </view>
          </view>
        </view>
      </view>

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
            :key="f.id"
            class="feed-card"
            @click="onFeed(f.id)"
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

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  fetchUserDetail,
  followUser,
  formatFishingAge,
  type PublicUserProfile,
} from '@/api/users';
import { userCatches, formatWeight, type CatchFeedItem } from '@/api/catches';

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();

const heroTopStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {
    paddingTop: statusBarHeight.value + 'px',
  };
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

const userId = ref('');
const user = ref({
  cover: 'https://images.unsplash.com/photo-1767884161822-2c890bdae11f?w=900',
  avatar: '',
  name: '钓友',
  years: '钓龄待填',
  style: '玩法待填',
  distance: '附近',
  credit: 96,
  following: false,
  followerCount: 0,
  stats: {
    catch: 0,
    spot: 0,
    best: '—',
  },
});

type TabKey = 'catch' | 'spot';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'catch', label: '鱼获' },
  { key: 'spot',  label: '钓点' },
];
const activeTab = ref<TabKey>('catch');

const feed = ref<{ id: string; img: string; title: string; sub: string }[]>([]);

function applyProfile(d: PublicUserProfile) {
  user.value.avatar = d.avatar || '';
  user.value.name = d.nickname || `钓友${d.id.slice(-4)}`;
  user.value.years = formatFishingAge(d.fishingAgeBand);
  user.value.style = d.playStyles.join(' / ') || '玩法待填';
  user.value.following = d.following;
  user.value.followerCount = d.followerCount;
  user.value.stats.catch = d.stats.catches;
  user.value.stats.spot = d.stats.spots;
  user.value.stats.best = d.stats.heaviestG ? formatWeight(d.stats.heaviestG) : '—';
}

function catchTitle(c: CatchFeedItem): string {
  const fish = c.fishSpecies.join(' / ') || '鱼获';
  return `${fish} · ${formatWeight(c.weight)}`;
}

async function loadProfile() {
  if (!userId.value) return;
  try {
    const [profile, catches] = await Promise.all([
      fetchUserDetail(userId.value),
      userCatches({ userId: userId.value, visibility: 'public', limit: 6 }),
    ]);
    applyProfile(profile);
    feed.value = catches.list.map((c) => ({
      id: c.id,
      img: c.cover || 'https://images.unsplash.com/photo-1638474690238-4a55f6007635?w=400',
      title: catchTitle(c),
      sub: c.spotName || c.city || '公开鱼获',
    }));
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '主页加载失败', icon: 'none' });
  }
}

onLoad((options) => {
  userId.value = String((options as { id?: string })?.id ?? '');
  void loadProfile();
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onMore = () => uni.showActionSheet({
  itemList: ['举报', '屏蔽', '复制主页链接'],
  success: () => uni.showToast({ title: '操作 (待开发)', icon: 'none' }),
});
const onFollow = () => {
  if (!userId.value) return;
  const next = user.value.following ? 'unfollow' : 'follow';
  followUser(userId.value, next)
    .then((resp) => {
      user.value.following = resp.following;
      user.value.followerCount = resp.followerCount;
      uni.showToast({ title: resp.following ? '已关注' : '已取消关注', icon: 'success' });
    })
    .catch((e: any) => {
      uni.showToast({ title: e?.msg || '操作失败', icon: 'none' });
    });
};
const onInvite = () => {
  if (!userId.value) return;
  uni.navigateTo({ url: `/subpackages/message/conversation/index?id=${userId.value}` });
};
const onFeed = (id: string) => uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${id}` });
</script>

<style lang="scss" scoped src="./index.scss"></style>
