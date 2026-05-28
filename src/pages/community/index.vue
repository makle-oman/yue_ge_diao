<template>
  <view class="community-page">
    <!-- 顶部 Tab + 搜索 -->
    <view
      class="feed-header"
      :style="feedHeaderStyle"
    >
      <view class="feed-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="feed-tab"
          :class="{ active: activeTab === tab.key }"
          @click="onTabChange(tab.key)"
        >
          <text class="feed-tab-text">{{ tab.label }}</text>
          <view v-if="activeTab === tab.key" class="feed-tab-bar" />
        </view>
      </view>

      <view class="feed-actions">
        <view class="icon-btn" @click="onSearch">
          <mxy-icon name="search" :size="40" color="#1A2B33" />
        </view>
      </view>
    </view>

    <!-- 双列瀑布流 -->
    <scroll-view
      class="feed-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="keyword" class="search-summary">
        <text class="search-summary-text">搜索：{{ keyword }}</text>
        <text class="search-summary-clear" @click="clearSearch">清除</text>
      </view>

      <view class="feed-grid">
        <view class="feed-col">
          <mxy-feed-card
            v-for="item in colLeft"
            :key="item.id"
            :cover="item.cover"
            :title="item.title"
            :tag="item.tag"
            :location="item.location"
            :species="item.species"
            :author-name="item.author"
            :author-avatar="item.avatar"
            :likes="item.likes"
            :liked="item.liked"
            @click="onCardTap(item)"
            @like="onLike(item)"
          />
        </view>
        <view class="feed-col">
          <mxy-feed-card
            v-for="item in colRight"
            :key="item.id"
            :cover="item.cover"
            :title="item.title"
            :tag="item.tag"
            :location="item.location"
            :species="item.species"
            :author-name="item.author"
            :author-avatar="item.avatar"
            :likes="item.likes"
            :liked="item.liked"
            @click="onCardTap(item)"
            @like="onLike(item)"
          />
        </view>
      </view>

      <view class="feed-end">
        <text class="feed-end-text">{{ feedEndText }}</text>
      </view>
    </scroll-view>

    <CustomTabBar current="community" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  listCatches,
  likeCatch,
  formatWeight,
  type CatchFeedItem,
  type FeedTab,
} from '@/api/catches';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface FeedItem {
  id: string;
  cover: string;
  title: string;
  tag?: string;
  location?: string;
  species?: string;
  author: string;
  avatar?: string;
  likes: number;
  liked: boolean;
}

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();

const feedHeaderStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {
    paddingTop: statusBarHeight.value + 'px',
  };
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

const tabs: { key: FeedTab; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'nearby',    label: '附近' },
  { key: 'follow',    label: '关注' },
];

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const activeTab = ref<FeedTab>('recommend');
const refreshing = ref(false);
const loading = ref(false);
const hasMore = ref(false);
const cursor = ref<string | null>(null);
const keyword = ref('');
const center = ref({ ...DEFAULT_CENTER });
const feedList = ref<FeedItem[]>([]);

// 双列瀑布流: 简单按奇偶分两列,实际生产可按累计高度分配
const colLeft = computed(() => feedList.value.filter((_, i) => i % 2 === 0));
const colRight = computed(() => feedList.value.filter((_, i) => i % 2 === 1));
const feedEndText = computed(() => {
  if (loading.value) return '加载中…';
  if (feedList.value.length === 0) return keyword.value ? '没有匹配鱼获' : '暂无鱼获';
  return hasMore.value ? '上拉加载更多' : '— 没有更多了 —';
});

function catchTitle(c: CatchFeedItem): string {
  if (c.content) return c.content;
  const fish = c.fishSpecies.join(' / ') || '鱼获';
  return `${fish} · ${formatWeight(c.weight)}`;
}

function formatDistanceText(m: number): string {
  if (m < 10) return '<10m';
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function toFeedItem(c: CatchFeedItem): FeedItem {
  const distance = c.distance != null ? formatDistanceText(c.distance) : '';
  return {
    id: c.id,
    cover: c.cover || 'https://images.unsplash.com/photo-1638474690238-4a55f6007635?w=600',
    title: catchTitle(c),
    tag: '鱼获',
    location: c.spotName || c.city || distance || undefined,
    species: c.fishSpecies[0],
    author: c.userName || `钓友${c.userId.slice(-4)}`,
    avatar: c.userAvatar || undefined,
    likes: c.likeCount,
    liked: c.liked,
  };
}

async function ensureLocation() {
  if (activeTab.value !== 'nearby') return;
  try {
    const loc: any = await new Promise((resolve, reject) =>
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 4000,
        success: resolve,
        fail: reject,
      }),
    );
    center.value = { latitude: loc.latitude, longitude: loc.longitude };
  } catch {
    uni.showToast({ title: '定位失败，已使用默认位置', icon: 'none' });
  }
}

async function loadFeed(reset = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      feedList.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
    await ensureLocation();
    const resp = await listCatches({
      tab: activeTab.value,
      keyword: keyword.value.trim() || undefined,
      lat: activeTab.value === 'nearby' ? center.value.latitude : undefined,
      lng: activeTab.value === 'nearby' ? center.value.longitude : undefined,
      radius: activeTab.value === 'nearby' ? 50_000 : undefined,
      limit: 20,
      cursor: cursor.value,
    });
    feedList.value = feedList.value.concat(resp.list.map(toFeedItem));
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '鱼获加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onTabChange(tab: FeedTab) {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  void loadFeed(true);
}

const onCardTap = (item: FeedItem) => {
  uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${item.id}` });
};

const onLike = (item: FeedItem) => {
  const nextLiked = !item.liked;
  item.liked = !item.liked;
  item.likes += item.liked ? 1 : -1;
  likeCatch(item.id, nextLiked ? 'like' : 'unlike').catch((e: any) => {
    item.liked = !nextLiked;
    item.likes += nextLiked ? -1 : 1;
    uni.showToast({ title: e?.msg || '操作失败', icon: 'none' });
  });
};

const onSearch = () => {
  uni.showModal({
    title: '搜索鱼获',
    editable: true,
    placeholderText: '鱼种 / 钓点 / 内容 / 钓友',
    success: (res) => {
      if (!res.confirm) return;
      keyword.value = (res.content || '').trim();
      void loadFeed(true);
    },
  });
};

const clearSearch = () => {
  keyword.value = '';
  void loadFeed(true);
};

const onRefresh = async () => {
  refreshing.value = true;
  try {
    await loadFeed(true);
  } finally {
    refreshing.value = false;
  }
};

const loadMore = () => {
  if (!hasMore.value || loading.value) return;
  void loadFeed(false);
};

onMounted(() => {
  void loadFeed(true);
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
