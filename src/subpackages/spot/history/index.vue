<template>
  <view class="history-page">
    <!-- 顶部导航 -->
    <view class="hs-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="hs-nav">
        <view class="hs-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="hs-title">历史鱼获</text>
        <text class="hs-filter" @click="openFilter">筛选</text>
      </view>
    </view>

    <scroll-view class="hs-scroll" scroll-y>
      <!-- 钓点摘要 -->
      <view class="hs-spot-card">
        <view class="hs-spot-map">
          <mxy-icon name="waves" :size="56" color="#5BA9C4" />
        </view>
        <view class="hs-spot-info">
          <text class="hs-spot-title">{{ spot.name }}</text>
          <text class="hs-spot-meta">近{{ spot.days }}天 {{ spot.total }} 条鱼获 · 宜钓指数 {{ spot.score }}</text>
          <view class="hs-spot-tags">
            <view class="hs-tag hs-tag--primary"><text>鲫鱼最多</text></view>
            <view class="hs-tag hs-tag--accent"><text>早口好</text></view>
          </view>
        </view>
      </view>

      <!-- 趋势 -->
      <view class="hs-trend">
        <view class="hs-trend-head">
          <text class="hs-trend-title">本周鱼获趋势</text>
          <text class="hs-trend-meta">共 {{ weekTotal }} 条</text>
        </view>
        <view class="hs-bars">
          <view
            v-for="(b, i) in bars"
            :key="i"
            class="hs-bar"
            :class="b.tone"
            :style="{ height: b.h + 'rpx' }"
          />
        </view>
      </view>

      <!-- 过滤 chips -->
      <view class="hs-chips">
        <view
          v-for="c in chips"
          :key="c"
          class="hs-chip"
          :class="{ active: activeChip === c }"
          @click="activeChip = c"
        >
          <text>{{ c }}</text>
        </view>
      </view>

      <!-- 鱼获列表 -->
      <view class="hs-list">
        <view v-for="(c, i) in catches" :key="i" class="hs-row" @click="onRow(c)">
          <view class="hs-row-icon" :class="c.tone">
            <text>{{ c.glyph }}</text>
          </view>
          <view class="hs-row-info">
            <text class="hs-row-title">{{ c.title }}</text>
            <text class="hs-row-meta">{{ c.meta }}</text>
            <text class="hs-row-foot">{{ c.foot }}</text>
          </view>
        </view>
      </view>

    </scroll-view>

    <!-- 底部 -->
    <view class="hs-bottom" :style="{ paddingBottom: (safeBottom + 22) + 'px' }">
      <view class="hs-btn-ghost" @click="onMap"><text>看地图</text></view>
      <view class="hs-btn-primary" @click="onPublish"><text>发布此钓点鱼获</text></view>
    </view>

    <!-- 筛选浮层 (Design 34) -->
    <view v-if="filterOpen" class="hs-filter-layer">
      <view class="hs-filter-scrim" @click="closeFilter" />
      <view class="hs-filter-sheet" :style="{ paddingBottom: (safeBottom + 24) + 'px' }">
        <view class="hs-fh-handle" />
        <view class="hs-fh-head">
          <text class="hs-fh-reset" @click="onReset">重置</text>
          <text class="hs-fh-title">筛选历史鱼获</text>
          <text class="hs-fh-done" @click="closeFilter">完成</text>
        </view>

        <!-- 鱼种 -->
        <view class="hs-fh-section">
          <text class="hs-fh-section-title">鱼种</text>
          <view class="hs-fh-chips">
            <view
              v-for="f in fishOptions"
              :key="f"
              class="hs-fh-chip"
              :class="{ active: filter.fish === f }"
              @click="filter.fish = f"
            >
              <text>{{ f }}</text>
            </view>
          </view>
        </view>

        <!-- 时间范围 -->
        <view class="hs-fh-section">
          <text class="hs-fh-section-title">时间范围</text>
          <view class="hs-fh-chips">
            <view
              v-for="t in timeOptions"
              :key="t"
              class="hs-fh-chip"
              :class="{ soft: filter.time === t }"
              @click="filter.time = t"
            >
              <text>{{ t }}</text>
            </view>
          </view>
        </view>

        <!-- 排序 -->
        <view class="hs-fh-section">
          <text class="hs-fh-section-title">排序</text>
          <view class="hs-fh-sort">
            <view
              v-for="s in sortOptions"
              :key="s"
              class="hs-fh-sort-row"
              :class="{ active: filter.sort === s }"
              @click="filter.sort = s"
            >
              <text class="hs-fh-sort-text">{{ s }}</text>
              <mxy-icon
                v-if="filter.sort === s"
                name="check"
                :size="36"
                color="#2D8F87"
              />
            </view>
          </view>
        </view>

        <!-- 开关 -->
        <view class="hs-fh-switches">
          <view class="hs-fh-switch-row">
            <text class="hs-fh-switch-label">只看有图片</text>
            <view
              class="hs-fh-switch"
              :class="{ on: filter.hasPhoto }"
              @click="filter.hasPhoto = !filter.hasPhoto"
            >
              <view class="hs-fh-switch-dot" />
            </view>
          </view>
          <view class="hs-fh-switch-row">
            <text class="hs-fh-switch-label">隐藏私密记录</text>
            <view
              class="hs-fh-switch"
              :class="{ on: filter.hidePrivate }"
              @click="filter.hidePrivate = !filter.hidePrivate"
            >
              <view class="hs-fh-switch-dot" />
            </view>
          </view>
        </view>

        <view class="hs-fh-apply" @click="onApply">
          <text>查看 {{ spot.total }} 条鱼获</text>
        </view>
        <view class="hs-fh-safe" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  spotDetail,
  spotHistory,
  type CatchHistoryItem,
} from '@/api/spots';

