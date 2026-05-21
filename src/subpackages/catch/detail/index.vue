<template>
  <view class="catch-detail">
    <!-- 固定在顶部的返回/分享按钮（不随内容滚动） -->
    <view
      class="hero-top"
      :style="{ paddingTop: statusBarHeight + 'px', paddingRight: capsuleRightWidth + 'px' }"
    >
      <view class="hero-icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="hero-icon-btn" @click="onShare">
        <mxy-icon name="ios_share" :size="40" color="#fff" />
      </view>
    </view>

    <!-- 滚动主体（包含 hero 图 + 内容面板，一起滚动） -->
    <scroll-view class="content" scroll-y>
      <!-- 顶部图 -->
      <view class="hero">
        <image class="hero-img" :src="catchData.cover" mode="aspectFill" />
        <view class="hero-shade" />
        <view class="hero-card-badge">
          <text class="hero-card-badge-text">朋友圈卡片</text>
        </view>
      </view>

      <view class="panel">
        <!-- 作者 -->
        <view class="user-row">
          <mxy-avatar :src="author.avatar" :size="88" />
          <view class="user-text">
            <text class="user-name">{{ author.name }}</text>
            <text class="user-meta">{{ catchData.time }} · {{ catchData.city }}</text>
          </view>
          <view
            class="follow-btn"
            :class="{ following: author.following }"
            @click="onFollow"
          >
            <text class="follow-btn-text">{{ author.following ? '已关注' : '关注' }}</text>
          </view>
        </view>

        <!-- 数据卡 -->
        <view class="data-card">
          <view class="data-item">
            <text class="data-num">{{ catchData.species }}</text>
            <text class="data-label">鱼种</text>
          </view>
          <view class="data-div" />
          <view class="data-item">
            <text class="data-num accent">{{ catchData.weight }}</text>
            <text class="data-label">重量</text>
          </view>
          <view class="data-div" />
          <view class="data-item">
            <text class="data-num primary">{{ catchData.length }}</text>
            <text class="data-label">长度</text>
          </view>
        </view>

        <!-- 钓点 + 天气 -->
        <view class="info-card">
          <view class="info-row" @click="onSpotTap">
            <mxy-icon name="location_on" :size="36" color="#2D8F87" />
            <text class="info-text strong">{{ catchData.spot }} · 公开位置</text>
            <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
          </view>
          <view class="info-divider" />
          <view class="info-row">
            <mxy-icon name="cloud" :size="36" color="#5BA9C4" />
            <text class="info-text">{{ catchData.weather }}</text>
          </view>
        </view>

        <!-- 描述 -->
        <view class="desc-card">
          <text class="desc-title">钓获记录</text>
          <text class="desc-text">{{ catchData.desc }}</text>
        </view>

        <!-- 评论 -->
        <view class="comments-card" @click="onMoreComments">
          <text class="comments-title">评论 {{ catchData.commentCount }}</text>
          <text class="comments-text">{{ catchData.commentPreview }}</text>
        </view>

      </view>
    </scroll-view>

    <!-- 底部交互栏 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <!-- 赞:仅图标 + 数字（数字为角标,不影响图标垂直居中） -->
      <view class="bottom-icon" :class="{ liked: catchData.liked }" @click="onLike">
        <mxy-icon
          name="favorite"
          :size="56"
          :filled="catchData.liked"
          :color="catchData.liked ? '#FF6B6B' : '#6B7B85'"
        />
        <text class="bottom-icon-count" :class="{ liked: catchData.liked }">{{ catchData.likes }}</text>
      </view>

      <!-- 收藏:星星图标 -->
      <view class="bottom-icon" :class="{ collected: catchData.collected }" @click="onCollect">
        <mxy-icon
          name="star"
          :size="56"
          :filled="catchData.collected"
          :color="catchData.collected ? '#F5A623' : '#6B7B85'"
        />
      </view>

      <!-- 评论 -->
      <view class="bottom-btn bottom-btn--ghost" @click="onMoreComments">
        <text class="bottom-btn-text">评论</text>
      </view>

      <!-- 生成分享卡片 -->
      <view class="bottom-btn bottom-btn--primary" @click="onShareCard">
        <text class="bottom-btn-text primary">生成分享卡片</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight, safeBottom, capsuleRightWidth } = useSystemInfo();

const author = ref({
  name: '老王钓鱼',
  avatar: '',
  following: false,
});

const catchData = ref({
  cover: 'https://images.unsplash.com/photo-1766425499950-16cbd46c4cd2?w=900',
  time: '今天 06:42',
  city: '南京',
  species: '鲫鱼',
  weight: '1.2斤',
  length: '28cm',
  spot: '燕子矶江边',
  weather: '多云 24℃ · 气压 1008hPa · 东风 3 级',
  desc: '今天气压回升，鱼口很活，半天三条板鲫。这条留影，其他放流。',
  commentCount: 8,
  commentPreview: '阿峰：这点早上几点开口？  ·  老周：板鲫漂亮。',
  liked: false,
  likes: 32,
  collected: false,
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onFollow = () => {
  author.value.following = !author.value.following;
  uni.showToast({ title: author.value.following ? '已关注' : '已取消关注', icon: 'success' });
};
const onSpotTap = () => uni.navigateTo({ url: '/subpackages/spot/detail/index?id=demo' });
const onMoreComments = () => uni.navigateTo({ url: '/subpackages/catch/comments/index' });
const onLike = () => {
  catchData.value.liked = !catchData.value.liked;
  catchData.value.likes += catchData.value.liked ? 1 : -1;
};
const onCollect = () => {
  catchData.value.collected = !catchData.value.collected;
  uni.showToast({
    title: catchData.value.collected ? '已收藏' : '已取消收藏',
    icon: 'success',
  });
};
const onShareCard = () => uni.showToast({ title: '分享卡片 (待开发)', icon: 'none' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
