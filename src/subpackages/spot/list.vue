<template>
  <view class="spot-list-page">
    <!-- 顶部：大标题 + 圆形地图按钮 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
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
            @click="activeChip = c.key"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <scroll-view class="content" scroll-y>
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

      <view class="end-pad" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

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
  readonly kind: 'wild' | 'pond';
  readonly distanceKm: number;
}

const { statusBarHeight } = useSystemInfo();

const activeChip = ref<ChipKey>('all');
const chips: readonly ChipItem[] = [
  { key: 'all', label: '全部' },
  { key: 'wild', label: '野钓' },
  { key: 'pond', label: '黑坑' },
  { key: 'near', label: '5km内' },
];

const spots: readonly SpotItem[] = [
  {
    id: 's1',
    name: '燕子矶江边',
    distance: '2.3km',
    distanceKm: 2.3,
    meta: '评分 4.5 · 免费 · 可停车',
    tags: ['鲫鱼', '翘嘴'],
    foot: '今天 3 条鱼获',
    tone: 'blue',
    iconColor: '#5BA9C4',
    kind: 'wild',
  },
  {
    id: 's2',
    name: '江心洲北汊',
    distance: '2.3km',
    distanceKm: 2.3,
    meta: '路亚 · 江湾 · 夜钓友好',
    tags: ['翘嘴', '鲈鱼'],
    foot: '最近 18 人去过',
    tone: 'primary',
    iconColor: '#2D8F87',
    kind: 'wild',
  },
  {
    id: 's3',
    name: '老山水库外湾',
    distance: '2.3km',
    distanceKm: 2.3,
    meta: '水库 · 收费30 · 有厕所',
    tags: ['鲤鱼', '草鱼'],
    foot: '周末人多',
    tone: 'primary',
    iconColor: '#2D8F87',
    kind: 'pond',
  },
  {
    id: 's4',
    name: '青龙湾黑坑',
    distance: '2.3km',
    distanceKm: 2.3,
    meta: '黑坑 · 100/4小时 · 可停车',
    tags: ['鲤鱼', '青鱼'],
    foot: '今日放鱼',
    tone: 'orange',
    iconColor: '#F5A623',
    kind: 'pond',
  },
];

const filteredSpots = computed<readonly SpotItem[]>(() => {
  switch (activeChip.value) {
    case 'wild':  return spots.filter(s => s.kind === 'wild');
    case 'pond':  return spots.filter(s => s.kind === 'pond');
    case 'near':  return spots.filter(s => s.distanceKm <= 5);
    default:      return spots;
  }
});

const onOpenMap = () => uni.switchTab({ url: '/pages/index/index' }).catch(() => uni.navigateBack({ delta: 1 }));
const onSearch = () => uni.showToast({ title: '搜索功能开发中', icon: 'none' });
const onOpen = (s: SpotItem) => uni.navigateTo({ url: `/subpackages/spot/detail?id=${s.id}` });
</script>

<style lang="scss" scoped src="./list.scss"></style>
