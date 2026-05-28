<template>
  <view class="favorites-page">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">我的收藏</text>
        <view class="nav-search" @click="onSearch">
          <mxy-icon name="search" :size="38" color="#1A2B33" />
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="form">
        <!-- Tabs -->
        <view class="tabs">
          <view
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="onTab(t.key)"
          >
            <text>{{ t.label }} {{ t.count }}</text>
          </view>
        </view>

        <!-- 今日最佳浮卡 -->
        <view v-if="activeTab === 'spot' && todayBest.name" class="today-best">
          <view class="today-left">
            <text class="today-num">{{ todayBest.score }}</text>
            <text class="today-tip">收藏里今日最适合去</text>
          </view>
          <view class="today-info">
            <text class="today-name">{{ todayBest.name }} · {{ todayBest.window }}</text>
            <text class="today-meta">{{ todayBest.weather }}</text>
            <text class="today-meta">距你 {{ todayBest.distance }}</text>
          </view>
        </view>

        <!-- 列表 -->
        <view class="fav-list">
          <view
            v-for="f in filtered"
            :key="f.id"
            class="fav-row"
            :class="`kind-${f.kind}`"
            @click="onOpen(f)"
          >
            <view class="row-tag" :class="`tag--${f.tagTone}`">
              <text>{{ f.tagText }}</text>
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ f.name }}</text>
                <text class="row-action" @click.stop="onRemove(f)">{{ f.actionText }}</text>
              </view>
              <text class="row-meta">{{ f.meta }}</text>
              <text class="row-foot">{{ f.foot }}</text>
            </view>
          </view>
          <view v-if="!loading && filtered.length === 0" class="list-state">
            <text class="list-state-text">{{ activeTab === 'spot' ? '暂无内容收藏' : '暂无关注钓友' }}</text>
          </view>
          <view v-if="loading" class="list-state">
            <text class="list-state-text">加载中…</text>
          </view>
          <view v-else-if="hasMore" class="list-state" @click="loadMore">
            <text class="list-state-text">加载更多</text>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 取消收藏确认 Sheet (Design 37) -->
    <mxy-bottom-sheet
      v-model:visible="removeOpen"
      title="取消收藏"
      @cancel="removeOpen = false"
      @done="removeOpen = false"
    >
      <view v-if="removeTarget" class="unfav-banner">
        <view class="unfav-thumb">
          <mxy-icon name="location_on" :size="40" color="#5BA9C4" />
        </view>
        <view class="unfav-banner-info">
          <text class="unfav-banner-name">{{ removeTarget.name }}</text>
          <text class="unfav-banner-sub">取消后可重新从{{ removeSourceLabel }}收藏</text>
        </view>
      </view>

      <view class="unfav-body">
        <text class="unfav-body-title">确认取消收藏？</text>
        <text class="unfav-body-desc">该{{ removeKindLabel }}会从"我的收藏"中移除，不影响你的历史浏览和鱼获记录。</text>
      </view>

      <view class="unfav-buttons">
        <view class="unfav-btn unfav-btn--ghost" @click="removeOpen = false">
          <text class="unfav-btn-text">保留收藏</text>
        </view>
        <view class="unfav-btn unfav-btn--danger" @click="onConfirmRemove">
          <text class="unfav-btn-text white">确认取消</text>
        </view>
      </view>

      <view class="unfav-tip">
        <mxy-icon name="info" :size="36" color="#5BA9C4" />
        <text class="unfav-tip-text">取消收藏不会通知{{ removeTarget?.kind === 'user' ? '对方' : '发布者' }}。</text>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  listFavorites,
  removeFavorite,
  type FavoriteItem as ApiFavoriteItem,
  type FavoriteKind,
  type FavoriteListType,
} from '@/api/favorites';

const { statusBarHeight } = useSystemInfo();

type TabKey = 'spot' | 'user';
type TagTone = 'primary' | 'blue' | 'orange';

interface FavItem extends ApiFavoriteItem {
  tagTone: TagTone;
  actionText: string;
}

