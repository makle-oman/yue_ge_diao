<template>
  <view class="team-detail">
    <!-- Hero -->
    <view class="hero">
      <image class="hero-img" :src="team.cover" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="icon-btn" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="status-badge">
          <text class="status-badge-text">{{ team.statusText }}</text>
        </view>
      </view>
      <view class="hero-bottom">
        <text class="hero-title">{{ team.title }}</text>
        <text class="hero-sub">{{ team.subtitle }}</text>
        <view class="countdown">
          <text class="countdown-text">距离出发 {{ countdown }}</text>
        </view>
      </view>
    </view>

    <!-- 内容 -->
    <scroll-view class="content" scroll-y>
      <view class="panel">
        <!-- 汇总 -->
        <view class="summary-card">
          <view class="summary-cell">
            <text class="summary-num">{{ team.joined }}/{{ team.max }}</text>
            <text class="summary-label">已报名</text>
          </view>
          <view class="summary-div" />
          <view class="summary-cell">
            <text class="summary-num accent">{{ team.cost }}</text>
            <text class="summary-label">费用</text>
          </view>
          <view class="summary-div" />
          <view class="summary-cell">
            <text class="summary-num secondary">{{ team.carpool }}</text>
            <text class="summary-label">{{ team.carpoolSub }}</text>
          </view>
        </view>

        <!-- 发起人 -->
        <view class="owner-card">
          <mxy-avatar :src="owner.avatar" :size="100" />
          <view class="owner-info">
            <text class="owner-name">{{ owner.name }}</text>
            <text class="owner-meta">发起人 · {{ owner.years }}年钓龄 · 爽约 {{ owner.absence }} 次</text>
          </view>
          <view class="owner-btn" @click="onOwner">
            <text class="owner-btn-text">主页</text>
          </view>
        </view>

        <!-- 已报名钓友 -->
        <view class="members-card">
          <text class="members-title">已报名钓友</text>
          <view class="members-row">
            <view
              v-for="(m, idx) in members"
              :key="idx"
              class="member-avatar"
              :class="`tone-${m.tone}`"
            />
            <view v-if="extraCount > 0" class="member-extra">
              <text class="member-extra-text">+{{ extraCount }}</text>
            </view>
            <text class="members-state">{{ team.joinHint }}</text>
          </view>
        </view>

        <!-- 备注 -->
        <view class="desc-card">
          <text class="desc-title">备注</text>
          <text class="desc-text">{{ team.desc }}</text>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="ghost-btn" @click="onContact">
        <text class="ghost-btn-text">联系发起人</text>
      </view>
      <view class="join-btn" :class="{ disabled: team.joined >= team.max }" @click="onJoin">
        <text class="join-btn-text">{{ team.joined >= team.max ? '已满员' : '报名参加' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const statusBarHeight = ref(0);
const safeBottom = ref(0);
try {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 20;
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
} catch (_e) {
  statusBarHeight.value = 20;
}

const team = ref({
  cover: 'https://images.unsplash.com/photo-1665355259602-6d57b0639ab0?w=900',
  title: '周六清晨一起出钓',
  subtitle: '燕子矶江边 · 05月25日 05:30',
  statusText: '招募中',
  joined: 3,
  max: 6,
  cost: 'AA',
  carpool: '拼车',
  carpoolSub: '需要',
  joinHint: '报名后由发起人审核',
  desc: '早口窗口短，建议 5 点前到。带抄网，岸边湿滑，车停在路边白线内。报名通过后拉微信群。',
  startAt: Date.now() + 1000 * 60 * 60 * 60, // 模拟 2天12小时后
});

const owner = ref({
  name: '老周野钓',
  avatar: '',
  years: 5,
  absence: 0,
});

type Tone = 'primary' | 'blue' | 'orange';
const members = ref<{ tone: Tone }[]>([
  { tone: 'primary' },
  { tone: 'blue' },
  { tone: 'orange' },
]);
const extraCount = computed(() => Math.max(0, team.value.joined - members.value.length));

const countdown = computed(() => {
  const diff = team.value.startAt - Date.now();
  if (diff <= 0) return '已开始';
  const totalH = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalH / 24);
  const hours = totalH % 24;
  if (days > 0) return `${days}天${hours}小时`;
  return `${hours}小时`;
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onOwner = () => uni.navigateTo({ url: '/pages/user/detail?id=owner' });
const onContact = () => uni.showToast({ title: '联系发起人 (待开发)', icon: 'none' });
const onJoin = () => {
  if (team.value.joined >= team.value.max) {
    uni.showToast({ title: '已满员', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已提交报名，等待审核', icon: 'success' });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.team-detail {
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
  height: 476rpx; /* 238px */
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
  background: rgba(18, 52, 45, 0.66);
}
.hero-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 16rpx 32rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 3;
}
.icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-badge {
  height: 60rpx;
  padding: 0 22rpx;
  border-radius: 30rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;

  .status-badge-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 900;
  }
}
.hero-bottom {
  position: absolute;
  left: 48rpx;
  right: 48rpx;
  bottom: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  z-index: 3;

  .hero-title {
    font-size: 52rpx;
    color: #fff;
    font-weight: 900;
  }
  .hero-sub {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.86);
    font-weight: 700;
  }
}
.countdown {
  align-self: flex-start;
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  margin-top: 8rpx;

  .countdown-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 800;
  }
}

/* ---------- 主体 ---------- */
.content {
  flex: 1;
  min-height: 0;
}
.panel {
  margin-top: -40rpx;
  padding: 32rpx 32rpx 24rpx;
  background: $bg-page;
  border-radius: 48rpx 48rpx 0 0;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  position: relative;
  z-index: 4;
}

/* ---------- 汇总卡 ---------- */
.summary-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx 16rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(26, 43, 51, 0.10);
}
.summary-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;

  .summary-num {
    font-size: 48rpx;
    line-height: 1;
    font-weight: 900;
    color: $primary;

    &.accent    { color: $accent; }
    &.secondary { color: $secondary; font-size: 44rpx; }
  }
  .summary-label {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.summary-div {
  width: 2rpx;
  height: 96rpx;
  background: $border-light;
}

/* ---------- 发起人 ---------- */
.owner-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.owner-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .owner-name {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .owner-meta {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.owner-btn {
  height: 60rpx;
  padding: 0 26rpx;
  border-radius: 32rpx;
  background: $bg-page;
  display: flex;
  align-items: center;

  &:active { opacity: .8; }

  .owner-btn-text {
    font-size: 24rpx;
    color: $text-primary;
    font-weight: 800;
  }
}

/* ---------- 已报名 ---------- */
.members-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.members-title {
  font-size: 30rpx;
  font-weight: 900;
  color: $text-primary;
}
.members-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;

  &.tone-primary { background: $soft-primary; }
  &.tone-blue    { background: $soft-blue; }
  &.tone-orange  { background: $soft-orange; }
}
.member-extra {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .member-extra-text {
    font-size: 26rpx;
    color: $text-secondary;
    font-weight: 900;
  }
}
.members-state {
  flex: 1;
  font-size: 24rpx;
  color: $text-secondary;
  margin-left: 8rpx;
}

/* ---------- 备注 ---------- */
.desc-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 32rpx;
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

.end-pad { height: 160rpx; }

/* ---------- 底部 ---------- */
.bottom-bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  padding: 20rpx 32rpx;
}
.ghost-btn {
  height: 96rpx;
  padding: 0 32rpx;
  border-radius: 48rpx;
  background: $bg-page;
  display: flex;
  align-items: center;

  &:active { transform: scale(.97); }

  .ghost-btn-text {
    font-size: 26rpx;
    color: $text-primary;
    font-weight: 800;
  }
}
.join-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  background: $primary;
  box-shadow: 0 8rpx 24rpx rgba(45, 143, 135, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: scale(.98); }
  &.disabled { background: $border-base; box-shadow: none; }

  .join-btn-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 900;
  }
}
</style>
