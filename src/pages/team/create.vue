<template>
  <view class="team-create">
    <mxy-form-nav title="发起组队" action-text="发布" @action="onSubmit" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 钓点 -->
        <view class="spot-card" @click="onPickSpot">
          <view class="spot-icon">
            <mxy-icon name="location_on" :size="40" color="#2D8F87" />
          </view>
          <view class="spot-text">
            <text class="spot-main">钓点</text>
            <text class="spot-sub">{{ form.spot }} · 可从地图选择</text>
          </view>
          <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
        </view>

        <!-- 字段卡 -->
        <view class="card">
          <view class="row" @click="onPickTime">
            <text class="row-label">时间</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.time }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickFish">
            <text class="row-label">目标鱼种</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.fish.join(' / ') }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row">
            <text class="row-label">人数限制</text>
            <view class="stepper">
              <view class="step-btn" @click="onStep(-1)">
                <text class="step-btn-text muted">−</text>
              </view>
              <text class="step-num">{{ form.max }}</text>
              <view class="step-btn" @click="onStep(1)">
                <text class="step-btn-text primary">+</text>
              </view>
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickCost">
            <text class="row-label">费用方式</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.cost }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row">
            <text class="row-label">需要拼车</text>
            <view class="switch" :class="{ on: form.carpool }" @click="form.carpool = !form.carpool">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="note-card">
          <text class="note-title">备注</text>
          <textarea
            class="note-input"
            v-model="form.note"
            placeholder="补充说明（早到时间 / 装备 / 拉群方式 等）"
            placeholder-style="color:#99A5AD"
            maxlength="200"
            auto-height
          />
        </view>

        <!-- 政策提醒 -->
        <view class="policy-card">
          <mxy-icon name="warning" :size="32" color="#F5A623" />
          <text class="policy-text">发布后公开到附近列表；爽约可被发起人标记并影响排序。</text>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" @click="onSubmit">
        <text class="submit-btn-text">发布组队</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const safeBottom = ref(0);
try {
  const info = uni.getSystemInfoSync();
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
} catch (_e) { /* ignore */ }

const form = ref({
  spot: '燕子矶江边',
  time: '05月25日 05:30-11:00',
  fish: ['鲫鱼', '鲤鱼'],
  max: 6,
  cost: 'AA',
  carpool: true,
  note: '早口窗口短，建议 5 点前到。带抄网，岸边湿滑。',
});

const onPickSpot = () => uni.showToast({ title: '选择钓点 (待开发)', icon: 'none' });
const onPickTime = () => uni.showToast({ title: '选择时间 (待开发)', icon: 'none' });
const onPickFish = () => uni.showToast({ title: '选择鱼种 (待开发)', icon: 'none' });
const onPickCost = () => uni.showActionSheet({
  itemList: ['AA', '发起人请客', '各自承担'],
  success: (r) => { form.value.cost = ['AA', '发起人请客', '各自承担'][r.tapIndex]; },
});
const onStep = (delta: number) => {
  const next = form.value.max + delta;
  if (next < 2) {
    uni.showToast({ title: '至少 2 人', icon: 'none' });
    return;
  }
  if (next > 20) {
    uni.showToast({ title: '最多 20 人', icon: 'none' });
    return;
  }
  form.value.max = next;
};
const onSubmit = () => {
  if (!form.value.spot.trim()) {
    uni.showToast({ title: '请选择钓点', icon: 'none' });
    return;
  }
  if (form.value.fish.length === 0) {
    uni.showToast({ title: '请选择目标鱼种', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已发布组队', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.team-create {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.content {
  flex: 1;
  min-height: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 32rpx;
}

/* ---------- 钓点卡 ---------- */
.spot-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  &:active { background: $bg-hover; }
}
.spot-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $soft-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.spot-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .spot-main {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .spot-sub {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

/* ---------- 字段卡 ---------- */
.card {
  background: $bg-card;
  border-radius: 32rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 116rpx;
  padding: 0 32rpx;
  gap: 16rpx;

  .row-label {
    font-size: 28rpx;
    font-weight: 900;
    color: $text-primary;
    flex-shrink: 0;
  }
  .row-value {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
  .row-value-text {
    font-size: 26rpx;
    color: $text-primary;

    &.accent { color: $primary; font-weight: 800; }
  }
  &:active { background: $bg-hover; }
}
.divider {
  height: 1rpx;
  background: $border-light;
  margin: 0 32rpx;
}

/* ---------- Stepper ---------- */
.stepper {
  height: 64rpx;
  padding: 0 20rpx;
  border-radius: 32rpx;
  background: $bg-page;
  display: flex;
  align-items: center;
  gap: 28rpx;
}
.step-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { opacity: .6; }

  .step-btn-text {
    font-size: 36rpx;
    line-height: 1;
    font-weight: 900;

    &.muted   { color: $text-secondary; }
    &.primary { color: $primary; }
  }
}
.step-num {
  min-width: 36rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 900;
  color: $text-primary;
}

/* ---------- Switch ---------- */
.switch {
  width: 88rpx;
  height: 52rpx;
  border-radius: 26rpx;
  background: $border-base;
  position: relative;
  transition: background .2s;
  flex-shrink: 0;

  &.on {
    background: $primary;

    .switch-dot { transform: translateX(36rpx); }
  }
}
.switch-dot {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
  transition: transform .2s;
}

/* ---------- 备注 ---------- */
.note-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.note-title {
  font-size: 30rpx;
  font-weight: 900;
  color: $text-primary;
}
.note-input {
  width: 100%;
  min-height: 140rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: $bg-page;
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.5;
  box-sizing: border-box;
}

/* ---------- 政策提醒 ---------- */
.policy-card {
  background: $soft-orange;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  align-items: flex-start;
  gap: 20rpx;

  .policy-text {
    flex: 1;
    font-size: 24rpx;
    color: $text-primary;
    line-height: 1.5;
  }
}

.end-pad { height: 32rpx; }

/* ---------- 底部 ---------- */
.bottom-bar {
  flex: none;
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  padding: 20rpx 32rpx;
}
.submit-btn {
  height: 104rpx;
  border-radius: 52rpx;
  background: $primary;
  box-shadow: 0 8rpx 24rpx rgba(45, 143, 135, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: scale(.98); }

  .submit-btn-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 900;
  }
}
</style>
