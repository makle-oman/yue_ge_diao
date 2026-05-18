<template>
  <view class="team-list">
    <!-- 顶栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">组队约钓</text>
        <view class="create-btn" @click="onCreate">
          <mxy-icon name="add" :size="32" color="#fff" />
          <text class="create-btn-text">发起组队</text>
        </view>
      </view>
      <view class="chips">
        <view
          v-for="c in filters"
          :key="c.key"
          class="chip"
          :class="{ active: activeFilter === c.key }"
          @click="activeFilter = c.key"
        >
          <text>{{ c.label }}</text>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view class="content" scroll-y>
      <view class="cards">
        <view
          v-for="t in teams"
          :key="t.id"
          class="card"
          @click="onOpen(t)"
        >
          <view class="card-head">
            <text class="card-title">{{ t.title }}</text>
            <view class="status-tag" :class="`tag--${t.statusTone}`">
              <text>{{ t.statusText }}</text>
            </view>
          </view>
          <text class="card-meta">{{ t.meta }}</text>
          <view class="card-people">
            <view
              v-for="(tone, idx) in t.avatars"
              :key="idx"
              class="avatar-dot"
              :class="`tone-${tone}`"
            />
            <text class="card-people-text">{{ t.peopleSummary }}</text>
          </view>
          <view class="card-foot">
            <text class="owner-text">发起人：{{ t.owner }}</text>
            <view
              class="join-btn"
              :class="t.btnTone === 'ghost' ? 'ghost' : 'primary'"
              @click.stop="onJoin(t)"
            >
              <text>{{ t.btnText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="end-pad" />
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

const filters = [
  { key: 'nearby', label: '附近' },
  { key: 'weekend', label: '本周末' },
  { key: 'carpool', label: '可拼车' },
];
const activeFilter = ref('nearby');

type Tone = 'primary' | 'blue' | 'orange';
type StatusTone = 'primary' | 'accent' | 'muted';

interface Team {
  id: string;
  title: string;
  meta: string;
  statusText: string;
  statusTone: StatusTone;
  avatars: Tone[];
  peopleSummary: string;
  owner: string;
  btnText: string;
  btnTone: 'primary' | 'ghost';
}

const teams = ref<Team[]>([
  {
    id: 't1',
    title: '周六清晨 · 燕子矶江边',
    meta: '05月25日 05:30-11:00 · 2.3km · 目标鲫鱼/鲤鱼',
    statusText: '招募中',
    statusTone: 'primary',
    avatars: ['primary', 'blue', 'orange'],
    peopleSummary: '已报名 3/6 · AA · 需要拼车',
    owner: '老周野钓',
    btnText: '报名',
    btnTone: 'primary',
  },
  {
    id: 't2',
    title: '今晚夜钓 · 秦淮河外湾',
    meta: '今天 20:00-02:00 · 6.8km · 主攻鲤鱼',
    statusText: '剩1位',
    statusTone: 'accent',
    avatars: ['primary', 'blue', 'orange'],
    peopleSummary: '已报名 5/6 · 各自承担 · 不拼车',
    owner: '钓鱼阿强',
    btnText: '报名',
    btnTone: 'primary',
  },
  {
    id: 't3',
    title: '路亚晨口 · 江心洲北汊',
    meta: '05月26日 05:00-09:00 · 4.5km · 翘嘴/鲈鱼',
    statusText: '已满员',
    statusTone: 'muted',
    avatars: ['blue', 'primary', 'orange'],
    peopleSummary: '已报名 4/4 · AA · 可旁观',
    owner: '阿峰路亚',
    btnText: '查看',
    btnTone: 'ghost',
  },
]);

const onCreate = () => uni.navigateTo({ url: '/pages/team/create' });
const onOpen = (t: Team) => uni.navigateTo({ url: `/pages/team/detail?id=${t.id}` });
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onJoin = (t: Team) => {
  if (t.btnTone === 'ghost') {
    onOpen(t);
    return;
  }
  uni.showToast({ title: `已申请加入「${t.title}」`, icon: 'success' });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.team-list {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

/* ---------- 顶栏 ---------- */
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
.nav-back {
  width: 60rpx;
  height: 60rpx;
  margin-left: -12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active { opacity: .6; }
}
.nav-title {
  flex: 1;
  font-size: 44rpx;
  font-weight: 900;
  color: $text-primary;
}
.create-btn {
  height: 64rpx;
  padding: 0 22rpx;
  border-radius: 32rpx;
  background: $primary;
  display: flex;
  align-items: center;
  gap: 8rpx;

  &:active { opacity: .88; }

  .create-btn-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 900;
  }
}
.chips {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
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

/* ---------- 列表 ---------- */
.content {
  flex: 1;
  min-height: 0;
}
.cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 32rpx;
}

.card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  box-shadow: 0 6rpx 24rpx rgba(26, 43, 51, 0.08);

  &:active { transform: scale(.99); }
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.card-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 900;
  color: $text-primary;
}
.status-tag {
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 20rpx;
    font-weight: 900;
    line-height: 1;
  }
  &.tag--primary { background: $soft-primary; text { color: $primary; } }
  &.tag--accent  { background: $soft-orange;  text { color: $accent;  } }
  &.tag--muted   { background: $border-light; text { color: $text-secondary; } }
}
.card-meta {
  font-size: 24rpx;
  color: $text-secondary;
}
.card-people {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.avatar-dot {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  flex-shrink: 0;

  &.tone-primary { background: $soft-primary; }
  &.tone-blue    { background: $soft-blue; }
  &.tone-orange  { background: $soft-orange; }
}
.card-people-text {
  flex: 1;
  font-size: 24rpx;
  color: $text-primary;
  font-weight: 700;
  margin-left: 8rpx;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4rpx;
}
.owner-text {
  font-size: 24rpx;
  color: $text-secondary;
}
.join-btn {
  height: 60rpx;
  padding: 0 28rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active { transform: scale(.96); }

  text {
    font-size: 24rpx;
    font-weight: 900;
  }
  &.primary { background: $primary; text { color: #fff; } }
  &.ghost   { background: $bg-page; text { color: $text-primary; } }
}

.end-pad { height: 48rpx; }
</style>
