<template>
  <view class="spot-picker-page">
    <view class="picker-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="picker-nav">
        <view class="nav-cancel" @click="onCancel"><text>取消</text></view>
        <text class="nav-title">关联钓点</text>
        <view class="nav-done" @click="onDone"><text>确定</text></view>
      </view>
    </view>

    <scroll-view class="picker-scroll" scroll-y>
      <!-- 搜索 -->
      <view class="search-bar">
        <mxy-icon name="search" :size="40" color="#6B7B85" />
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索钓点名称、河段、小区"
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="loadSpots"
        />
      </view>

      <!-- 迷你地图 -->
      <view class="mini-map">
        <view class="map-water" />
        <view class="map-loc">
          <mxy-icon name="near_me" :size="28" color="#2D8F87" />
          <text>{{ mapDistanceLabel }}</text>
        </view>
        <view class="map-pin">
          <mxy-icon name="location_on" :size="36" color="#fff" />
        </view>
      </view>

      <!-- 筛选 chips -->
      <view class="filters">
        <view
          v-for="f in filters"
          :key="f"
          class="filter-chip"
          :class="{ active: filter === f }"
          @click="onFilter(f)"
        >
          <text>{{ f }}</text>
        </view>
      </view>

      <!-- 钓点列表 -->
      <view class="spot-list">
        <view
          v-for="s in spots"
          :key="s.id"
          class="spot-row"
          :class="{ selected: selected === s.id }"
          @click="onSelect(s)"
        >
          <view class="spot-thumb" :style="{ background: s.thumbBg }">
            <mxy-icon :name="s.thumbIcon" :size="44" :color="s.thumbColor" />
          </view>
          <view class="spot-info">
            <text class="spot-name">{{ s.name }}</text>
            <text class="spot-meta">{{ s.meta }}</text>
            <view v-if="selected === s.id" class="spot-tag">
              <text>已选择</text>
            </view>
          </view>
          <view v-if="selected === s.id" class="spot-check">
            <mxy-icon name="check_circle" :size="44" color="#2D8F87" />
          </view>
        </view>
        <view v-if="!loading && spots.length === 0" class="empty-row">
          <text>{{ emptyText }}</text>
        </view>
        <view v-if="loading" class="empty-row">
          <text>加载中...</text>
        </view>
      </view>

      <!-- 上传新钓点 -->
      <view class="create-entry" @click="onCreate">
        <text>没有这个钓点?上传新钓点</text>
        <mxy-icon name="add_location_alt" :size="44" color="#2D8F87" />
      </view>

      <view class="scroll-pad" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  formatDistance,
  listSpotCities,
  nearbySpots,
  searchSpots,
  SPOT_TYPE_LABEL,
  type SpotListItem,
  type SpotType,
} from '@/api/spots';
import { listFavorites, type FavoriteItem } from '@/api/favorites';

const { statusBarHeight } = useSystemInfo();

const keyword = ref('');
const filter = ref('附近');
const filters = ['附近', '常去', '已收藏'];
const selected = ref<string>('');
const target = ref('catch:create');
const loading = ref(false);
const center = ref({ latitude: 32.0603, longitude: 118.7969 });
const hasCenter = ref(false);
const centerSource = ref<'user' | 'fallback'>('fallback');
const selectedSpot = ref<SpotPickerItem | null>(null);

interface SpotPickerItem {
  id: string;
  name: string;
  meta: string;
  thumbBg: string;
  thumbColor: string;
  thumbIcon: string;
  score: number;
  distance: string;
}

const TYPE_STYLE: Record<SpotType, { thumbBg: string; thumbColor: string; thumbIcon: string }> = {
  wild: { thumbBg: '#D7EEF4', thumbColor: '#5BA9C4', thumbIcon: 'waves' },
  black: { thumbBg: '#FFF4E1', thumbColor: '#F5A623', thumbIcon: 'phishing' },
  paid: { thumbBg: '#EAF5F4', thumbColor: '#2D8F87', thumbIcon: 'park' },
  sea: { thumbBg: '#D7EEF4', thumbColor: '#5BA9C4', thumbIcon: 'waves' },
};

const spots = ref<SpotPickerItem[]>([]);
const emptyText = computed(() => (filter.value === '已收藏' ? '暂无收藏钓点' : '暂无匹配钓点'));
const mapDistanceLabel = computed(() => {
  const distance = selectedSpot.value?.distance || spots.value[0]?.distance;
  if (!distance) return '附近钓点';
  return centerSource.value === 'user' ? `距你 ${distance}` : `距最近 ${distance}`;
});

function ratingToScore(avgRating: number, ratingCount: number): number {
  if (!ratingCount || avgRating <= 0) return 70;
  return Math.round(avgRating * 20);
}