const { statusBarHeight, safeBottom } = useSystemInfo();

const spotId = ref('');
const loading = ref(true);

const spot = ref({
  name: '加载中…',
  days: 30,
  total: 0,
  score: 0,
});

const weekTrend = ref<{ date: string; count: number }[]>([]);
const weekTotal = computed(() => weekTrend.value.reduce((s, b) => s + b.count, 0));

const BAR_MIN_H = 44;
const BAR_MAX_H = 104;

/** weekTrend 桶 → 柱图高度 + tone 三档；空数据兜底成 7 根 min-h 灰柱。 */
const bars = computed(() => {
  if (weekTrend.value.length === 0) {
    return Array.from({ length: 7 }, () => ({ h: BAR_MIN_H, tone: '' }));
  }
  const max = Math.max(...weekTrend.value.map((b) => b.count));
  return weekTrend.value.map((b) => {
    if (max === 0) return { h: BAR_MIN_H, tone: '' };
    const ratio = b.count / max;
    const h = Math.round(BAR_MIN_H + ratio * (BAR_MAX_H - BAR_MIN_H));
    let tone = '';
    if (b.count === max) tone = 'peak';
    else if (ratio >= 0.5) tone = 'tall';
    return { h, tone };
  });
});

const chips = ['全部', '鲫鱼', '本周'];
const activeChip = ref('全部');

interface CatchRow {
  id: string;
  glyph: string;
  tone: 'tone-primary' | 'tone-blue' | 'tone-accent';
  title: string;
  meta: string;
  foot: string;
  fish: string;
  ts: number;
  hasPhoto: boolean;
}
const allCatches = ref<CatchRow[]>([]);

const TONE_ROTATION: CatchRow['tone'][] = ['tone-primary', 'tone-blue', 'tone-accent'];

