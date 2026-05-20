<template>
  <view class="my-spots">
    <mxy-form-nav title="我的钓点" action-text="管理" @action="onManage" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 统计卡 -->
        <view class="stats-card">
          <view class="stats-head">
            <text class="stats-title">我上报的钓点</text>
            <view v-if="reviewCount > 0" class="review-badge">
              <text class="review-badge-text">{{ reviewCount }} 个待审</text>
            </view>
          </view>
          <view class="stats-row">
            <view class="stats-cell">
              <text class="stats-num primary">{{ stats.spots }}</text>
              <text class="stats-label">钓点</text>
            </view>
            <view class="stats-div" />
            <view class="stats-cell">
              <text class="stats-num secondary">{{ stats.catches }}</text>
              <text class="stats-label">鱼获</text>
            </view>
            <view class="stats-div" />
            <view class="stats-cell">
              <text class="stats-num accent">{{ stats.views }}</text>
              <text class="stats-label">浏览</text>
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
            <text>{{ t.label }}{{ t.count !== undefined ? ' ' + t.count : '' }}</text>
          </view>
        </view>

        <!-- 钓点列表 -->
        <view class="spot-list">
          <view
            v-for="s in filteredSpots"
            :key="s.id"
            class="spot-row"
            @click="onOpen(s)"
          >
            <view class="row-icon" :class="`tone-${s.tone}`">
              <text class="row-icon-text">钓</text>
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ s.name }}</text>
                <view class="row-tag" :class="`tag--${s.statusTone}`">
                  <text>{{ s.statusText }}</text>
                </view>
              </view>
              <text class="row-meta">{{ s.meta }}</text>
              <text class="row-foot">{{ s.foot }}</text>
            </view>
            <text class="row-edit" @click.stop="onEdit(s)">编辑</text>
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
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const { safeBottom } = useSystemInfo();

type TabKey = 'all' | 'published' | 'review';
type Tone = 'primary' | 'blue' | 'orange';
type StatusTone = 'primary' | 'accent' | 'muted';

interface MySpot {
  id: string;
  name: string;
  meta: string;
  foot: string;
  tone: Tone;
  statusText: string;
  statusTone: StatusTone;
  published: boolean;
}

const stats = ref({
  spots: 23,
  catches: 186,
  views: '3.2k',
});

const activeTab = ref<TabKey>('all');

const spots = ref<MySpot[]>([
  {
    id: 's1',
    name: '燕子矶江边',
    meta: '评分 4.5 · 免费 · 4.5公里',
    foot: '本月 7 条鱼获 · 浏览 820',
    tone: 'primary',
    statusText: '已发布',
    statusTone: 'primary',
    published: true,
  },
  {
    id: 's2',
    name: '老山水库外湾',
    meta: '水库 · 收费 30 · 有厕所',
    foot: '近 7 天 4 条鱼获 · 浏览 412',
    tone: 'blue',
    statusText: '待审',
    statusTone: 'accent',
    published: false,
  },
  {
    id: 's3',
    name: '青龙湾黑坑',
    meta: '黑坑 · 100/4小时 · 可停车',
    foot: '今日放鱼 460 · 今日热门',
    tone: 'orange',
    statusText: '已发布',
    statusTone: 'primary',
    published: true,
  },
  {
    id: 's4',
    name: '六合老码头',
    meta: '江湾 · 免费 · 6.5公里',
    foot: '补充照片中 · 5-18',
    tone: 'primary',
    statusText: '待审',
    statusTone: 'accent',
    published: false,
  },
]);

const reviewCount = computed(() => spots.value.filter(s => !s.published).length);

const tabs = computed(() => [
  { key: 'all' as TabKey, label: '全部', count: spots.value.length },
  { key: 'published' as TabKey, label: '已发布', count: spots.value.filter(s => s.published).length },
  { key: 'review' as TabKey, label: '待审核', count: reviewCount.value },
]);

const filteredSpots = computed(() => {
  switch (activeTab.value) {
    case 'published': return spots.value.filter(s => s.published);
    case 'review':    return spots.value.filter(s => !s.published);
    default:          return spots.value;
  }
});

const onManage = () => uni.showToast({ title: '批量管理 (待开发)', icon: 'none' });
const onOpen = (s: MySpot) => uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${s.id}` });
const onEdit = (s: MySpot) => uni.showToast({ title: `编辑 ${s.name}`, icon: 'none' });
const onReport = () => uni.navigateTo({ url: '/subpackages/spot/create/index' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
