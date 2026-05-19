<template>
  <view class="nearby-users">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-left" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">附近钓友</text>
        <view class="map-btn" @click="onMap">
          <mxy-icon name="map" :size="28" color="#2D8F87" />
          <text class="map-btn-text">地图</text>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="form">
        <view class="privacy-card">
          <mxy-icon name="visibility_off" :size="32" color="#2D8F87" />
          <view class="privacy-text">
            <text class="privacy-main">只展示开启附近可见的钓友</text>
            <text class="privacy-sub">不暴露精确位置，仅显示大致距离</text>
          </view>
        </view>

        <view class="search-card">
          <mxy-icon name="search" :size="34" color="#6B7B85" />
          <text class="search-text">搜昵称 / 玩法 / 常去钓点</text>
          <mxy-icon name="tune" :size="34" color="#2D8F87" />
        </view>

        <view class="sort-chips">
          <view
            v-for="s in sortOptions"
            :key="s.key"
            class="chip"
            :class="{ active: activeSort === s.key }"
            @click="activeSort = s.key"
          >
            <text>{{ s.label }}</text>
          </view>
        </view>

        <view class="user-list">
          <view
            v-for="u in users"
            :key="u.id"
            class="user-card"
            @click="onOpen(u)"
          >
            <view class="avatar" :class="`tone-${u.tone}`" />
            <view class="user-info">
              <text class="user-name">{{ u.name }}</text>
              <text class="user-meta">{{ u.meta }}</text>
              <view class="tag-row">
                <view
                  v-for="(t, idx) in u.tags"
                  :key="idx"
                  class="tag"
                  :class="`tag--${t.tone}`"
                >
                  <text>{{ t.text }}</text>
                </view>
              </view>
            </view>
            <view class="view-btn" @click.stop="onOpen(u)">
              <text class="view-btn-text">约钓</text>
            </view>
          </view>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight } = useSystemInfo();

const sortOptions = [
  { key: 'near',   label: '3km内' },
  { key: 'wild',   label: '野钓' },
  { key: 'online', label: '在线' },
  { key: 'senior', label: '5年以上' },
];
const activeSort = ref('near');

type AvatarTone = 'primary' | 'blue' | 'orange';
type TagTone = 'primary' | 'blue' | 'orange' | 'ghost';

interface AnglerTag {
  text: string;
  tone: TagTone;
}

interface Angler {
  id: string;
  name: string;
  meta: string;
  tone: AvatarTone;
  tags: AnglerTag[];
}

const users = ref<Angler[]>([
  {
    id: 'u1',
    name: '老周钓鱼',
    tone: 'primary',
    meta: '1.2km · 常去燕子矶江边 · 5年钓龄',
    tags: [
      { text: '野钓', tone: 'primary' },
      { text: '鲫鱼', tone: 'orange' },
    ],
  },
  {
    id: 'u2',
    name: '路亚小陈',
    tone: 'blue',
    meta: '2.4km · 江心洲北汊 · 晚口活跃',
    tags: [
      { text: '路亚', tone: 'blue' },
      { text: '江河', tone: 'ghost' },
    ],
  },
  {
    id: 'u3',
    name: '阿强守水库',
    tone: 'orange',
    meta: '4.8km · 老山水库 · 10年钓龄',
    tags: [
      { text: '水库', tone: 'blue' },
      { text: '鲤鱼', tone: 'orange' },
    ],
  },
  {
    id: 'u4',
    name: '老王黑坑',
    tone: 'primary',
    meta: '6.3km · 青龙湾黑坑 · 今日放鱼',
    tags: [
      { text: '鲤鱼', tone: 'primary' },
      { text: '早晨', tone: 'ghost' },
    ],
  },
]);

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onMap = () => uni.showToast({ title: '地图视图 (待开发)', icon: 'none' });
const onOpen = (u: Angler) => uni.navigateTo({ url: `/subpackages/social/user-detail?id=${u.id}` });
</script>

<style lang="scss" scoped src="./nearby-users.scss"></style>
