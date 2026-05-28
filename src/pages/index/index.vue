<template>
  <view class="home-page">
    <!--
      地图主体 (uniapp 跨端: 小程序用原生 map 组件, H5 可后期接入腾讯地图 JS SDK)
      ⚠️ 微信小程序坑: <map> 是原生组件, 普通 <view> 默认会被它盖住。
      下方所有浮层 (top-bar / fishing-index / float-actions / angler-entry / spot-sheet)
      在真机微信小程序里 *可能* 显示不出来, 真机测试后若出现遮挡, 需把外层 <view> 改成 <cover-view>,
      <text> 改成 <cover-view>, 并把 mxy-icon 替换为 cover-image (因为字体图标在 cover-view 里不渲染)。
      H5/App 端无此问题。
    -->
    <!-- #ifdef MP-WEIXIN -->
    <map
      class="map-view"
      :latitude="center.latitude"
      :longitude="center.longitude"
      :scale="14"
      :markers="markers"
      show-location
      enable-zoom
      enable-scroll
      @markertap="onMarkerTap"
    />
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <view class="map-mock">
      <view class="map-mock-grid" />
      <text class="map-mock-tip">地图区域 · H5 端待接入腾讯地图 JS SDK</text>
    </view>
    <!-- #endif -->

    <!-- 顶部胶囊导航 (城市选择 + 搜索 + 通知) -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view
        class="top-row"
        :style="topRowStyle"
      >
        <view class="city-pill" @click="onCityTap">
          <text class="city-name">{{ city }}</text>
          <mxy-icon name="keyboard_arrow_down" :size="28" color="#1A2B33" />
        </view>

        <view class="search-pill" @click="onSearchTap">
          <mxy-icon name="search" :size="32" color="#6B7B85" />
          <text class="search-placeholder">搜索钓点 / 鱼种 / 钓友</text>
        </view>

        <view class="notify-pill" @click="onNotifyTap">
          <mxy-icon name="notifications" :size="36" color="#1A2B33" />
          <view v-if="hasUnread" class="notify-dot" />
        </view>
      </view>

      <!-- 钓法筛选 Chips -->
      <scroll-view class="chip-scroll" scroll-x show-scrollbar="false">
        <view class="chip-row">
          <mxy-chip
            v-for="chip in filterChips"
            :key="chip.key"
            :label="chip.label"
            :active="activeChip === chip.key"
            @click="onChipTap(chip.key)"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 右上角宜钓指数浮卡 -->
    <view class="fishing-index">
      <text class="index-score">{{ fishingIndex.score }}</text>
      <text class="index-label">宜钓指数</text>
      <view class="index-meta">
        <mxy-icon name="wb_sunny" :size="22" color="#F5A623" />
        <text class="index-meta-text">{{ fishingIndex.weather }} {{ fishingIndex.temp }}°</text>
      </view>
    </view>

    <!-- 右下角浮动按钮组 -->
    <view class="float-actions">
      <view class="float-btn float-btn--white" @click="onLocate">
        <mxy-icon name="my_location" :size="40" color="#1A2B33" />
      </view>
      <view class="float-btn float-btn--primary" @click="onReportSpot">
        <mxy-icon name="add_location_alt" :size="40" color="#fff" />
      </view>
    </view>

    <!-- 附近钓友入口 -->
    <view class="angler-entry" @click="onNearbyAnglers">
      <view class="angler-entry-icon">
        <mxy-icon name="groups" :size="30" color="#2D8F87" />
      </view>
      <view class="angler-entry-text">
        <text class="angler-entry-title">找钓友</text>
        <text class="angler-entry-sub">{{ nearbyAnglersOnline }}人在线</text>
      </view>
    </view>

    <!-- 城市切换抽屉 -->
    <view v-if="showCitySheet" class="city-switch-layer">
      <view class="layer-mask" @click="closeCitySheet" />
      <view class="city-sheet">
        <view class="sheet-handle" />
        <view class="city-sheet-head">
          <text class="city-sheet-title">切换城市</text>
          <mxy-icon name="close" :size="36" color="#6B7B85" @click="closeCitySheet" />
        </view>
        <view class="city-search">
          <mxy-icon name="search" :size="32" color="#6B7B85" />
          <text class="city-search-text">搜索城市 / 区县</text>
        </view>
        <view class="current-city-card">
          <mxy-icon name="my_location" :size="40" color="#2D8F87" />
          <view class="current-city-main">
            <text class="current-city-title">当前定位：{{ city }}</text>
            <text class="current-city-sub">江宁区 · 已为你筛选附近钓点</text>
          </view>
          <text class="relocate-text" @click="onLocate">重定位</text>
        </view>
        <text class="city-block-title">热门城市</text>
        <view class="city-pill-row">
          <view
            v-for="item in hotCities"
            :key="item.name"
            class="city-option-pill"
            :class="{ active: item.name === city }"
            @click="selectCity(item)"
          >
            <text>{{ item.name }}</text>
          </view>
        </view>
        <text class="city-block-title">最近访问</text>
        <view class="recent-city-list">
          <view
            v-for="item in recentCities"
            :key="item.name"
            class="recent-city-row"
            :class="{ active: item.name === city }"
            @click="selectCity(item)"
          >
            <view>
              <text class="recent-city-name">{{ item.name }}</text>
              <text class="recent-city-meta">{{ item.spots }} 个钓点 · {{ item.anglers }} 位钓友在线</text>
            </view>
            <mxy-icon v-if="item.name === city" name="check_circle" :size="32" color="#2D8F87" />
          </view>
        </view>
      </view>
    </view>

    <!-- 首页消息预览 -->
    <view v-if="showNotifyPopover" class="notify-layer" @click="closeNotifyPopover">
      <view class="notify-popover" @click.stop>
        <view class="notify-head">
          <text class="notify-title">消息通知</text>
          <text class="notify-read" @click="markAllRead">全部已读</text>
        </view>
        <view class="notify-summary">
          <text class="notify-summary-main">{{ unreadCount }} 条未读</text>
          <text class="notify-summary-sub">与你的钓点、鱼获、组队有关</text>
        </view>
        <view class="notify-list">
          <view
            v-for="item in notificationPreview"
            :key="item.id"
            class="notify-row"
            @click="onNotificationTap(item)"
          >
            <view class="notify-icon">
              <mxy-icon :name="item.icon" :size="30" color="#2D8F87" />
            </view>
            <view class="notify-content">
              <text class="notify-row-title">{{ item.title }}</text>
              <text class="notify-row-meta">{{ item.meta }}</text>
            </view>
            <view v-if="item.unread" class="notify-unread-dot" />
          </view>
        </view>
        <view class="notify-more" @click="onViewAllNotifications">
          <text>查看全部消息</text>
        </view>
      </view>
    </view>

    <!-- 底部抽屉: 附近钓点 -->
    <view class="spot-sheet">
      <view class="sheet-handle" />
      <view class="sheet-header">
        <mxy-section-title title="附近钓点" :subtitle="`共 ${spots.length} 个`" action-text="查看全部" @action="onViewAllSpots" />
      </view>

      <scroll-view class="sheet-list" scroll-x show-scrollbar="false" :scroll-into-view="scrollIntoView" scroll-with-animation>
        <view class="spot-card-row">
          <view
            v-for="spot in filteredSpots"
            :key="spot.id"
            :id="`card-${spot.id}`"
            class="spot-card"
            :class="{ active: spot.id === activeSpotId }"
            @click="onSpotTap(spot)"
          >
            <image class="spot-cover" :src="spot.cover" mode="aspectFill" />
            <view class="spot-info">
              <view class="spot-title-row">
                <text class="spot-name">{{ spot.name }}</text>
                <mxy-tag tone="orange" size="sm">{{ spot.tag }}</mxy-tag>
              </view>
              <view class="spot-meta">
                <mxy-icon name="location_on" :size="22" color="#6B7B85" />
                <text class="spot-distance">{{ spot.distance }}</text>
                <text class="spot-sep">·</text>
                <text class="spot-score">宜钓 {{ spot.score }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <CustomTabBar current="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import CustomTabBar from '@/components/CustomTabBar.vue';
import {
  nearbySpots,
  formatDistance,
  SPOT_TYPE_LABEL,
  type SpotListItem,
  type SpotType,
  type WaterType,
} from '@/api/spots';
import { fetchFishingIndex } from '@/api/weather';

interface FilterChip { key: ChipKey; label: string }
interface SpotItem {
  id: string;
  markerId: number;
  name: string;
  type: SpotType;
  waterType: WaterType | null;
  cover: string;
  tag: string;
  distance: string;
  score: number;
  latitude: number;
  longitude: number;
}
interface CityOption {
  readonly name: string;
  readonly spots: number;
  readonly anglers: number;
}
interface NotificationItem {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly meta: string;
  readonly unread: boolean;
  readonly target: string;
}

const TYPE_EMOJI: Record<SpotType, string> = {
  wild: '🌊',
  black: '🎣',
  sea: '⚓',
  paid: '💰',
};

/** chip → (item) => boolean。多维度过滤（type + waterType）。 */
const CHIP_PREDICATE = {
  all:   () => true,
  wild:  (s) => s.type === 'wild',
  pond:  (s) => s.type === 'black',
  reser: (s) => s.waterType === 'reservoir',
  river: (s) => s.waterType === 'river',
  sea:   (s) => s.type === 'sea' || s.waterType === 'sea',
  rent:  (s) => s.type === 'paid',
} satisfies Record<string, (s: SpotItem) => boolean>;

type ChipKey = keyof typeof CHIP_PREDICATE;

const CHIP_QUERY: Record<ChipKey, { type?: SpotType; waterType?: WaterType }> = {
  all: {},
  wild: { type: 'wild' },
  pond: { type: 'black' },
  reser: { waterType: 'reservoir' },
  river: { waterType: 'river' },
  sea: { type: 'sea' },
  rent: { type: 'paid' },
};

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const NEARBY_RADIUS_M = 10000;
const NEARBY_LIMIT = 30;
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1727524315467-264c0bd47a13?w=600';

/** 后端 photos[0] 可能是 OSS key（如 spots/seed/xx.webp），还没接上传 host 时回退到占位图。 */
function pickCover(photos: string[]): string {
  const first = photos[0];
  if (first && /^https?:\/\//.test(first)) return first;
  return FALLBACK_COVER;
}

/** 后端 avgRating 是 0-5 分，前端「宜钓 N」展示需要 0-100 整数；评分为 0 时回退一个中性值。 */
function ratingToScore(avgRating: number, ratingCount: number): number {
  if (!ratingCount || avgRating <= 0) return 70;
  return Math.round(avgRating * 20);
}

/** 把后端 SpotListItem 适配成首页卡片 + map marker 用的本地 shape。 */
function adaptSpot(item: SpotListItem): SpotItem {
  return {
    id: item.id,
    markerId: Number(item.id) || 0,
    name: item.name,
    type: item.type,
    waterType: item.waterType,
    cover: pickCover(item.photos),
    tag: SPOT_TYPE_LABEL[item.type] ?? '钓点',
    distance: formatDistance(item.distance),
    score: ratingToScore(item.avgRating, item.ratingCount),
    latitude: item.lat,
    longitude: item.lng,
  };
}

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();

/**
 * 仅微信小程序需要给顶部右侧预留胶囊空间;H5/App 不需要 padding。
 */
const topRowStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {};
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

const city = ref('南京');
const hasUnread = ref(true);
const activeChip = ref<ChipKey>('all');
const showCitySheet = ref(false);
const showNotifyPopover = ref(false);
const nearbyAnglersOnline = ref(12);
const activeSpotId = ref<string>('');
const scrollIntoView = ref<string>('');

const filterChips = ref<FilterChip[]>([
  { key: 'all',     label: '全部' },
  { key: 'wild',    label: '野钓' },
  { key: 'pond',    label: '黑坑' },
  { key: 'reser',   label: '水库' },
  { key: 'river',   label: '江河' },
  { key: 'sea',     label: '海钓' },
  { key: 'rent',    label: '收费塘' },
]);

const fishingIndex = ref({
  score: 70,
  weather: '加载中',
  temp: 0,
});

const hotCities = ref<CityOption[]>([
  { name: '南京', spots: 23, anglers: 12 },
  { name: '杭州', spots: 18, anglers: 9 },
  { name: '苏州', spots: 16, anglers: 7 },
  { name: '上海', spots: 21, anglers: 11 },
]);

const recentCities = ref<CityOption[]>([
  { name: '南京', spots: 23, anglers: 12 },
  { name: '扬州', spots: 8, anglers: 3 },
]);

const notificationPreview = ref<NotificationItem[]>([
  {
    id: 'n1',
    icon: 'chat_bubble',
    title: '老周评论了你的鱼获',
    meta: '“这位置明早还能去吗？” · 5分钟前',
    unread: true,
    target: '/pages/message/index',
  },
  {
    id: 'n2',
    icon: 'favorite',
    title: '老王收藏了你的钓点',
    meta: '燕子矶江边 · 12分钟前',
    unread: true,
    target: '/pages/message/index',
  },
  {
    id: 'n3',
    icon: 'groups',
    title: '组队约钓有新报名',
    meta: '江心洲夜钓队 · 1小时前',
    unread: true,
    target: '/pages/message/index',
  },
]);

const center = ref({ ...DEFAULT_CENTER });
const spots = ref<SpotItem[]>([]);
const loadingSpots = ref(false);
let spotRequestSeq = 0;

const filteredSpots = computed(() => spots.value);

const markers = computed(() =>
  filteredSpots.value.map((s) => ({
    id: s.markerId,
    latitude: s.latitude,
    longitude: s.longitude,
    width: 32,
    height: 40,
    callout: {
      content: `${TYPE_EMOJI[s.type]} ${s.name}`,
      color: '#1A2B33',
      fontSize: 12,
      borderRadius: 14,
      bgColor: '#FFFFFF',
      padding: 8,
      textAlign: 'center',
      display: s.id === activeSpotId.value ? 'ALWAYS' : 'BYCLICK',
    },
  })),
);

const unreadCount = computed(() => notificationPreview.value.filter((item) => item.unread).length);

async function locateUser(silent = false) {
  try {
    const setting: any = await new Promise((resolve, reject) =>
      uni.getSetting({ success: resolve, fail: reject }),
    );
    if (setting?.authSetting?.['scope.userLocation'] === false) {
      uni.showModal({
        title: '需要定位权限',
        content: '获取你的位置以查找附近钓点',
        confirmText: '去设置',
        success: (res) => { if (res.confirm) uni.openSetting(); },
      });
      return;
    }
    const loc: any = await new Promise((resolve, reject) =>
      uni.getLocation({ type: 'gcj02', isHighAccuracy: true, success: resolve, fail: reject }),
    );
    center.value = { latitude: loc.latitude, longitude: loc.longitude };
    if (!silent) uni.showToast({ title: '已重新定位', icon: 'success' });
  } catch (_) {
    if (!silent) uni.showToast({ title: '定位失败，已使用默认位置', icon: 'none' });
  }
}

/**
 * 拉附近钓点。
 * - 默认半径 NEARBY_RADIUS_M（10km），后端按距离升序返回。
 * - 失败 toast 一下但不抛，避免首页空白；spots 保持上一次的值。
 */
async function loadSpots(silent = false) {
  const seq = ++spotRequestSeq;
  loadingSpots.value = true;
  try {
    const { list } = await nearbySpots({
      lat: center.value.latitude,
      lng: center.value.longitude,
      radius: NEARBY_RADIUS_M,
      limit: NEARBY_LIMIT,
      ...(CHIP_QUERY[activeChip.value] ?? {}),
    });
    if (seq !== spotRequestSeq) return;
    spots.value = list.map(adaptSpot);
    activeSpotId.value = '';
  } catch (e: any) {
    if (seq === spotRequestSeq && !silent) uni.showToast({ title: e?.msg || '附近钓点拉取失败', icon: 'none' });
  } finally {
    if (seq === spotRequestSeq) loadingSpots.value = false;
  }
}

async function loadFishingIndex() {
  try {
    const data = await fetchFishingIndex({
      lat: center.value.latitude,
      lng: center.value.longitude,
    });
    fishingIndex.value = {
      score: data.score,
      weather: data.current.weather,
      temp: data.current.temperature,
    };
  } catch (_) {
    fishingIndex.value = {
      score: 70,
      weather: '暂无',
      temp: 0,
    };
  }
}

onMounted(async () => {
  await locateUser(true);
  await Promise.all([loadSpots(true), loadFishingIndex()]);
});

const onCityTap = () => {
  showCitySheet.value = true;
  showNotifyPopover.value = false;
};
const closeCitySheet = () => {
  showCitySheet.value = false;
};
const selectCity = (item: CityOption) => {
  city.value = item.name;
  nearbyAnglersOnline.value = item.anglers;
  closeCitySheet();
};
const onSearchTap = () => {
  uni.navigateTo({ url: '/subpackages/spot/list/index' });
};
const onNotifyTap = () => {
  showNotifyPopover.value = !showNotifyPopover.value;
  showCitySheet.value = false;
};
const onChipTap = (key: ChipKey) => {
  if (activeChip.value === key) return;
  activeChip.value = key;
  void loadSpots(false);
};
const closeNotifyPopover = () => {
  showNotifyPopover.value = false;
};
const markAllRead = () => {
  notificationPreview.value = notificationPreview.value.map((item) => ({ ...item, unread: false }));
  hasUnread.value = false;
};
const onNotificationTap = (item: NotificationItem) => {
  uni.navigateTo({ url: item.target });
};
const onLocate = async () => {
  await locateUser(false);
  await Promise.all([loadSpots(true), loadFishingIndex()]);
};
const onReportSpot = () => uni.navigateTo({ url: '/subpackages/spot/create/index' });
const onViewAllSpots = () => uni.navigateTo({ url: '/subpackages/spot/list/index' });
const onNearbyAnglers = () => uni.navigateTo({ url: '/subpackages/social/nearby-users/index' });
const onViewAllNotifications = () => {
  uni.navigateTo({ url: '/pages/message/index' });
};

const focusSpot = (spot: SpotItem) => {
  activeSpotId.value = spot.id;
  scrollIntoView.value = `card-${spot.id}`;
  center.value = { latitude: spot.latitude, longitude: spot.longitude };
};

const onSpotTap = (spot: SpotItem) => {
  if (activeSpotId.value === spot.id) {
    uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${spot.id}` });
  } else {
    focusSpot(spot);
  }
};

const onMarkerTap = (e: any) => {
  const id = e.detail?.markerId;
  const spot = spots.value.find((s) => s.markerId === id);
  if (spot) focusSpot(spot);
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
