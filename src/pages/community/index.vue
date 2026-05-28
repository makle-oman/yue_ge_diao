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
          @click="activeTab = tab.key"
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
      lower-threshold="80"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
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
import { computed, onMounted, ref, watch } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import CustomTabBar from '@/components/CustomTabBar.vue';
import {
  listCatches,
  likeCatch,
  formatWeight,
  type CatchFeedItem,
  type FeedTab,
} from '@/api/catches';

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

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1635712291708-7afe9e037503?w=600';

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

const tabs: Array<{ key: FeedTab; label: string }> = [
  { key: 'recommend', label: '推荐' },
  { key: 'nearby', label: '附近' },
  { key: 'follow', label: '关注' },
];

const activeTab = ref<FeedTab>('recommend');
const refreshing = ref(false);
const loading = ref(false);
const hasMore = ref(true);
const cursor = ref<string | null>(null);
const loadError = ref('');
const feedList = ref<FeedItem[]>([]);

const colLeft = computed(() => feedList.value.filter((_, i) => i % 2 === 0));
const colRight = computed(() => feedList.value.filter((_, i) => i % 2 === 1));
const feedEndText = computed(() => {
  if (loading.value && feedList.value.length === 0) return '加载中...';
  if (loadError.value) return loadError.value;
  if (feedList.value.length === 0) return '暂无鱼获动态';
  return hasMore.value ? '上拉加载更多' : '没有更多了';
});

function pickCover(item: CatchFeedItem): string {
  const src = item.cover || item.photos[0];
  if (src && /^https?:\/\//.test(src)) return src;
  return FALLBACK_COVER;
}

function formatDistance(distance?: number): string {
  if (distance == null) return '';
  if (distance >= 1000) return `${(distance / 1000).toFixed(1)}km`;
  return `${Math.round(distance)}m`;
}

function adaptFeedItem(item: CatchFeedItem): FeedItem {
  const species = item.fishSpecies.slice(0, 2).join('/');
  const weight = item.weight != null ? formatWeight(item.weight) : '';
  const fallbackTitle = [species || '鱼获', weight].filter(Boolean).join(' · ');
  const title = item.content?.trim() || fallbackTitle || '一条新鱼获';
  const distance = formatDistance(item.distance);
  const location = [item.spotName || item.city || '', distance].filter(Boolean).join(' · ');

  return {
    id: item.id,
    cover: pickCover(item),
    title,
    tag: '鱼获',
    location,
    species,
    author: item.userName || `钓友${item.userId.slice(-4)}`,
    avatar: item.userAvatar || '',
    likes: item.likeCount,
    liked: item.liked,
  };
}

async function loadFeed(reset = false) {
  if (loading.value) return;
  if (!reset && !hasMore.value) return;

  loading.value = true;
  loadError.value = '';
  try {
    const resp = await listCatches({
      tab: activeTab.value,
      lat: activeTab.value === 'nearby' ? DEFAULT_CENTER.latitude : undefined,
      lng: activeTab.value === 'nearby' ? DEFAULT_CENTER.longitude : undefined,
      radius: activeTab.value === 'nearby' ? 50_000 : undefined,
      limit: 20,
      cursor: reset ? null : cursor.value,
    });
    const next = resp.list.map(adaptFeedItem);
    feedList.value = reset ? next : feedList.value.concat(next);
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e) {
    console.warn('[community] load feed failed', e);
    loadError.value = '动态加载失败,下拉重试';
    if (reset) {
      feedList.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
  } finally {
    loading.value = false;
  }
}

const loadMore = () => loadFeed(false);

const onCardTap = (item: FeedItem) => {
  uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${item.id}` });
};

const onLike = async (item: FeedItem) => {
  const oldLiked = item.liked;
  const oldLikes = item.likes;
  item.liked = !oldLiked;
  item.likes = Math.max(0, oldLikes + (item.liked ? 1 : -1));

  try {
    const resp = await likeCatch(item.id, item.liked ? 'like' : 'unlike');
    item.likes = resp.likeCount;
  } catch (e) {
    item.liked = oldLiked;
    item.likes = oldLikes;
    console.warn('[community] like failed', e);
  }
};

const onSearch = () => {
  uni.showToast({ title: '搜索(待开发)', icon: 'none' });
};

const onRefresh = async () => {
  refreshing.value = true;
  await loadFeed(true);
  refreshing.value = false;
};

watch(activeTab, () => {
  cursor.value = null;
  hasMore.value = true;
  loadFeed(true);
});

onMounted(() => {
  loadFeed(true);
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
