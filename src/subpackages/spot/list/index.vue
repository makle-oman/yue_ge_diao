<template>
  <view class="spot-list-page">
    <!-- 顶部：大标题 + 圆形地图按钮 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#1A2B33" />
        </view>
        <text class="nav-title">钓点列表</text>
        <view class="map-btn" @click="onOpenMap">
          <mxy-icon name="map" :size="36" color="#2D8F87" />
        </view>
      </view>

      <view class="search-box" @click="onSearch">
        <mxy-icon name="search" :size="32" color="#6B7B85" />
        <text class="search-placeholder">搜索钓点 / 地址 / 鱼种</text>
      </view>

      <scroll-view class="chip-scroll" scroll-x show-scrollbar="false">
        <view class="chip-row">
          <mxy-chip
            v-for="c in chips"
            :key="c.key"
            :label="c.label"
            :active="activeChip === c.key"
            @click="onChip(c.key)"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="summary">
        <text class="summary-title">南京附近 · {{ filteredSpots.length }} 个钓点</text>
        <view class="sort-pill">
          <text>距离</text>
          <mxy-icon name="keyboard_arrow_down" :size="24" color="#2D8F87" />
        </view>
      </view>

      <view class="spot-list">
        <view
          v-for="s in filteredSpots"
          :key="s.id"
          class="spot-card"
          @click="onOpen(s)"
        >
          <view class="cover" :class="`tone-${s.tone}`">
            <mxy-icon name="set_meal" :size="44" :color="s.iconColor" />
          </view>
          <view class="row-main">
            <view class="row-head">
              <text class="spot-name">{{ s.name }}</text>
              <text class="spot-distance">{{ s.distance }}</text>
            </view>
            <text class="spot-meta">{{ s.meta }}</text>
            <view class="tag-row">
              <mxy-tag v-for="t in s.tags" :key="t" tone="primary" size="sm">{{ t }}</mxy-tag>
            </view>
            <text class="spot-foot">{{ s.foot }}</text>
          </view>
        </view>
      </view>

      <view v-if="!loading && filteredSpots.length === 0" class="list-empty" style="text-align:center;color:#6B7B85;padding:80rpx 0;font-size:28rpx;">
        <text>附近暂无钓点，换个范围试试</text>
      </view>
      <view v-if="loading" class="list-foot" style="text-align:center;color:#6B7B85;padding:32rpx 0;font-size:24rpx;">加载中…</view>
      <view v-else-if="!hasMore && filteredSpots.length > 0" class="list-foot" style="text-align:center;color:#6B7B85;padding:32rpx 0;font-size:24rpx;">没有更多了</view>

    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  listSpots,
  formatDistance,
  SPOT_TYPE_LABEL,
  type SpotListItem,
  type SpotType,
} from '@/api/spots';

type ChipKey = 'all' | 'wild' | 'pond' | 'near';
type Tone = 'primary' | 'blue' | 'orange';

interface ChipItem { readonly key: ChipKey; readonly label: string }
interface SpotItem {
  readonly id: string;
  readonly name: string;
  readonly distance: string;
  readonly meta: string;
  readonly tags: readonly string[];
  readonly foot: string;
  readonly tone: Tone;
  readonly iconColor: string;
}

const { statusBarHeight } = useSystemInfo();

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const PAGE_LIMIT = 20;
const NORMAL_RADIUS = 50000;
const NEAR_RADIUS = 5000;

const activeChip = ref<ChipKey>('all');
const chips: readonly ChipItem[] = [
  { key: 'all', label: '全部' },
  { key: 'wild', label: '野钓' },
  { key: 'pond', label: '黑坑' },
  { key: 'near', label: '5km内' },
];

const center = ref({ ...DEFAULT_CENTER });
const spots = ref<SpotItem[]>([]);
const cursor = ref<string | null>(null);
const hasMore = ref(true);
const loading = ref(false);

/** 后端 type → 列表卡片 tone（icon 背景）。 */
const TYPE_TONE: Record<SpotType, { tone: Tone; iconColor: string }> = {
  wild:  { tone: 'blue',    iconColor: '#5BA9C4' },
  black: { tone: 'orange',  iconColor: '#F5A623' },
  paid:  { tone: 'primary', iconColor: '#2D8F87' },
  sea:   { tone: 'blue',    iconColor: '#5BA9C4' },
};

function buildMeta(item: SpotListItem): string {
  const parts: string[] = [];
  if (item.ratingCount > 0) parts.push(`评分 ${item.avgRating.toFixed(1)}`);
  parts.push(SPOT_TYPE_LABEL[item.type]);
  if (item.city) parts.push(item.city);
  return parts.join(' · ');
}

function buildFoot(item: SpotListItem): string {
  if (item.wantCount > 0) return `${item.wantCount} 人想去`;
  if (item.ratingCount > 0) return `${item.ratingCount} 条评价`;
  return '暂无人去过';
}

function adapt(item: SpotListItem): SpotItem {
  const tone = TYPE_TONE[item.type] ?? TYPE_TONE.wild;
  return {
    id: item.id,
    name: item.name,
    distance: formatDistance(item.distance),
    meta: buildMeta(item),
    tags: item.fishSpecies.slice(0, 3),
    foot: buildFoot(item),
    tone: tone.tone,
    iconColor: tone.iconColor,
  };
}

/** chip → 请求参数。`near` 收紧 radius，其它三个用 type 过滤。 */
function paramsForChip(chip: ChipKey, cur: string | null) {
  const base = {
    lat: center.value.latitude,
    lng: center.value.longitude,
    radius: NORMAL_RADIUS,
    limit: PAGE_LIMIT,
    cursor: cur,
  };
  switch (chip) {
    case 'wild': return { ...base, type: 'wild' as SpotType };
    case 'pond': return { ...base, type: 'black' as SpotType };
    case 'near': return { ...base, radius: NEAR_RADIUS };
    default:     return base;
  }
}

async function loadFirstPage() {
  if (loading.value) return;
  loading.value = true;
  cursor.value = null;
  hasMore.value = true;
  spots.value = [];
  try {
    const resp = await listSpots(paramsForChip(activeChip.value, null));
    spots.value = resp.list.map(adapt);
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const resp = await listSpots(paramsForChip(activeChip.value, cursor.value));
    spots.value = spots.value.concat(resp.list.map(adapt));
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '加载更多失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function locateThenLoad() {
  try {
    const loc: any = await new Promise((resolve, reject) =>
      uni.getLocation({ type: 'gcj02', success: resolve, fail: reject }),
    );
    center.value = { latitude: loc.latitude, longitude: loc.longitude };
  } catch (_) {
    // 拿不到定位就用 DEFAULT_CENTER
  }
  await loadFirstPage();
}

onMounted(locateThenLoad);

function onChip(key: ChipKey) {
  if (activeChip.value === key) return;
  activeChip.value = key;
  loadFirstPage();
}

const filteredSpots = computed(() => spots.value);

const onOpenMap = () => uni.switchTab({ url: '/pages/index/index' }).catch(() => uni.navigateBack({ delta: 1 }));
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => uni.switchTab({ url: '/pages/index/index' }));
const onSearch = () => uni.showToast({ title: '搜索功能开发中', icon: 'none' });
const onOpen = (s: SpotItem) => uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${s.id}` });
</script>

<style lang="scss" scoped src="./index.scss"></style>
