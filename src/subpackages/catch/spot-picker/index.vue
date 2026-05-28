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
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const { statusBarHeight } = useSystemInfo();

const keyword = ref('');
const filter = ref('附近');
const filters = ['附近', '常去', '已收藏'];
const selected = ref<string>('');

const spots = ref([
  {
    id: 's1',
    name: '燕子矶江边',
    meta: '2.1km · 今日宜钓 86 · 近期鱼获 24',
    thumbBg: '#D7EEF4',
    thumbColor: '#5BA9C4',
    thumbIcon: 'waves',
  },
  {
    id: 's2',
    name: '幕府山下游口',
    meta: '3.4km · 车位少 · 鲫鱼/翘嘴',
    thumbBg: '#EAF5F4',
    thumbColor: '#2D8F87',
    thumbIcon: 'park',
  },
  {
    id: 's3',
    name: '滨江公园外河',
    meta: '4.8km · 夜钓友好 · 水深 1.8m',
    thumbBg: '#FFF4E1',
    thumbColor: '#F5A623',
    thumbIcon: 'phishing',
  },
]);

onLoad(() => {
  const ch = (uni as any).getOpenerEventChannel?.();
  ch?.on?.('initSpot', (data: unknown) => {
    if (data && typeof data === 'object' && 'id' in (data as Record<string, unknown>)) {
      const id = (data as { id?: unknown }).id;
      if (typeof id === 'string') selected.value = id;
    }
  });
});

const onSelect = (id: string) => {
  selected.value = id;
};
const onCancel = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onDone = () => {
  if (!selected.value) {
    uni.showToast({ title: '请先选择钓点', icon: 'none' });
    return;
  }
  const spot = spots.value.find(s => s.id === selected.value);
  if (!spot) {
    uni.showToast({ title: '所选钓点已失效', icon: 'none' });
    return;
  }
  const ch = (uni as any).getOpenerEventChannel?.();
  ch?.emit?.('spotSelected', { id: spot.id, name: spot.name });
  uni.navigateBack({ delta: 1 });
};
const onCreate = () => {
  uni.navigateTo({ url: '/subpackages/spot/create/index' });
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
