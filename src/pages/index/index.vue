<template>
  <view class="home-page">
    <!-- 地图主体 (uniapp 跨端: 小程序用原生 map 组件, H5 可后期接入腾讯地图 JS SDK) -->
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
      <view class="top-row">
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
            @click="activeChip = chip.key"
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

    <!-- 底部抽屉: 附近钓点 -->
    <view class="spot-sheet">
      <view class="sheet-handle" />
      <view class="sheet-header">
        <mxy-section-title title="附近钓点" :subtitle="`共 ${spots.length} 个`" action-text="查看全部" @action="onViewAllSpots" />
      </view>

      <scroll-view class="sheet-list" scroll-x show-scrollbar="false">
        <view class="spot-card-row">
          <view
            v-for="spot in spots"
            :key="spot.id"
            class="spot-card"
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
import { ref } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface FilterChip { key: string; label: string }
interface SpotItem {
  id: string;
  name: string;
  cover: string;
  tag: string;
  distance: string;
  score: number;
  latitude: number;
  longitude: number;
}

const statusBarHeight = ref(0);
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
} catch (_e) {
  statusBarHeight.value = 20;
}

const city = ref('南京');
const hasUnread = ref(true);
const activeChip = ref('all');

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
  score: 86,
  weather: '多云',
  temp: 22,
});

const center = ref({ latitude: 32.0603, longitude: 118.7969 });

const spots = ref<SpotItem[]>([
  {
    id: 's1',
    name: '玄武湖东岸',
    cover: 'https://images.unsplash.com/photo-1727524315467-264c0bd47a13?w=600',
    tag: '热门',
    distance: '1.2km',
    score: 88,
    latitude: 32.072,
    longitude: 118.805,
  },
  {
    id: 's2',
    name: '紫金山水库',
    cover: 'https://images.unsplash.com/photo-1635712291708-7afe9e037503?w=600',
    tag: '清静',
    distance: '4.5km',
    score: 92,
    latitude: 32.082,
    longitude: 118.844,
  },
  {
    id: 's3',
    name: '秦淮河老门东',
    cover: 'https://images.unsplash.com/photo-1564875009929-58c9517cd6fd?w=600',
    tag: '城市',
    distance: '2.8km',
    score: 75,
    latitude: 32.022,
    longitude: 118.785,
  },
  {
    id: 's4',
    name: '将军山黑坑',
    cover: 'https://images.unsplash.com/photo-1741134913547-46bbab5a1f60?w=600',
    tag: '收费',
    distance: '8.6km',
    score: 80,
    latitude: 31.952,
    longitude: 118.730,
  },
]);

// 把钓点转成 map 组件的 markers
const markers = spots.value.map((s, idx) => ({
  id: idx + 1,
  latitude: s.latitude,
  longitude: s.longitude,
  title: s.name,
  width: 36,
  height: 44,
}));

const onCityTap = () => uni.showToast({ title: '城市选择(待开发)', icon: 'none' });
const onSearchTap = () => uni.showToast({ title: '搜索(待开发)', icon: 'none' });
const onNotifyTap = () => {
  uni.switchTab({ url: '/pages/message/index' });
};
const onLocate = () => uni.showToast({ title: '已重新定位', icon: 'success' });
const onReportSpot = () => uni.navigateTo({ url: '/pages/spot/create' });
const onViewAllSpots = () => uni.showToast({ title: '钓点列表(待开发)', icon: 'none' });

const onSpotTap = (spot: SpotItem) => {
  uni.navigateTo({ url: `/pages/spot/detail?id=${spot.id}` });
};

const onMarkerTap = (e: any) => {
  const id = e.detail?.markerId;
  const spot = spots.value[id - 1];
  if (spot) onSpotTap(spot);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.home-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: $bg-page;
}

/* ---------- 地图 ---------- */
.map-view {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.map-mock {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: $map-land;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  .map-mock-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(45,143,135,.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45,143,135,.08) 1px, transparent 1px);
    background-size: 40rpx 40rpx;
  }
  .map-mock-tip {
    font-size: $font-sm;
    color: $text-secondary;
    z-index: 2;
  }
}

