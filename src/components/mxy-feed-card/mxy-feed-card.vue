<template>
  <view class="feed-card" @click="$emit('click')">
    <view class="cover-wrap">
      <image class="cover-img" :src="cover" mode="widthFix" />
      <view v-if="tag" class="cover-tag">
        <text>{{ tag }}</text>
      </view>
    </view>

    <view class="card-body">
      <text class="card-title">{{ title }}</text>

      <view v-if="location || species" class="card-meta">
        <template v-if="location">
          <mxy-icon name="location_on" :size="20" color="#6B7B85" />
          <text class="card-meta-text">{{ location }}</text>
        </template>
        <text v-if="location && species" class="card-meta-sep">·</text>
        <text v-if="species" class="card-meta-text">{{ species }}</text>
      </view>

      <view class="card-foot">
        <view class="author">
          <mxy-avatar :src="authorAvatar" :size="36" />
          <text class="author-name">{{ authorName }}</text>
        </view>
        <view class="like" @click.stop="onLike">
          <mxy-icon name="favorite" :size="28" :filled="liked" :color="liked ? '#FF6B6B' : '#99A5AD'" />
          <text class="like-count">{{ likes }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import MxyAvatar from '@/components/mxy-avatar/mxy-avatar.vue';

withDefaults(defineProps<{
  cover: string;
  title: string;
  tag?: string;
  location?: string;
  species?: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  liked?: boolean;
}>(), {
  liked: false,
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'like'): void;
}>();

const onLike = () => emit('like');
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.feed-card {
  width: 100%;
  background: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(26,43,51,.08);
  margin-bottom: 20rpx;
  transition: transform .15s;

  &:active { transform: scale(.98); }
}

.cover-wrap {
  position: relative;
  width: 100%;
  background: $bg-hover;

  .cover-img {
    display: block;
    width: 100%;
  }

  .cover-tag {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    padding: 4rpx 14rpx;
    background: rgba(26,43,51,.6);
    border-radius: 16rpx;

    text {
      color: #fff;
      font-size: $font-xs;
      font-weight: 700;
    }
  }
}

.card-body {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.card-title {
  font-size: $font-sm;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 4rpx;

  .card-meta-text {
    font-size: $font-xs;
    color: $text-secondary;
  }
  .card-meta-sep {
    color: $text-secondary;
    margin: 0 4rpx;
  }
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4rpx;
}

.author {
  display: flex;
  align-items: center;
  gap: 8rpx;

  .author-name {
    font-size: $font-xs;
    color: $text-secondary;
    font-weight: 500;
  }
}

.like {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 8rpx;

  .like-count {
    font-size: $font-xs;
    color: $text-secondary;
    font-weight: 600;
  }
}
</style>
