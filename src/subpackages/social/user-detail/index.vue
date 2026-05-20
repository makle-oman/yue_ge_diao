<template>
  <view class="user-detail">
    <!-- 顶部悬浮（脱离滚动流） -->
    <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="icon-btn" @click="onMore">
        <mxy-icon name="more_horiz" :size="40" color="#fff" />
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="hero">
        <image class="hero-img" :src="user.cover" mode="aspectFill" />
        <view class="hero-shade" />

        <view class="hero-content">
          <view class="avatar-ring">
            <mxy-avatar :src="user.avatar" :size="128" />
          </view>
          <view class="hero-text">
            <text class="hero-name">{{ user.name }}</text>
            <text class="hero-meta">{{ user.years }}年钓龄 · {{ user.style }} · {{ user.distance }}</text>
            <view class="credit-pill">
              <mxy-icon name="verified" :size="24" color="#F5A623" />
              <text class="credit-text">信用 {{ user.credit }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="stats-card">
          <view class="stats-cell">
            <text class="stats-num primary">{{ user.stats.catch }}</text>
            <text class="stats-label">鱼获</text>
          </view>
          <view class="stats-div" />
          <view class="stats-cell">
            <text class="stats-num secondary">{{ user.stats.spot }}</text>
            <text class="stats-label">钓点</text>
          </view>
          <view class="stats-div" />
          <view class="stats-cell">
            <text class="stats-num accent">{{ user.stats.best }}</text>
            <text class="stats-label">最大记录</text>
          </view>
        </view>

        <view class="actions">
          <view
            class="follow-btn"
            :class="{ following: user.following }"
            @click="onFollow"
          >
            <text class="follow-btn-text">{{ user.following ? '已关注' : '关注' }}</text>
          </view>
          <view class="invite-btn" @click="onInvite">
            <text class="invite-btn-text">约他出钓</text>
          </view>
        </view>

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

        <view v-if="activeTab === 'catch'" class="feed-grid">
          <view
            v-for="(f, idx) in feed"
            :key="idx"
            class="feed-card"
            @click="onFeed"
          >
            <image class="feed-img" :src="f.img" mode="aspectFill" />
            <view class="feed-text">
              <text class="feed-title">{{ f.title }}</text>
              <text class="feed-sub">{{ f.sub }}</text>
            </view>
          </view>
        </view>

        <view v-else class="empty">
          <text class="empty-text">暂未公开钓点</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight } = useSystemInfo();

const user = ref({
  cover: 'https://images.unsplash.com/photo-1767884161822-2c890bdae11f?w=900',
  avatar: '',
  name: '阿峰路亚',
  years: 3,
  style: '路亚',
  distance: '3.4km',
  credit: 96,
  following: false,
  stats: {
    catch: 42,
    spot: 8,
    best: '3.6kg',
  },
});

type TabKey = 'catch' | 'spot';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'catch', label: '鱼获' },
  { key: 'spot',  label: '钓点' },
];
const activeTab = ref<TabKey>('catch');

const feed = ref([
  {
    img: 'https://images.unsplash.com/photo-1638474690238-4a55f6007635?w=400',
    title: '翘嘴 · 3.6斤',
    sub: '江心洲北汊 · 今天',
  },
  {
    img: 'https://images.unsplash.com/photo-1611110176776-ea2a9ba5d376?w=400',
    title: '鲈鱼 · 2斤',
    sub: '六合码头 · 昨天',
  },
]);

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onMore = () => uni.showActionSheet({
  itemList: ['举报', '屏蔽', '复制主页链接'],
  success: () => uni.showToast({ title: '操作 (待开发)', icon: 'none' }),
});
const onFollow = () => {
  user.value.following = !user.value.following;
  uni.showToast({ title: user.value.following ? '已关注' : '已取消关注', icon: 'success' });
};
const onInvite = () => uni.showToast({ title: '已发送出钓邀请', icon: 'success' });
const onFeed = () => uni.navigateTo({ url: '/subpackages/catch/detail/index?id=demo' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