const activeTab = ref<TabKey>('spot');
const favoriteSpots = ref<FavItem[]>([]);
const favoriteUsers = ref<FavItem[]>([]);
const counts = ref({ spot: 0, user: 0 });
const cursor = ref<string | null>(null);
const hasMore = ref(false);
const loading = ref(false);

const tabs = computed(() => [
  { key: 'spot' as TabKey, label: '内容', count: counts.value.spot },
  { key: 'user' as TabKey, label: '钓友', count: counts.value.user },
]);

const filtered = computed<FavItem[]>(() =>
  activeTab.value === 'spot' ? favoriteSpots.value : favoriteUsers.value,
);

const todayBest = computed(() => {
  const spot = favoriteSpots.value.find((item) => item.kind === 'spot');
  return {
    score: spot ? Math.min(99, 70 + Math.max(0, counts.value.spot)) : 0,
    name: spot?.name || '',
    window: spot?.meta || '收藏钓点',
    weather: '天气评分待接入',
    distance: spot?.foot || '--',
  };
});

const removeOpen = ref(false);
const removeTarget = ref<FavItem | null>(null);

const removeKindLabel = computed(() => {
  if (removeTarget.value?.kind === 'user') return '钓友';
  if (removeTarget.value?.kind === 'catch') return '鱼获';
  return '钓点';
});

const removeSourceLabel = computed(() => {
  if (removeTarget.value?.kind === 'user') return '钓友主页';
  if (removeTarget.value?.kind === 'catch') return '鱼获详情';
  return '钓点详情';
});

function tagTone(kind: FavoriteKind): TagTone {
  if (kind === 'user') return 'primary';
  if (kind === 'catch') return 'orange';
  return 'blue';
}

function actionText(kind: FavoriteKind): string {
  return kind === 'user' ? '取关' : '取消';
}

function adapt(item: ApiFavoriteItem): FavItem {
  return {
    ...item,
    tagTone: tagTone(item.kind),
    actionText: actionText(item.kind),
  };
}

function typeForTab(tab: TabKey): FavoriteListType {
  return tab === 'user' ? 'user' : 'spot';
}

async function loadList(reset = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      cursor.value = null;
      hasMore.value = false;
      if (activeTab.value === 'spot') favoriteSpots.value = [];
      else favoriteUsers.value = [];
    }

    const resp = await listFavorites({
      type: typeForTab(activeTab.value),
      limit: 20,
      cursor: cursor.value,
    });
    counts.value = resp.counts;

    const next = resp.list.map(adapt);
    if (activeTab.value === 'spot') {
      favoriteSpots.value = reset ? next : favoriteSpots.value.concat(next);
    } else {
      favoriteUsers.value = reset ? next : favoriteUsers.value.concat(next);
    }
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e: any) {
    console.warn('[favorites] load failed', e);
    uni.showToast({ title: e?.msg || '加载收藏失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onTab(key: TabKey) {
  if (activeTab.value === key) return;
  activeTab.value = key;
  void loadList(true);
}

function loadMore() {
  if (loading.value || !hasMore.value) return;
  void loadList(false);
}

onShow(() => {
  void loadList(true);
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onSearch = () => uni.showToast({ title: '搜索收藏 (待开发)', icon: 'none' });
const onOpen = (f: FavItem) => {
  if (f.kind === 'spot') uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${f.id}` });
  if (f.kind === 'catch') uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${f.id}` });
  if (f.kind === 'user') uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${f.id}` });
};
const onRemove = (f: FavItem) => {
  removeTarget.value = f;
  removeOpen.value = true;
};

const onConfirmRemove = async () => {
  const f = removeTarget.value;
  if (!f) return;
  try {
    await removeFavorite({ kind: f.kind, id: f.id });
    removeOpen.value = false;
    removeTarget.value = null;
    uni.showToast({ title: f.kind === 'user' ? '已取关' : '已取消收藏', icon: 'success' });
    void loadList(true);
  } catch (e) {
    console.warn('[favorites] remove failed', e);
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
