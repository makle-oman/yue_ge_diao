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
            @click="onTab(t.key)"
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
        <text class="unfav-body-desc">该{{ removeTarget?.kind === 'user' ? '钓友' : '收藏' }}会从"我的收藏"中移除，不影响你的历史浏览和鱼获记录。</text>
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
import { ref, computed, onMounted } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import { listFavorites, removeFavorite, type FavoriteItem, type FavoriteKind } from '@/api/favorites';

const { statusBarHeight } = useSystemInfo();

type TabKey = 'spot' | 'user';
type TagTone = 'primary' | 'blue' | 'orange';

const activeTab = ref<TabKey>('spot');

const todayBest = ref({
  score: 86,
  name: '江心洲北汊',
  window: '翘嘴窗口',
  weather: '气压稳定, 东南风 2 级',
  distance: '4.8km',
});

const favoriteSpots = ref<(FavoriteItem & { tagTone: TagTone; actionText: string })[]>([]);
const favoriteUsers = ref<(FavoriteItem & { tagTone: TagTone; actionText: string })[]>([]);
const counts = ref({ spot: 0, user: 0 });
const loading = ref(false);
const keyword = ref('');

const tabs = computed(() => [
  { key: 'spot' as TabKey, label: '钓点', count: counts.value.spot },
  { key: 'user' as TabKey, label: '钓友', count: counts.value.user },
]);

const filtered = computed(() => {
  const list = activeTab.value === 'spot' ? favoriteSpots.value : favoriteUsers.value;
  const kw = keyword.value.trim();
  if (!kw) return list;
  return list.filter((item) =>
    item.name.includes(kw) || item.meta.includes(kw) || item.foot.includes(kw),
  );
});

function tagTone(kind: FavoriteKind): TagTone {
  if (kind === 'catch') return 'orange';
  if (kind === 'user') return 'blue';
  return 'primary';
}

function actionText(kind: FavoriteKind): string {
  if (kind === 'catch') return '查看';
  if (kind === 'user') return '取关';
  return '取消';
}

function adapt(item: FavoriteItem) {
  return {
    ...item,
    tagTone: tagTone(item.kind),
    actionText: actionText(item.kind),
  };
}

async function loadList() {
  if (loading.value) return;
  loading.value = true;
  try {
    const resp = await listFavorites({ type: activeTab.value, limit: 50 });
    counts.value = resp.counts;
    const list = resp.list.map(adapt);
    if (activeTab.value === 'spot') {
      favoriteSpots.value = list;
    } else {
      favoriteUsers.value = list;
    }
    const firstSpot = list.find((x) => x.kind === 'spot');
    if (firstSpot) {
      todayBest.value.name = firstSpot.name;
      todayBest.value.distance = firstSpot.meta || '已收藏';
    }
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '收藏加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onTab(key: TabKey) {
  if (activeTab.value === key) return;
  activeTab.value = key;
  void loadList();
}

onMounted(loadList);

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onSearch = () => {
  uni.showModal({
    title: '搜索收藏',
    editable: true,
    placeholderText: '输入钓点、鱼获或钓友',
    success: (res) => {
      if (res.confirm) keyword.value = res.content?.trim() ?? '';
    },
  });
};
const onOpen = (f: FavoriteItem) => {
  if (f.kind === 'spot')  uni.navigateTo({ url: `/subpackages/spot/detail/index?id=${f.id}` });
  if (f.kind === 'catch') uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${f.id}` });
  if (f.kind === 'user')  uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${f.id}` });
};
const onRemove = (f: FavoriteItem) => {
  if (f.kind === 'catch') {
    onOpen(f);
    return;
  }
  removeTarget.value = f;
  removeOpen.value = true;
};

const removeOpen = ref(false);
const removeTarget = ref<FavoriteItem | null>(null);

const onConfirmRemove = async () => {
  const f = removeTarget.value;
  if (!f) return;
  try {
    await removeFavorite({ kind: f.kind, id: f.id });
    const list = f.kind === 'user' ? favoriteUsers : favoriteSpots;
    list.value = list.value.filter(item => !(item.id === f.id && item.kind === f.kind));
    counts.value = {
      ...counts.value,
      [f.kind === 'user' ? 'user' : 'spot']: Math.max(0, counts.value[f.kind === 'user' ? 'user' : 'spot'] - 1),
    };
    removeOpen.value = false;
    uni.showToast({ title: '已取消收藏', icon: 'success' });
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '操作失败', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
