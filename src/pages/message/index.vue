<template>
  <view class="message-page">
    <!-- 顶部状态栏占位 + 标题栏 -->
    <view class="msg-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="msg-nav">
        <text class="msg-title">消息</text>
        <text class="msg-read-all" @click="onReadAll">全部已读</text>
      </view>
    </view>

    <!-- 滚动内容: 仅列表区可滚动 -->
    <scroll-view class="msg-scroll" scroll-y>
      <!-- 4 个互动入口 -->
      <view class="msg-types-card">
        <view
          v-for="t in entryTypes"
          :key="t.key"
          class="msg-type"
          @click="onTypeTap(t)"
        >
          <view class="msg-type-icon" :style="{ background: t.bg }">
            <mxy-icon :name="t.icon" :size="44" :color="t.color" />
            <view v-if="t.badge" class="msg-type-dot" :style="{ minWidth: t.badge.length > 1 ? '32rpx' : '24rpx' }">
              <text class="msg-type-dot-text">{{ t.badge }}</text>
            </view>
          </view>
          <text class="msg-type-label">{{ t.label }}</text>
        </view>
      </view>

      <!-- 最近互动标题 -->
      <view class="msg-section-title">
        <text>最近互动</text>
      </view>

      <!-- 互动列表 -->
      <view class="msg-list-card">
        <view
          v-for="(row, idx) in rows"
          :key="row.id"
          class="msg-row"
        >
          <!-- 头像: 有 avatar 用图，没有用色块占位 -->
          <view v-if="!row.avatar" class="msg-row-av" :style="{ background: row.avBg }" />
          <image v-else class="msg-row-av" :src="row.avatar" mode="aspectFill" />

          <view class="msg-row-text">
            <text class="msg-row-main">{{ row.main }}</text>
            <text class="msg-row-sub" :class="{ accent: row.subAccent }">{{ row.sub }}</text>
          </view>

          <!-- 右侧: 缩略图 / 按钮 / 空 -->
          <image v-if="row.thumb" class="msg-row-thumb" :src="row.thumb" mode="aspectFill" />
          <view v-else-if="row.action" class="msg-row-btn" @click.stop="onAction(row)">
            <text class="msg-row-btn-text">{{ row.action }}</text>
          </view>

          <!-- 分隔线 -->
          <view v-if="idx !== rows.length - 1" class="msg-row-divider" />
        </view>
      </view>

      <view class="msg-end-pad" />
    </scroll-view>

    <CustomTabBar current="message" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface EntryType {
  key: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  badge?: string;
}

interface MsgRow {
  id: string;
  main: string;
  sub: string;
  subAccent?: boolean;
  avatar?: string;
  avBg?: string;
  thumb?: string;
  action?: string;
}

const statusBarHeight = ref(0);
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
} catch (_e) {
  statusBarHeight.value = 20;
}

const entryTypes = ref<EntryType[]>([
  { key: 'comment', label: '评论', icon: 'alternate_email', color: '#F5A623', bg: '#FFF4E1', badge: '2' },
  { key: 'like',    label: '赞',   icon: 'favorite',        color: '#FF6B6B', bg: '#FFF0F0', badge: '12' },
  { key: 'team',    label: '组队', icon: 'groups',          color: '#5BA9C4', bg: '#EAF6FA', badge: '1' },
  { key: 'system',  label: '系统', icon: 'campaign',        color: '#2D8F87', bg: '#EAF5F4' },
]);

const rows = ref<MsgRow[]>([
  {
    id: 'r1',
    main: '老王 赞了你的鱼获',
    sub: '5 分钟前',
    avBg: '#EAF5F4',
    thumb: 'https://images.unsplash.com/photo-1568727349390-7deb45c78797?w=200',
  },
  {
    id: 'r2',
    main: '阿峰 评论：这点水深多少？',
    sub: '18 分钟前',
    avBg: '#EAF6FA',
    thumb: 'https://images.unsplash.com/photo-1716947312960-73401605ee50?w=200',
  },
  {
    id: 'r3',
    main: '小陈 报名了你的组队',
    sub: '今天 08:20 · 待审核',
    subAccent: true,
    avBg: '#FFF4E1',
    action: '查看',
  },
  {
    id: 'r4',
    main: '海风 关注了你',
    sub: '昨天',
    avBg: '#EAF5F4',
  },
  {
    id: 'r5',
    main: '系统：钓点审核已通过',
    sub: '昨天 19:42',
    avBg: '#EAF6FA',
  },
]);

const onReadAll = () => uni.showToast({ title: '已全部标记为已读', icon: 'success' });
const onTypeTap = (t: EntryType) => uni.showToast({ title: `${t.label}(待开发)`, icon: 'none' });
const onAction = (r: MsgRow) => uni.showToast({ title: `查看 ${r.main}`, icon: 'none' });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.message-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

/* ---------- 顶部 ---------- */
.msg-header {
  flex: none;
  background: $bg-page;
  z-index: 9;
}
.msg-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;

  .msg-title {
    font-size: 48rpx;
    font-weight: 900;
    color: $text-primary;
    line-height: 1;
  }
  .msg-read-all {
    font-size: $font-sm;
    font-weight: 700;
    color: $primary;
  }
}

/* ---------- 滚动区 ---------- */
.msg-scroll {
  flex: 1;
  min-height: 0;
  padding-bottom: calc(#{$tabbar-height} + env(safe-area-inset-bottom));
}

/* ---------- 4 个互动入口 ---------- */
.msg-types-card {
  margin: 16rpx 32rpx 0;
  padding: 20rpx;
  background: $bg-card;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  display: flex;
  align-items: center;
}
.msg-type {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &:active { transform: scale(.96); }
}
.msg-type-icon {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg-type-dot {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background: $warning-strong;
  border: 2rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  .msg-type-dot-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 800;
    line-height: 1;
  }
}
.msg-type-label {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: 700;
  line-height: 1;
}

/* ---------- Section Title ---------- */
.msg-section-title {
  padding: 36rpx 32rpx 16rpx;

  text {
    font-size: $font-lg;
    font-weight: 900;
    color: $text-primary;
  }
}

/* ---------- 列表 ---------- */
.msg-list-card {
  margin: 0 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  overflow: hidden;
}

.msg-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 24rpx;

  &:active { background: $bg-hover; }
}

.msg-row-av {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.msg-row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .msg-row-main {
    font-size: $font-base;
    font-weight: 800;
    color: $text-primary;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .msg-row-sub {
    font-size: $font-sm;
    color: $text-secondary;

    &.accent { color: $accent; font-weight: 700; }
  }
}

.msg-row-thumb {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: $bg-hover;
  flex-shrink: 0;
}

.msg-row-btn {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active { transform: scale(.96); }

  .msg-row-btn-text {
    font-size: $font-sm;
    color: #fff;
    font-weight: 800;
    line-height: 1;
  }
}

.msg-row-divider {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 0;
  height: 1rpx;
  background: $border-light;
}

.msg-end-pad {
  height: 32rpx;
}
</style>