function formatWeight(weightG: number | null): string {
  if (weightG == null) return '';
  if (weightG >= 1000) return `${(weightG / 1000).toFixed(1)}kg`;
  return `${(weightG / 500).toFixed(1)}斤`;
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const now = new Date();
  const dayMs = 86_400_000;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.floor((startToday - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / dayMs);
  if (diffDays === 0) return `今天 ${hh}:${mm}`;
  if (diffDays === 1) return `昨天 ${hh}:${mm}`;
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${hh}:${mm}`;
}

function adaptCatch(item: CatchHistoryItem, idx: number): CatchRow {
  const fish = item.fishSpecies[0] ?? '';
  const weight = formatWeight(item.weight);
  const userName = item.userName || '钓友';
  const title = fish
    ? (weight ? `${userName} · ${fish} ${weight}` : `${userName} · ${fish}`)
    : userName;
  const meta = formatTs(item.createdAt) + (item.length ? ` · ${item.length}cm` : '');
  const foot = item.content?.trim() || '无描述';
  return {
    id: item.id,
    glyph: fish ? fish.charAt(0) : '鱼',
    tone: TONE_ROTATION[idx % TONE_ROTATION.length],
    title,
    meta,
    foot,
    fish,
    ts: new Date(item.createdAt).getTime(),
    hasPhoto: item.photos.length > 0,
  };
}

const catches = computed(() => {
  let list = allCatches.value;
  switch (activeChip.value) {
    case '鲫鱼':
      list = list.filter((c) => c.fish.includes('鲫'));
      break;
    case '本周': {
      const sevenAgo = Date.now() - 7 * 86_400_000;
      list = list.filter((c) => c.ts >= sevenAgo);
      break;
    }
  }
  return list;
});

async function loadSpotMeta() {
  try {
    const d = await spotDetail(spotId.value);
    spot.value.name = d.name;
    spot.value.total = d.catchCount30Days;
    spot.value.score = d.ratingCount > 0 ? Math.round(d.avgRating * 20) : 70;
  } catch (_) {
    spot.value.name = '钓点';
  }
}

async function loadHistory() {
  try {
    const resp = await spotHistory(spotId.value, { days: 30, limit: 30 });
    weekTrend.value = resp.weekTrend;
    allCatches.value = resp.catches.map(adaptCatch);
    spot.value.total = resp.total || spot.value.total;
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '加载历史鱼获失败', icon: 'none' });
  }
}

onLoad(async (options) => {
  spotId.value = String(options?.id ?? '');
  if (!spotId.value) {
    uni.showToast({ title: '钓点 id 缺失', icon: 'none' });
    return;
  }
  loading.value = true;
  await Promise.all([loadSpotMeta(), loadHistory()]);
  loading.value = false;
});

/* ---------- 筛选浮层 ---------- */
const filterOpen = ref(false);
const fishOptions = ['全部', '鲫鱼', '翘嘴', '鲤鱼', '自定义鱼种'];
const timeOptions = ['近30天', '本周', '自定义'];
const sortOptions = ['时间最新', '重量最大'];

const filter = ref({
  fish: '全部',
  time: '近30天',
  sort: '时间最新',
  hasPhoto: false,
  hidePrivate: false,
});

const openFilter = () => { filterOpen.value = true; };
const closeFilter = () => { filterOpen.value = false; };
const onReset = () => {
  filter.value = {
    fish: '全部',
    time: '近30天',
    sort: '时间最新',
    hasPhoto: false,
    hidePrivate: false,
  };
};
const onApply = () => {
  // 把弹层里的筛选映射到 chip
  if (filter.value.fish !== '全部') activeChip.value = filter.value.fish;
  else if (filter.value.time === '本周') activeChip.value = '本周';
  else activeChip.value = '全部';
  filterOpen.value = false;
  uni.showToast({ title: '已应用筛选', icon: 'success' });
};

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onRow = (c: CatchRow) =>
  uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${c.id}` }).catch(() => {
    uni.showToast({ title: c.title, icon: 'none' });
  });
const onMap = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onPublish = () =>
  uni.navigateTo({ url: `/subpackages/catch/create/index?spotId=${spotId.value}` });
</script>

<style lang="scss" scoped src="./index.scss"></style>
