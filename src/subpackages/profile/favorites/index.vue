<template>
  <view class="favorites-page">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">我的收藏</text>
        <view class="nav-search" @click="onSearch">
          <mxy-icon name="search" :size="38" color="#1A2B33" />
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- Tabs -->
        <view class="tabs">
          <view
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="activeTab = t.key"
          >
            <text>{{ t.label }} {{ t.count }}</text>
          </view>
        </view>

        <!-- 今日最佳浮卡 -->
        <view v-if="activeTab === 'spot'" class="today-best">
          <view class="today-left">
            <text class="today-num">{{ todayBest.score }}</text>
            <text class="today-tip">收藏里今日最适合去</text>
          </view>
          <view class="today-info">
            <text class="today-name">{{ todayBest.name }} · {{ todayBest.window }}</text>
            <text class="today-meta">{{ todayBest.weather }}</text>
            <text class="today-meta">距你 {{ todayBest.distance }}</text>
          </view>
        </view>

        <!-- 列表 -->
        <view class="fav-list">
          <view
            v-for="f in filtered"
            :key="f.id"
            class="fav-row"
            :class="`kind-${f.kind}`"
            @click="onOpen(f)"
          >
            <view class="row-tag" :class="`tag--${f.tagTone}`">
              <text>{{ f.tagText }}</text>
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ f.name }}</text>
                <text class="row-action" @click.stop="onRemove(f)">{{ f.actionText }}</text>
              </view>
              <text class="row-meta">{{ f.meta }}</text>
              <text class="row-foot">{{ f.foot }}</text>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 取消收藏确认 Sheet (Design 37) -->
    <mxy-bottom-sheet
      v-model:visible="removeOpen"
      title="取消收藏"
      @cancel="removeOpen = false"
      @done="removeOpen = false"
    >
      <view v-if="removeTarget" class="unfav-banner">
        <view class="unfav-thumb">
          <mxy-icon name="location_on" :size="40" color="#5BA9C4" />
        </view>
        <view class="unfav-banner-info">
          <text class="unfav-banner-name">{{ removeTarget.name }}</text>
          <text class="unfav-banner-sub">取消后可重新从{{ removeTarget.kind === 'user' ? '钓友主页' : '钓点详情' }}收藏</text>
        </view>
      </view>

      <view class="unfav-body">
        <text class="unfav-body-title">确认取消收藏？</text>
        <text class="unfav-body-desc">该{{ removeTarget?.kind === 'user' ? '钓友' : '钓点' }}会从"我的收藏"中移除，不影响你的历史浏览和鱼获记录。</text>
      </view>

      <view class="unfav-buttons">
        <view class="unfav-btn unfav-btn--ghost" @click="removeOpen = false">
          <text class="unfav-btn-text">保留收藏</text>
        </view>
        <view class="unfav-btn unfav-btn--danger" @click="onConfirmRemove">
          <text class="unfav-btn-text white">确认取消</text>
        </view>
      </view>

      <view class="unfav-tip">
        <mxy-icon name="info" :size="36" color="#5BA9C4" />
        <text class="unfav-tip-text">取消收藏不会通知{{ removeTarget?.kind === 'user' ? '对方' : '钓点发布者' }}。</text>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight } = useSystemInfo();

type TabKey = 'spot' | 'user';
type FavKind = 'spot' | 'catch' | 'user';
type TagTone = 'primary' | 'blue' | 'orange';

interface FavItem {
  id: string;
  kind: FavKind;
  tagText: string;
  tagTone: TagTone;
  name: string;
  meta: string;
  foot: string;
  actionText: string;
}

const activeTab = ref<TabKey>('spot');

const todayBest = ref({
  score: 86,
  name: '江心洲北汊',
  window: '翘嘴窗口',
  weather: '气压稳定, 东南风 2 级',
  distance: '4.8km',
});

const favoriteSpots = ref<FavItem[]>([
  {
    id: 'f1',
    kind: 'spot',
    tagText: '钓点',
    tagTone: 'primary',
    name: '江心洲北汊',
    meta: '路亚 · 翘嘴/鲈鱼 · 江湾',
    foot: '今日宜钓评分 86',
    actionText: '取消',
  },
  {
    id: 'f2',
    kind: 'spot',
    tagText: '钓点',
    tagTone: 'blue',
    name: '燕子矶江边',
    meta: '野钓 · 免费 · 缓流',
    foot: '收藏后 18 人去过',
    actionText: '取消',
  },
  {
    id: 'f3',
    kind: 'catch',
    tagText: '鱼获',
    tagTone: 'orange',
    name: '老王的 1.2斤板鲫',
    meta: '燕子矶江边 · 5-12 早窗',
    foot: '气压回升, 早窗连竿',
    actionText: '查看',
  },
]);

const favoriteUsers = ref<FavItem[]>([
  {
    id: 'u1',
    kind: 'user',
    tagText: '钓友',
    tagTone: 'primary',
    name: '老周野钓',
    meta: '5年钓龄 · 常去燕子矶江边',
    foot: '互相关注',
    actionText: '取关',
  },
  {
    id: 'u2',
    kind: 'user',
    tagText: '钓友',
    tagTone: 'blue',
    name: '路亚小陈',
    meta: '3年钓龄 · 翘嘴/鲈鱼',
    foot: '上次活跃 30 分钟前',
    actionText: '取关',
  },
  {
    id: 'u3',
    kind: 'user',
    tagText: '钓友',
    tagTone: 'orange',
    name: '阿强守水库',
    meta: '10年钓龄 · 老山水库常驻',
    foot: '在线',
    actionText: '取关',
  },
]);

const tabs = computed(() => [
  { key: 'spot' as TabKey, label: '钓点', count: favoriteSpots.value.length },
  { key: 'user' as TabKey, label: '钓友', count: favoriteUsers.value.length },
]);

const filtered = computed<FavItem[]>(() => {
  return activeTab.value === 'spot' ? favoriteSpots.value : favoriteUsers.value;
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onSearch = () => uni.showToast({ title: '搜索收藏 (待开发)', icon: 'none' });
const onOpen = (f: FavItem) => {
  if (f.kind === 'spot')  uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${f.id}` });
  if (f.kind === 'catch') uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${f.id}` });
  if (f.kind === 'user')  uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${f.id}` });
};
const onRemove = (f: FavItem) => {
  if (f.kind === 'catch') {
    onOpen(f);
    return;
  }
  removeTarget.value = f;
  removeOpen.value = true;
};

const removeOpen = ref(false);
const removeTarget = ref<FavItem | null>(null);

const onConfirmRemove = () => {
  const f = removeTarget.value;
  if (!f) return;
  const list = f.kind === 'spot' ? favoriteSpots : favoriteUsers;
  list.value = list.value.filter(item => item.id !== f.id);
  removeOpen.value = false;
  uni.showToast({ title: '已取消收藏', icon: 'success' });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