/* ---------- 顶部胶囊 ---------- */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx 0;
}

.city-pill {
  display: flex;
  align-items: center;
  gap: 4rpx;
  height: 72rpx;
  padding: 0 20rpx;
  background: $bg-card;
  border-radius: 36rpx;
  box-shadow: 0 4rpx 14rpx rgba(0,0,0,.08);

  .city-name {
    font-size: $font-base;
    font-weight: 700;
    color: $text-primary;
  }
}

.search-pill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 72rpx;
  padding: 0 24rpx;
  background: $bg-card;
  border-radius: 36rpx;
  box-shadow: 0 4rpx 14rpx rgba(0,0,0,.08);

  .search-placeholder {
    font-size: $font-sm;
    color: $text-placeholder;
  }
}

.notify-pill {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $bg-card;
  box-shadow: 0 4rpx 14rpx rgba(0,0,0,.08);
  display: flex;
  align-items: center;
  justify-content: center;

  .notify-dot {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: $warning-strong;
    border: 2rpx solid #fff;
  }
}

/* ---------- 筛选 chips ---------- */
.chip-scroll {
  width: 100%;
  padding: 24rpx 0 0;
  white-space: nowrap;
}
.chip-row {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
  gap: 14rpx;
  padding: 0 32rpx;
}

/* ---------- 宜钓指数 ---------- */
.fishing-index {
  position: absolute;
  right: 32rpx;
  top: calc(280rpx + env(safe-area-inset-top));
  width: 200rpx;
  padding: 18rpx 12rpx;
  background: $bg-card;
  border-radius: 28rpx;
  box-shadow: 0 10rpx 30rpx rgba(26,43,51,.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  z-index: 5;

  .index-score {
    font-size: 56rpx;
    font-weight: 900;
    color: $primary;
    line-height: 1;
  }
  .index-label {
    font-size: $font-xs;
    color: $text-secondary;
    font-weight: 600;
  }
  .index-meta {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;

    .index-meta-text {
      font-size: $font-xs;
      color: $text-regular;
    }
  }
}

/* ---------- 浮动按钮 ---------- */
.float-actions {
  position: absolute;
  right: 32rpx;
  bottom: calc(#{$tabbar-height} + 460rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  z-index: 5;
}
.float-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(26,43,51,.18);

  &--white   { background: $bg-card; }
  &--primary { background: $primary; box-shadow: 0 8rpx 24rpx rgba(45,143,135,.42); }

  &:active { transform: scale(.95); }
}

/* ---------- 底部钓点抽屉 ---------- */
.spot-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(#{$tabbar-height} + env(safe-area-inset-bottom));
  background: $bg-card;
  border-radius: 32rpx 32rpx 0 0;
  box-shadow: 0 -12rpx 36rpx rgba(26,43,51,.12);
  padding: 12rpx 0 16rpx;
  z-index: 8;
}
.sheet-handle {
  width: 64rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: $border-base;
  margin: 0 auto 12rpx;
}
.sheet-header {
  padding: 0 32rpx 16rpx;
}
.sheet-list {
  width: 100%;
  white-space: nowrap;
}
.spot-card-row {
  display: inline-flex;
  gap: 20rpx;
  padding: 0 32rpx;
}

.spot-card {
  display: flex;
  flex-direction: column;
  width: 260rpx;
  background: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;
  border: 1rpx solid $border-light;

  &:active { transform: scale(.98); }

  .spot-cover {
    width: 100%;
    height: 140rpx;
    background: $bg-hover;
  }

  .spot-info {
    padding: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .spot-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8rpx;

    .spot-name {
      font-size: $font-base;
      font-weight: 800;
      color: $text-primary;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 140rpx;
    }
  }

  .spot-meta {
    display: flex;
    align-items: center;
    gap: 4rpx;

    .spot-distance, .spot-score {
      font-size: $font-xs;
      color: $text-secondary;
    }
    .spot-sep {
      color: $text-secondary;
      margin: 0 2rpx;
    }
    .spot-score { color: $primary; font-weight: 700; }
  }
}
</style>
