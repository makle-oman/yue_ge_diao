<template>
  <view class="nearby-users">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-left" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">附近钓友</text>
        <view class="map-btn" @click="onMap">
          <mxy-icon name="map" :size="28" color="#2D8F87" />
          <text class="map-btn-text">地图</text>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="form">
        <view class="privacy-card">
          <mxy-icon name="visibility" :size="32" color="#2D8F87" />
          <view class="privacy-text">
            <text class="privacy-main">你已允许被附近钓友发现</text>
            <text class="privacy-sub">可在设置中随时关闭</text>
          </view>
        </view>

        <view class="sort-chips">
          <view
            v-for="s in sortOptions"
            :key="s.key"
            class="chip"
            :class="{ active: activeSort === s.key }"
            @click="activeSort = s.key"
          >
            <text>{{ s.label }}</text>
          </view>
        </view>

        <view class="user-list">
          <view
            v-for="u in users"
            :key="u.id"
            class="user-card"
            @click="onOpen(u)"
          >
            <view class="avatar" :class="`tone-${u.tone}`" />
            <view class="user-info">
              <text class="user-name">{{ u.name }}</text>
              <text class="user-meta">{{ u.meta }}</text>
              <view class="tag-row">
                <view
                  v-for="(t, idx) in u.tags"
                  :key="idx"
                  class="tag"
                  :class="`tag--${t.tone}`"
                >
                  <text>{{ t.text }}</text>
                </view>
              </view>
            </view>
            <view class="view-btn" @click.stop="onOpen(u)">
              <text class="view-btn-text">查看</text>
            </view>
          </view>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const statusBarHeight = ref(0);
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
} catch (_e) {
  statusBarHeight.value = 20;
}

const sortOptions = [
  { key: 'distance', label: '距离优先' },
  { key: 'active',   label: '活跃度' },
  { key: 'lure',     label: '只看路亚' },
];
const activeSort = ref('distance');

type AvatarTone = 'primary' | 'blue' | 'orange';
type TagTone = 'primary' | 'blue' | 'orange' | 'ghost';

interface AnglerTag {
  text: string;
  tone: TagTone;
}

interface Angler {
  id: string;
  name: string;
  meta: string;
  tone: AvatarTone;
  tags: AnglerTag[];
}

const users = ref<Angler[]>([
  {
    id: 'u1',
    name: '老周野钓',
    tone: 'primary',
    meta: '1.8km · 15分钟前活跃',
    tags: [
      { text: '野钓', tone: 'primary' },
      { text: '鲫鱼', tone: 'orange' },
    ],
  },
  {
    id: 'u2',
    name: '阿峰路亚',
    tone: 'blue',
    meta: '3.4km · 今天发过鱼获',
    tags: [
      { text: '路亚', tone: 'blue' },
      { text: '江河', tone: 'ghost' },
    ],
  },
  {
    id: 'u3',
    name: '南京海风',
    tone: 'orange',
    meta: '6.2km · 周末常出钓',
    tags: [
      { text: '海钓', tone: 'blue' },
      { text: '周末', tone: 'ghost' },
    ],
  },
  {
    id: 'u4',
    name: '钓鱼阿强',
    tone: 'primary',
    meta: '9.8km · 最近钓获鲤鱼',
    tags: [
      { text: '鲤鱼', tone: 'primary' },
      { text: '早晨', tone: 'ghost' },
    ],
  },
]);

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onMap = () => uni.showToast({ title: '地图视图 (待开发)', icon: 'none' });
const onOpen = (u: Angler) => uni.navigateTo({ url: `/pages/user/detail?id=${u.id}` });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.nearby-users {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.header {
  flex: none;
  background: $bg-card;
  border-bottom: 1rpx solid $border-light;
}
.nav {
  height: 96rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.nav-left {
  width: 80rpx;
  display: flex;
  align-items: center;

  &:active { opacity: .6; }
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 900;
  color: $text-primary;
}
.map-btn {
  width: 120rpx;
  height: 60rpx;
  border-radius: 32rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  &:active { opacity: .8; }

  .map-btn-text {
    font-size: 24rpx;
    color: $primary;
    font-weight: 800;
  }
}

.content {
  flex: 1;
  min-height: 0;
}
.form {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.privacy-card {
  background: $soft-primary;
  border-radius: 32rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.privacy-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;

  .privacy-main {
    font-size: 26rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .privacy-sub {
    font-size: 22rpx;
    color: $text-secondary;
  }
}

.sort-chips {
  display: flex;
  gap: 16rpx;
}
.chip {
  height: 56rpx;
  padding: 0 26rpx;
  border-radius: 28rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  display: inline-flex;
  align-items: center;

  text {
    font-size: 24rpx;
    color: $text-secondary;
    font-weight: 700;
  }
  &.active {
    background: $primary;
    border-color: $primary;
    text { color: #fff; font-weight: 800; }
  }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.user-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  &:active { transform: scale(.99); }
}
.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  flex-shrink: 0;

  &.tone-primary { background: $soft-primary; }
  &.tone-blue    { background: $soft-blue; }
  &.tone-orange  { background: $soft-orange; }
}
.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

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
.tag-row {
  display: flex;
  gap: 12rpx;
  margin-top: 4rpx;
}
.tag {
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 20rpx;
    font-weight: 800;
    line-height: 1;
  }
  &.tag--primary { background: $soft-primary; text { color: $primary; } }
  &.tag--blue    { background: $soft-blue;    text { color: $secondary; } }
  &.tag--orange  { background: $soft-orange;  text { color: $accent; } }
  &.tag--ghost   { background: $bg-page; text { color: $text-secondary; } }
}
.view-btn {
  height: 64rpx;
  padding: 0 26rpx;
  border-radius: 32rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active { transform: scale(.95); }

  .view-btn-text {
    font-size: 22rpx;
    color: #fff;
    font-weight: 900;
  }
}

.end-pad { height: 48rpx; }
</style>
