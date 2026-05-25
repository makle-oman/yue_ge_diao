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
              <text class="delta-text">本月 +{{ stats.monthAdd }}</text>
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
            @click="activeTab = t.key"
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
            v-for="c in filtered"
            :key="c.id"
            class="catch-row"
            @click="onOpen(c)"
          >
            <view class="catch-thumb" :class="`tone-${c.tone}`">
              <text class="catch-thumb-text">鱼</text>
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ c.name }}</text>
                <view class="weight-badge" :class="`badge--${c.tone}`">
                  <text class="weight-badge-text">{{ c.weight }}</text>
                </view>
              </view>
              <text class="row-meta">{{ c.spot }} · {{ c.time }}</text>
              <view class="row-foot">
                <view class="foot-tag">
                  <mxy-icon name="device_thermostat" :size="22" color="#6B7B85" />
                  <text class="foot-tag-text">{{ c.weather }}</text>
                </view>
                <view class="foot-tag">
                  <mxy-icon name="favorite_border" :size="22" color="#6B7B85" />
                  <text class="foot-tag-text">{{ c.likes }}</text>
                </view>
              </view>
            </view>
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
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const { safeBottom } = useSystemInfo();

type TabKey = 'all' | 'week' | 'public' | 'private';
type Tone = 'primary' | 'blue' | 'orange';

interface Catch {
  id: string;
  name: string;
  weight: string;
  spot: string;
  time: string;
  weather: string;
  likes: number;
  tone: Tone;
  isPublic: boolean;
  weekly: boolean;
}

const stats = ref({
  total: 156,
  month: 12,
  heaviest: '4.2kg',
  monthAdd: 8,
});

const activeTab = ref<TabKey>('all');
const keyword = ref('');
const sortLabel = ref('时间');

const tabs = [
  { key: 'all'     as TabKey, label: '全部' },
  { key: 'week'    as TabKey, label: '本周' },
  { key: 'public'  as TabKey, label: '公开' },
  { key: 'private' as TabKey, label: '私密' },
];

const catches = ref<Catch[]>([
  {
    id: 'c1',
    name: '燕子矶半天三条板鲫',
    weight: '1.2kg',
    spot: '燕子矶江边',
    time: '今早 5:42',
    weather: '气压回升 · 早窗连竿',
    likes: 32,
    tone: 'primary',
    isPublic: true,
    weekly: true,
  },
  {
    id: 'c2',
    name: '江心洲傍晚翘口断口',
    weight: '0.9kg',
    spot: '江心洲北汊',
    time: '昨日 18:20',
    weather: '东南风 · 翘嘴口窗',
    likes: 18,
    tone: 'blue',
    isPublic: true,
    weekly: true,
  },
  {
    id: 'c3',
    name: '老山水库守到鲤鱼',
    weight: '3.8kg',
    spot: '老山水库外湾',
    time: '5月14日 16:10',
    weather: '小雨 · 大鱼出动',
    likes: 56,
    tone: 'orange',
    isPublic: false,
    weekly: false,
  },
  {
    id: 'c4',
    name: '青龙湾连竿鲫鱼',
    weight: '0.6kg',
    spot: '青龙湾黑坑',
    time: '5月12日 9:30',
    weather: '晴 · 浮漂稳',
    likes: 9,
    tone: 'primary',
    isPublic: true,
    weekly: false,
  },
]);

const filtered = computed<Catch[]>(() => {
  let pool = catches.value;
  switch (activeTab.value) {
    case 'week':    pool = pool.filter(c => c.weekly); break;
    case 'public':  pool = pool.filter(c => c.isPublic); break;
    case 'private': pool = pool.filter(c => !c.isPublic); break;
  }
  const kw = keyword.value.trim();
  if (kw) pool = pool.filter(c => c.name.includes(kw) || c.spot.includes(kw) || c.weather.includes(kw));
  return pool;
});

const onFilter = () => uni.showActionSheet({
  itemList: ['按时间', '按重量', '按点赞'],
  success: (r) => {
    sortLabel.value = ['时间', '重量', '点赞'][r.tapIndex];
  },
  fail: () => {},
});

const onSort = () => onFilter();

const onOpen = (c: Catch) => uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${c.id}` });
const onPublish = () => uni.navigateTo({ url: '/subpackages/catch/create/index' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
