<template>
  <view class="my-spots">
    <mxy-form-nav title="我的钓点" action-text="管理" @action="onManage" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 统计卡 -->
        <view class="stats-card">
          <view class="stats-head">
            <text class="stats-title">我上报的钓点</text>
            <view v-if="stats.reviewing > 0" class="review-badge">
              <text class="review-badge-text">{{ stats.reviewing }} 个待审</text>
            </view>
          </view>
          <view class="stats-row">
            <view class="stats-cell">
              <text class="stats-num primary">{{ stats.total }}</text>
              <text class="stats-label">钓点</text>
            </view>
            <view class="stats-div" />
            <view class="stats-cell">
              <text class="stats-num secondary">{{ stats.monthAdd >= 0 ? '+' : '' }}{{ stats.monthAdd }}</text>
              <text class="stats-label">本月新增</text>
            </view>
            <view class="stats-div" />
            <view class="stats-cell">
              <text class="stats-num accent">{{ stats.hottest?.wantCount ?? 0 }}</text>
              <text class="stats-label">最热想去</text>
            </view>
          </view>
        </view>

        <!-- Tabs -->
        <view class="tabs">
          <view
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="onTabChange(t.key)"
          >
            <text>{{ t.label }}</text>
          </view>
        </view>

        <!-- Search -->
        <view class="search-bar">
          <mxy-icon name="search" :size="32" color="#6B7B85" />
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜索钓点名称 / 城市"
            placeholder-class="search-ph"
            confirm-type="search"
            @confirm="onSearch"
          />
        </view>

        <!-- 钓点列表 -->
        <view class="spot-list">
          <view
            v-for="(s, idx) in spots"
            :key="s.id"
            class="spot-row"
            @click="onOpen(s)"
          >
            <view class="row-icon" :class="`tone-${toneFor(idx)}`">
              <text class="row-icon-text">钓</text>
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ s.name }}</text>
                <view class="row-tag" :class="`tag--${statusTone(s.status)}`">
                  <text>{{ statusText(s.status) }}</text>
                </view>
              </view>
              <text class="row-meta">{{ formatMeta(s) }}</text>
              <text class="row-foot">{{ formatFoot(s) }}</text>
            </view>
            <text class="row-edit" @click.stop="onEdit(s)">编辑</text>
          </view>

          <view v-if="!loading && spots.length === 0" class="empty">
            <text class="empty-text">{{ keyword ? '没有匹配的钓点' : '还没有上报过钓点,去发一个吧' }}</text>
          </view>
          <view v-if="hasMore && !loading" class="more" @click="loadMore">
            <text class="more-text">加载更多</text>
          </view>
          <view v-if="loading" class="more">
            <text class="more-text">加载中…</text>
          </view>
        </view>

      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="cta-btn" @click="onReport">
        <mxy-icon name="add" :size="36" color="#fff" />
        <text class="cta-btn-text">上报新钓点</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  userSpots,
  userSpotsStats,
  SPOT_TYPE_LABEL,
  WATER_TYPE_LABEL,
  type UserSpotItem,
  type UserSpotsStats,
  type UserSpotTab,
} from '@/api/spots';
import { formatTime } from '@/api/catches';

const { safeBottom } = useSystemInfo();

type Tone = 'primary' | 'blue' | 'orange';
type StatusTone = 'primary' | 'accent' | 'muted';

interface Tab {
  key: UserSpotTab;
  label: string;
}

const tabs: Tab[] = [
  { key: 'all',       label: '全部' },
  { key: 'published', label: '已发布' },
  { key: 'review',    label: '审核中' },
];

const activeTab = ref<UserSpotTab>('all');
const keyword = ref('');
const loading = ref(false);
const hasMore = ref(false);
const cursor = ref<string | null>(null);
const spots = ref<UserSpotItem[]>([]);

const stats = ref<UserSpotsStats>({
  total: 0,
  reviewing: 0,
  monthAdd: 0,
  hottest: null,
});

function toneFor(idx: number): Tone {
  return (['primary', 'blue', 'orange'] as const)[idx % 3];
}

function statusText(status: string): string {
  if (status === 'approved') return '已发布';
  if (status === 'pending') return '待审';
  if (status === 'rejected') return '未通过';
  return status;
}
function statusTone(status: string): StatusTone {
  if (status === 'approved') return 'primary';
  if (status === 'pending') return 'accent';
  return 'muted';
}

/** type + waterType + city/address 拼一行 meta */
function formatMeta(s: UserSpotItem): string {
  const parts: string[] = [];
  parts.push(SPOT_TYPE_LABEL[s.type] ?? s.type);
  if (s.waterType) parts.push(WATER_TYPE_LABEL[s.waterType] ?? s.waterType);
  if (s.city) parts.push(s.city);
  else if (s.address) parts.push(s.address);
  return parts.join(' · ');
}

/** 想去数 + 评分 + 创建时间 拼一行 foot */
function formatFoot(s: UserSpotItem): string {
  const segs: string[] = [];
  segs.push(`想去 ${s.wantCount}`);
  if (s.ratingCount > 0) segs.push(`评分 ${s.avgRating.toFixed(1)}(${s.ratingCount})`);
  segs.push(formatTime(s.createdAt));
  return segs.join(' · ');
}

async function loadStats() {
  try {
    stats.value = await userSpotsStats();
  } catch (e) {
    console.warn('[my-spots] loadStats failed', e);
  }
}

async function loadList(reset = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      spots.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
    const resp = await userSpots({
      tab: activeTab.value,
      keyword: keyword.value.trim() || undefined,
      limit: 20,
      cursor: cursor.value,
    });
    spots.value = spots.value.concat(resp.list);
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e) {
    console.warn('[my-spots] loadList failed', e);
  } finally {
    loading.value = false;
  }
}

function onTabChange(key: UserSpotTab) {
  if (activeTab.value === key) return;
  activeTab.value = key;
  void loadList(true);
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  void loadList(false);
}

function onSearch() {
  void loadList(true);
}

// keyword 改变(失焦/回车都行)时也触发重拉,debounce 简化为 watch + 300ms
let kwTimer: ReturnType<typeof setTimeout> | null = null;
watch(keyword, () => {
  if (kwTimer) clearTimeout(kwTimer);
  kwTimer = setTimeout(() => {
    void loadList(true);
  }, 300);
});

onMounted(() => {
  void loadStats();
  void loadList(true);
});

const onManage = () => uni.showToast({ title: '批量管理 (待开发)', icon: 'none' });
const onOpen = (s: UserSpotItem) =>
  uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${s.id}` });
const onEdit = (s: UserSpotItem) =>
  uni.navigateTo({ url: `/subpackages/spot/create/index?id=${s.id}` });
const onReport = () => uni.navigateTo({ url: '/subpackages/spot/create/index' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
