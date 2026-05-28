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
        />
      </view>

      <!-- 迷你地图 -->
      <view class="mini-map">
        <view class="map-water" />
        <view class="map-loc">
          <mxy-icon name="near_me" :size="28" color="#2D8F87" />
          <text>距你 2.1km</text>
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
          @click="filter = f"
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
          @click="onSelect(s.id)"
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
import { computed, onMounted, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  nearbySpots,
  searchSpots,
  formatDistance,
  SPOT_TYPE_LABEL,
  type SpotListItem,
} from '@/api/spots';

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };

const { statusBarHeight } = useSystemInfo();

interface SpotOption {
  id: string;
  name: string;
  meta: string;
  thumbBg: string;
  thumbColor: string;
  thumbIcon: string;
}

const keyword = ref('');
const filter = ref('附近');
const filters = ['附近', '常去', '已收藏'];
const selected = ref('');
const target = ref('catch:create');
const loading = ref(false);

const fallbackSpots: SpotOption[] = [
  {
    id: '',
    name: '未关联钓点',
    meta: '只记录鱼获,暂不绑定具体钓点',
    thumbBg: '#EAEEF1',
    thumbColor: '#6B7B85',
    thumbIcon: 'location_off',
  },
];

const spots = ref<SpotOption[]>(fallbackSpots);
const selectedSpot = computed(() => spots.value.find((s) => s.id === selected.value));

function adaptSpot(s: SpotListItem, index: number): SpotOption {
  const colors = [
    ['#D7EEF4', '#5BA9C4', 'waves'],
    ['#EAF5F4', '#2D8F87', 'park'],
    ['#FFF4E1', '#F5A623', 'phishing'],
  ] as const;
  const [thumbBg, thumbColor, thumbIcon] = colors[index % colors.length];
  const distance = formatDistance(s.distance);
  const fish = s.fishSpecies.slice(0, 2).join('/');
  return {
    id: s.id,
    name: s.name,
    meta: [distance, SPOT_TYPE_LABEL[s.type], fish].filter(Boolean).join(' · '),
    thumbBg,
    thumbColor,
    thumbIcon,
  };
}

async function loadSpots() {
  if (loading.value) return;
  loading.value = true;
  try {
    const kw = keyword.value.trim();
    const resp = kw
      ? await searchSpots({ keyword: kw, limit: 20 })
      : await nearbySpots({
          lat: DEFAULT_CENTER.latitude,
          lng: DEFAULT_CENTER.longitude,
          radius: 50_000,
          limit: 20,
        });
    const source = !kw && resp.list.length === 0
      ? (await searchSpots({ limit: 20 })).list
      : resp.list;
    const list = source.map(adaptSpot);
    spots.value = list.length ? list : fallbackSpots;
    if (selected.value && !spots.value.some((s) => s.id === selected.value)) {
      selected.value = '';
    }
  } catch (e) {
    console.warn('[spot-picker] load spots failed', e);
    spots.value = fallbackSpots;
  } finally {
    loading.value = false;
  }
}

const onSelect = (id: string) => {
  selected.value = id;
};
const onCancel = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onDone = () => {
  const spot = selectedSpot.value;
  if (!spot) {
    uni.showToast({ title: '请先选择钓点', icon: 'none' });
    return;
  }
  uni.$emit(`${target.value}:spot-selected`, {
    id: spot.id,
    name: spot.name,
  });
  uni.showToast({ title: '已关联 ' + spot.name, icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }), 300);
};
const onCreate = () => {
  uni.navigateTo({ url: '/subpackages/spot/create/index' });
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(keyword, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadSpots(), 300);
});

onLoad((options) => {
  selected.value = decodeURIComponent(String(options?.selected || ''));
  const currentTarget = decodeURIComponent(String(options?.target || ''));
  if (currentTarget) target.value = currentTarget;
});

onMounted(loadSpots);
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
