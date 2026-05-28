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

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  fetchNearbyUsers,
  formatFishingAge,
  type NearbyUserItem,
} from '@/api/users';
import { formatDistance } from '@/api/spots';

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

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const users = ref<Angler[]>([]);
const center = ref({ ...DEFAULT_CENTER });
const loading = ref(false);

function toneOf(id: string): AvatarTone {
  const tones: AvatarTone[] = ['primary', 'blue', 'orange'];
  return tones[Number(id.slice(-1)) % tones.length] ?? 'primary';
}

function adaptUser(u: NearbyUserItem): Angler {
  const tags = u.playStyles.slice(0, 2).map<AnglerTag>((text, idx) => ({
    text,
    tone: idx === 0 ? 'primary' : 'blue',
  }));
  if (tags.length === 0 && u.city) tags.push({ text: u.city, tone: 'ghost' });
  return {
    id: u.id,
    name: u.nickname || `钓友${u.id.slice(-4)}`,
    tone: toneOf(u.id),
    meta: `${formatDistance(u.distance)} · ${u.city || '附近'} · ${formatFishingAge(u.fishingAgeBand)}`,
    tags,
  };
}

async function locate() {
  try {
    const loc: any = await new Promise((resolve, reject) =>
      uni.getLocation({ type: 'gcj02', success: resolve, fail: reject }),
    );
    center.value = { latitude: loc.latitude, longitude: loc.longitude };
  } catch (_) {
    // 拿不到定位就用 DEFAULT_CENTER
  }
}

async function loadUsers() {
  if (loading.value) return;
  loading.value = true;
  try {
    const playStyle = activeSort.value === 'wild' ? '野钓' : undefined;
    const radius = activeSort.value === 'near' ? 3000 : 50_000;
    const resp = await fetchNearbyUsers({
      lat: center.value.latitude,
      lng: center.value.longitude,
      radius,
      playStyle,
      limit: 30,
    });
    users.value = resp.list.map(adaptUser);
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '附近钓友加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await locate();
  await loadUsers();
});

watch(activeSort, () => {
  void loadUsers();
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onMap = () => uni.showToast({ title: '地图视图 (待开发)', icon: 'none' });
const onOpen = (u: Angler) => uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${u.id}` });
</script>

<style lang="scss" scoped src="./index.scss"></style>
