<template>
  <view class="my-catches">
    <mxy-form-nav title="我的鱼获" action-text="筛选" @action="onFilter" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 鱼获档案 -->
        <view class="stats-card">
          <view class="stats-head">
            <text class="stats-title">鱼获档案</text>
            <view class="delta-badge">
              <text class="delta-text">本月 {{ stats.monthAdd >= 0 ? '+' : '' }}{{ stats.monthAdd }}</text>
            </view>
          </view>
          <view class="stats-row">
            <view class="stats-cell">
              <text class="stats-num primary">{{ stats.total }}</text>
              <text class="stats-label">总数量</text>
            </view>
            <view class="stats-div" />
            <view class="stats-cell">
              <text class="stats-num secondary">{{ stats.month }}</text>
              <text class="stats-label">本月</text>
            </view>
            <view class="stats-div" />
            <view class="stats-cell">
              <text class="stats-num accent">{{ stats.heaviest }}</text>
              <text class="stats-label">最重</text>
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
            placeholder="搜索鱼种 / 钓点 / 饵料"
            placeholder-class="search-ph"
            confirm-type="search"
          />
        </view>

        <!-- 标题行 -->
        <view class="section-head">
          <text class="section-title">最近鱼获</text>
          <view class="sort" @click="onSort">
            <text class="sort-text">{{ sortLabel }}</text>
            <mxy-icon name="arrow_drop_down" :size="28" color="#2D8F87" />
          </view>
        </view>

        <!-- 鱼获列表 -->
        <view class="catch-list">
          <view
            v-for="(c, idx) in filtered"
            :key="c.id"
            class="catch-row"
            @click="onOpen(c)"
          >
            <view class="catch-thumb" :class="`tone-${toneFor(idx)}`">
              <image
                v-if="c.cover"
                class="catch-thumb-img"
                :src="c.cover"
                mode="aspectFill"
              />
              <text v-else class="catch-thumb-text">鱼</text>
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ c.fishSpecies.join(' · ') || '未知鱼种' }}</text>
                <view class="weight-badge" :class="`badge--${toneFor(idx)}`">
                  <text class="weight-badge-text">{{ formatWeight(c.weight) }}</text>
                </view>
              </view>
              <text class="row-meta">{{ c.spotName || c.city || '未关联钓点' }} · {{ formatTime(c.createdAt) }}</text>
              <view class="row-foot">
                <view class="foot-tag">
                  <mxy-icon name="straighten" :size="22" color="#6B7B85" />
                  <text class="foot-tag-text">{{ formatLength(c.length) }}</text>
                </view>
                <view class="foot-tag">
                  <mxy-icon name="favorite_border" :size="22" color="#6B7B85" />
                  <text class="foot-tag-text">{{ c.likeCount }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="!loading && filtered.length === 0" class="empty">
            <text class="empty-text">{{ keyword ? '没有匹配的鱼获' : '还没有鱼获，去发布一条吧' }}</text>
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
      <view class="cta-btn" @click="onPublish">
        <mxy-icon name="add" :size="36" color="#fff" />
        <text class="cta-btn-text">发布鱼获</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import {
  userCatches,
  userCatchesStats,
  formatWeight,
  formatLength,
  formatTime,
  type CatchFeedItem,
  type Visibility,
} from '@/api/catches';

const { safeBottom } = useSystemInfo();

type TabKey = 'all' | 'week' | 'public' | 'private';
type Tone = 'primary' | 'blue' | 'orange';

interface Tab {
  key: TabKey;
  label: string;
  /** 映射到后端 visibility 入参 */
  visibility: Visibility;
  /** 客户端二次过滤：是否只看本周 */
  weekOnly?: boolean;
}

const stats = ref({
  total: 0,
  month: 0,
  heaviest: '—',
  monthAdd: 0,
});

const activeTab = ref<TabKey>('all');
const keyword = ref('');
const sortLabel = ref('时间');
const loading = ref(false);
const hasMore = ref(false);
const cursor = ref<string | null>(null);

const tabs: Tab[] = [
  { key: 'all',     label: '全部', visibility: 'all' },
  { key: 'week',    label: '本周', visibility: 'all', weekOnly: true },
  { key: 'public',  label: '公开', visibility: 'public' },
  { key: 'private', label: '私密', visibility: 'private' },
];

const catches = ref<CatchFeedItem[]>([]);

function toneFor(idx: number): Tone {
  return (['primary', 'blue', 'orange'] as const)[idx % 3];
}

// 本周筛选：以 7 天为窗口（含今天）
function withinWeek(iso: string): boolean {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= 7 * 24 * 60 * 60 * 1000;
}

const filtered = computed<CatchFeedItem[]>(() => {
  let pool = catches.value;
  const tab = tabs.find((x) => x.key === activeTab.value);
  if (tab?.weekOnly) pool = pool.filter((c) => withinWeek(c.createdAt));
  const kw = keyword.value.trim();
  if (kw) {
    pool = pool.filter(
      (c) =>
        c.fishSpecies.some((f) => f.includes(kw)) ||
        (c.spotName && c.spotName.includes(kw)) ||
        (c.city && c.city.includes(kw)) ||
        (c.content && c.content.includes(kw)),
    );
  }
  return pool;
});

async function loadStats() {
  try {
    const s = await userCatchesStats();
    stats.value.total = s.total;
    stats.value.month = s.monthCount;
    stats.value.monthAdd = s.monthAdd;
    stats.value.heaviest = s.heaviest ? formatWeight(s.heaviest.weightG) : '—';
  } catch (e) {
    console.warn('[my-catches] loadStats failed', e);
  }
}

async function loadList(reset = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      catches.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
    const tab = tabs.find((x) => x.key === activeTab.value) ?? tabs[0];
    const resp = await userCatches({
      visibility: tab.visibility,
      limit: 20,
      cursor: cursor.value,
    });
    catches.value = catches.value.concat(resp.list);
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e) {
    console.warn('[my-catches] loadList failed', e);
  } finally {
    loading.value = false;
  }
}

function onTabChange(key: TabKey) {
  if (activeTab.value === key) return;
  activeTab.value = key;
  void loadList(true);
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  void loadList(false);
}

onMounted(() => {
  void loadStats();
  void loadList(true);
});

const onFilter = () => uni.showActionSheet({
  itemList: ['按时间', '按重量', '按点赞'],
  success: (r) => {
    sortLabel.value = ['时间', '重量', '点赞'][r.tapIndex];
    // TODO(sort): 后端目前只按 createdAt DESC，按重量/点赞需要后端追加排序参数
  },
  fail: () => {},
});

const onSort = () => onFilter();

const onOpen = (c: CatchFeedItem) =>
  uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${c.id}` });
const onPublish = () => uni.navigateTo({ url: '/subpackages/catch/create/index' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
