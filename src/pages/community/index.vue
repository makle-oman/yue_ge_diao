<template>
  <view class="community-page">
    <!-- 顶部 Tab + 搜索 -->
    <view class="feed-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="feed-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="feed-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <text class="feed-tab-text">{{ tab.label }}</text>
          <view v-if="activeTab === tab.key" class="feed-tab-bar" />
        </view>
      </view>

      <view class="feed-actions">
        <view class="icon-btn" @click="onSearch">
          <mxy-icon name="search" :size="40" color="#1A2B33" />
        </view>
      </view>
    </view>

    <!-- 双列瀑布流 -->
    <scroll-view class="feed-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view class="feed-grid">
        <view class="feed-col">
          <mxy-feed-card
            v-for="item in colLeft"
            :key="item.id"
            :cover="item.cover"
            :title="item.title"
            :tag="item.tag"
            :location="item.location"
            :species="item.species"
            :author-name="item.author"
            :author-avatar="item.avatar"
            :likes="item.likes"
            :liked="item.liked"
            @click="onCardTap(item)"
            @like="onLike(item)"
          />
        </view>
        <view class="feed-col">
          <mxy-feed-card
            v-for="item in colRight"
            :key="item.id"
            :cover="item.cover"
            :title="item.title"
            :tag="item.tag"
            :location="item.location"
            :species="item.species"
            :author-name="item.author"
            :author-avatar="item.avatar"
            :likes="item.likes"
            :liked="item.liked"
            @click="onCardTap(item)"
            @like="onLike(item)"
          />
        </view>
      </view>

      <view class="feed-end">
        <text class="feed-end-text">— 没有更多了 —</text>
      </view>
    </scroll-view>

    <CustomTabBar current="community" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface FeedItem {
  id: string;
  cover: string;
  title: string;
  tag?: string;
  location?: string;
  species?: string;
  author: string;
  avatar?: string;
  likes: number;
  liked: boolean;
}

const { statusBarHeight } = useSystemInfo();

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'nearby',    label: '附近' },
  { key: 'follow',    label: '关注' },
];

const activeTab = ref('recommend');
const refreshing = ref(false);

const feedList = ref<FeedItem[]>([
  {
    id: 'f1',
    cover: 'https://images.unsplash.com/photo-1635712291708-7afe9e037503?w=600',
    title: '傍晚野塘连竿,三斤大鲫鱼出水',
    tag: '鱼获',
    location: '玄武湖东岸',
    species: '鲫鱼',
    author: '老钓客',
    likes: 128,
    liked: false,
  },
  {
    id: 'f2',
    cover: 'https://images.unsplash.com/photo-1564875009929-58c9517cd6fd?w=600',
    title: '紫金山水库新发现的小钓点,人少鱼多',
    tag: '钓点',
    location: '紫金山水库',
    author: '钓鱼小哥',
    likes: 256,
    liked: true,
  },
  {
    id: 'f3',
    cover: 'https://images.unsplash.com/photo-1741134913547-46bbab5a1f60?w=600',
    title: '凌晨四点出门,黑坑爆护实录',
    tag: '鱼获',
    species: '草鱼',
    author: '夜钓达人',
    likes: 432,
    liked: false,
  },
  {
    id: 'f4',
    cover: 'https://images.unsplash.com/photo-1727524315467-264c0bd47a13?w=600',
    title: '钓鱼三年总结,新手必看装备清单',
    tag: '钓技',
    author: '装备党',
    likes: 89,
    liked: false,
  },
  {
    id: 'f5',
    cover: 'https://images.unsplash.com/photo-1598209292386-3be9c519290a?w=600',
    title: '组队周末野钓,招两人,自驾来',
    tag: '组队',
    location: '溧水石臼湖',
    author: '湖光山色',
    likes: 35,
    liked: false,
  },
  {
    id: 'f6',
    cover: 'https://images.unsplash.com/photo-1706652783711-fcb68bad9c9f?w=600',
    title: '海钓归来,带回一筐小黄鱼',
    tag: '鱼获',
    location: '连云港海边',
    species: '黄鱼',
    author: '海风咸',
    likes: 178,
    liked: false,
  },
]);

// 双列瀑布流: 简单按奇偶分两列,实际生产可按累计高度分配
const colLeft = computed(() => feedList.value.filter((_, i) => i % 2 === 0));
const colRight = computed(() => feedList.value.filter((_, i) => i % 2 === 1));

const onCardTap = (item: FeedItem) => {
  uni.navigateTo({ url: `/subpackages/catch/detail?id=${item.id}` });
};

const onLike = (item: FeedItem) => {
  item.liked = !item.liked;
  item.likes += item.liked ? 1 : -1;
};

const onSearch = () => {
  uni.showToast({ title: '搜索(待开发)', icon: 'none' });
};

const onRefresh = async () => {
  refreshing.value = true;
  setTimeout(() => { refreshing.value = false; }, 800);
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
