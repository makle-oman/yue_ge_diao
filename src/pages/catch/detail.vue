<template>
  <view class="catch-detail">
    <!-- 顶部图 -->
    <view class="hero">
      <image class="hero-img" :src="catchData.cover" mode="aspectFill" />
      <view class="hero-shade" />

      <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="hero-icon-btn" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="hero-icon-btn" @click="onShare">
          <mxy-icon name="ios_share" :size="40" color="#fff" />
        </view>
      </view>

      <view class="hero-card-badge">
        <text class="hero-card-badge-text">朋友圈卡片</text>
      </view>
    </view>

    <!-- 滚动主体 -->
    <scroll-view class="content" scroll-y>
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

        <view class="end-pad" />
      </view>
    </scroll-view>

    <!-- 底部交互栏 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view
        class="bottom-btn bottom-btn--like"
        :class="{ liked: catchData.liked }"
        @click="onLike"
      >
        <mxy-icon
          name="favorite"
          :size="28"
          :filled="catchData.liked"
          :color="catchData.liked ? '#FF6B6B' : '#99A5AD'"
        />
        <text class="bottom-btn-text like">赞 {{ catchData.likes }}</text>
      </view>
      <view class="bottom-btn bottom-btn--ghost" @click="onMoreComments">
        <text class="bottom-btn-text">评论</text>
      </view>
      <view class="bottom-btn bottom-btn--ghost" @click="onCollect">
        <text class="bottom-btn-text">收藏</text>
      </view>
      <view class="bottom-btn bottom-btn--primary" @click="onShareCard">
        <text class="bottom-btn-text primary">生成分享卡片</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const statusBarHeight = ref(0);
const safeBottom = ref(0);
try {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 20;
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
} catch (_e) {
  statusBarHeight.value = 20;
}

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
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onFollow = () => {
  author.value.following = !author.value.following;
  uni.showToast({ title: author.value.following ? '已关注' : '已取消关注', icon: 'success' });
};
const onSpotTap = () => uni.navigateTo({ url: '/pages/spot/detail?id=demo' });
const onMoreComments = () => uni.showToast({ title: '评论列表 (待开发)', icon: 'none' });
const onLike = () => {
  catchData.value.liked = !catchData.value.liked;
  catchData.value.likes += catchData.value.liked ? 1 : -1;
};
const onCollect = () => uni.showToast({ title: '已收藏', icon: 'success' });
const onShareCard = () => uni.showToast({ title: '分享卡片 (待开发)', icon: 'none' });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.catch-detail {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  width: 100%;
  height: 720rpx; /* 360px */
  flex: none;
}
.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.hero-shade {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.12);
}
.hero-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  justify-content: space-between;
  padding: 16rpx 32rpx 0;
  z-index: 3;
}
.hero-icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-card-badge {
  position: absolute;
  right: 32rpx;
  bottom: 24rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  z-index: 3;

  .hero-card-badge-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 800;
  }
}

/* ---------- 主体面板 ---------- */
.content {
  flex: 1;
  min-height: 0;
}
.panel {
  margin-top: -56rpx;
  padding: 40rpx 32rpx 24rpx;
  background: $bg-page;
  border-radius: 56rpx 56rpx 0 0;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  position: relative;
  z-index: 4;
}

/* ---------- 作者 ---------- */
.user-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.user-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;

  .user-name {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .user-meta {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.follow-btn {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 32rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active { transform: scale(.96); }
  &.following { background: $bg-hover; .follow-btn-text { color: $text-secondary; } }

  .follow-btn-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 800;
  }
}

/* ---------- 数据卡 ---------- */
.data-card {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .data-num {
    font-size: 40rpx;
    font-weight: 900;
    color: $text-primary;
    line-height: 1;

    &.accent  { color: $accent; }
    &.primary { color: $primary; }
  }
  .data-label {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.data-div {
  width: 2rpx;
  height: 80rpx;
  background: $border-light;
}

/* ---------- 信息卡 ---------- */
.info-card {
  background: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 96rpx;
  padding: 0 24rpx;

  .info-text {
    flex: 1;
    font-size: 26rpx;
    color: $text-secondary;

    &.strong { color: $text-primary; font-weight: 800; }
  }
}
.info-divider {
  height: 1rpx;
  background: $border-light;
  margin: 0 24rpx;
}

/* ---------- 描述 ---------- */
.desc-card {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  .desc-title {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .desc-text {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.5;
  }
}

/* ---------- 评论 ---------- */
.comments-card {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  &:active { background: $bg-hover; }

  .comments-title {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .comments-text {
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.end-pad { height: 200rpx; }

/* ---------- 底部交互栏 ---------- */
.bottom-bar {
  flex: none;
  display: flex;
  gap: 16rpx;
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  padding: 20rpx 32rpx;
}
.bottom-btn {
  height: 92rpx;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 24rpx;

  &:active { transform: scale(.97); }

  .bottom-btn-text {
    font-size: 26rpx;
    font-weight: 800;
    color: $text-primary;

    &.like   { color: $text-secondary; }
    &.primary { color: #fff; }
  }

  &--like {
    background: $soft-red;
    .bottom-btn-text.like { color: $warning-strong; }
    &.liked .bottom-btn-text.like { color: $warning-strong; }
  }
  &--ghost   { background: $bg-page; min-width: 140rpx; }
  &--primary { flex: 1; background: $primary; }
}
</style>
