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

      <view class="hs-end-pad" />
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
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const { statusBarHeight, safeBottom } = useSystemInfo();

const spot = ref({
  name: '燕子矶江边',
  days: 30,
  total: 46,
  score: 86,
});

const weekTotal = 18;
const bars = [
  { h: 44, tone: '' },
  { h: 72, tone: 'tall' },
  { h: 56, tone: '' },
  { h: 92, tone: 'tall' },
  { h: 68, tone: '' },
  { h: 104, tone: 'peak' },
  { h: 60, tone: '' },
];

const chips = ['全部', '鲫鱼', '本周'];
const activeChip = ref('全部');

interface CatchRow {
  glyph: string;
  tone: 'tone-primary' | 'tone-blue' | 'tone-accent';
  title: string;
  meta: string;
  foot: string;
}
const catches: CatchRow[] = [
  {
    glyph: '鲫',
    tone: 'tone-primary',
    title: '阿楠 · 鲫鱼 1.2斤',
    meta: '今天 07:20 · 蚯蚓 · 近岸草边',
    foot: '气压回升后开口，连中三尾',
  },
  {
    glyph: '翘',
    tone: 'tone-blue',
    title: '阿峰路亚 · 翘嘴 0.9kg',
    meta: '昨天 18:42 · 米诺 · 流水口',
    foot: '傍晚窗口很短，慢收中鱼',
  },
  {
    glyph: '鲤',
    tone: 'tone-accent',
    title: '江边老王 · 鲤鱼 3.8kg',
    meta: '05-17 20:10 · 玉米 · 深水弯',
    foot: '夜钓守到天黑，最后一口很稳',
  },
];

/* ---------- 筛选浮层 ---------- */
const filterOpen = ref(false);
const fishOptions = ['全部', '鲫鱼', '翘嘴', '鲤鱼', '自定义鱼种'];
const timeOptions = ['近30天', '本周', '自定义'];
const sortOptions = ['时间最新', '重量最大'];

const filter = ref({
  fish: '全部',
  time: '近30天',
  sort: '时间最新',
  hasPhoto: true,
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
  filterOpen.value = false;
  uni.showToast({ title: '已应用筛选', icon: 'success' });
};

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onRow = (c: CatchRow) =>
  uni.navigateTo({ url: '/subpackages/catch/detail/index' }).catch(() => {
    uni.showToast({ title: c.title, icon: 'none' });
  });
const onMap = () => uni.showToast({ title: '打开地图', icon: 'none' });
const onPublish = () => uni.navigateTo({ url: '/subpackages/catch/create/index' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