function adaptSpot(item: SpotListItem): SpotPickerItem {
  const style = TYPE_STYLE[item.type] ?? TYPE_STYLE.wild;
  const score = ratingToScore(item.avgRating, item.ratingCount);
  const fish = item.fishSpecies.slice(0, 2).join('/');
  const distance = formatDistance(item.distance);
  return {
    id: item.id,
    name: item.name,
    meta: [distance, `宜钓 ${score}`, fish || SPOT_TYPE_LABEL[item.type]].filter(Boolean).join(' · '),
    thumbBg: style.thumbBg,
    thumbColor: style.thumbColor,
    thumbIcon: style.thumbIcon,
    score,
    distance,
  };
}

function adaptFavorite(item: FavoriteItem): SpotPickerItem | null {
  if (item.kind !== 'spot') return null;
  return {
    id: item.id,
    name: item.name,
    meta: item.meta || item.foot || '已收藏钓点',
    thumbBg: '#EAF5F4',
    thumbColor: '#2D8F87',
    thumbIcon: 'location_on',
    score: 0,
    distance: '',
  };
}

async function ensureCenter() {
  if (hasCenter.value) return;
  try {
    const loc = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) =>
      uni.getLocation({ type: 'gcj02', success: resolve, fail: reject }),
    );
    center.value = { latitude: Number(loc.latitude), longitude: Number(loc.longitude) };
    hasCenter.value = true;
    centerSource.value = 'user';
    return;
  } catch (_) {}
  const { list } = await listSpotCities({ limit: 1 });
  const first = list.find((item) => item.spots > 0) ?? list[0];
  if (first) center.value = { latitude: first.latitude, longitude: first.longitude };
  hasCenter.value = true;
  centerSource.value = 'fallback';
}

async function loadSpots() {
  if (loading.value) return;
  loading.value = true;
  try {
    const kw = keyword.value.trim();
    if (filter.value === '已收藏') {
      const resp = await listFavorites({ type: 'spot', limit: 50 });
      spots.value = resp.list.map(adaptFavorite).filter((item): item is SpotPickerItem => !!item);
      return;
    }
    await ensureCenter();
    if (kw) {
      const resp = await searchSpots({
        keyword: kw,
        lat: center.value.latitude,
        lng: center.value.longitude,
        radius: 200000,
        limit: 50,
      });
      spots.value = resp.list.map(adaptSpot);
      return;
    }
    const resp = await nearbySpots({
      lat: center.value.latitude,
      lng: center.value.longitude,
      radius: 200000,
      limit: 50,
    });
    const list = resp.list.map(adaptSpot);
    spots.value = filter.value === '常去'
      ? [...list].sort((a, b) => b.score - a.score)
      : list;
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '钓点加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function applyInitialSpot(data: unknown) {
  if (!data || typeof data !== 'object') return;
  const item = data as { id?: unknown; name?: unknown };
  if (typeof item.id !== 'string') return;
  selected.value = item.id;
  if (typeof item.name === 'string') {
    selectedSpot.value = {
      id: item.id,
      name: item.name,
      meta: '已选择',
      thumbBg: '#EAF5F4',
      thumbColor: '#2D8F87',
      thumbIcon: 'location_on',
      score: 0,
      distance: '',
    };
  }
}

onLoad((options) => {
  const lat = Number(options?.lat);
  const lng = Number(options?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    center.value = { latitude: lat, longitude: lng };
    hasCenter.value = true;
    centerSource.value = 'user';
  }
  selected.value = decodeURIComponent(String(options?.selected || ''));
  const currentTarget = decodeURIComponent(String(options?.target || ''));
  if (currentTarget) target.value = currentTarget;
  const ch = (uni as any).getOpenerEventChannel?.();
  ch?.on?.('initSpot', (data: unknown) => {
    applyInitialSpot(data);
  });
  void loadSpots();
});

const onSelect = (spot: SpotPickerItem) => {
  selected.value = spot.id;
  selectedSpot.value = spot;
};
const onFilter = (next: string) => {
  if (filter.value === next) return;
  filter.value = next;
  void loadSpots();
};
const onCancel = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onDone = () => {
  if (!selected.value) {
    uni.showToast({ title: '请先选择钓点', icon: 'none' });
    return;
  }
  const spot = spots.value.find(s => s.id === selected.value) ?? selectedSpot.value;
  if (!spot) {
    uni.showToast({ title: '所选钓点已失效', icon: 'none' });
    return;
  }
  const ch = (uni as any).getOpenerEventChannel?.();
  ch?.emit?.('spotSelected', { id: spot.id, name: spot.name });
  uni.$emit(`${target.value}:spot-selected`, { id: spot.id, name: spot.name });
  uni.navigateBack({ delta: 1 });
};
const onCreate = () => {
  uni.navigateTo({ url: '/subpackages/spot/create/index' });
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
