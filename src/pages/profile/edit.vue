<template>
  <view class="profile-edit">
    <mxy-form-nav title="完善资料" left-text="稍后" @action="onSave" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <view class="intro-card">
          <view class="avatar-wrap">
            <mxy-avatar :src="form.avatar" :size="96" />
          </view>
          <view class="intro-text">
            <text class="intro-hello">{{ form.name }}</text>
            <text class="intro-sub">再补 {{ remaining }} 项资料，就能发布鱼获和钓点。</text>
          </view>
        </view>

        <view class="progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPct + '%' }" />
          </view>
          <text class="progress-text">{{ filled }}/{{ totalFields }}</text>
        </view>

        <view class="card pad">
          <text class="card-title">钓龄</text>
          <view class="seg-row">
            <view
              v-for="opt in ageOptions"
              :key="opt"
              class="seg"
              :class="{ active: form.age === opt }"
              @click="form.age = opt"
            >
              <text>{{ opt }}</text>
            </view>
          </view>
        </view>

        <view class="card pad">
          <text class="card-title">主玩方式（可多选）</text>
          <view class="chip-wrap">
            <view
              v-for="p in playOptions"
              :key="p"
              class="play-chip"
              :class="{ active: form.play.includes(p) }"
              @click="togglePlay(p)"
            >
              <mxy-icon v-if="form.play.includes(p)" name="check" :size="24" color="#fff" />
              <text>{{ p }}</text>
            </view>
          </view>
        </view>

        <view class="city-card" @click="onPickCity">
          <view class="city-icon">
            <mxy-icon name="location_on" :size="32" color="#5BA9C4" />
          </view>
          <view class="city-text">
            <text class="city-main">常驻城市</text>
            <text class="city-sub">{{ form.city }} · 已根据定位填写</text>
          </view>
          <text class="city-edit">修改</text>
        </view>

        <view class="card">
          <view class="privacy-row">
            <text class="privacy-main">允许附近钓友看到我</text>
            <view class="switch" :class="{ on: form.visible }" @click="form.visible = !form.visible">
              <view class="switch-dot" />
            </view>
          </view>
          <view class="divider" />
          <view class="privacy-row">
            <text class="privacy-main">默认公开鱼获位置</text>
            <view class="switch" :class="{ on: form.publicSpot }" @click="form.publicSpot = !form.publicSpot">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" @click="onSave">
        <text class="submit-btn-text">保存并进入约个钓</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const safeBottom = ref(0);
try {
  const info = uni.getSystemInfoSync();
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
} catch (_e) { /* ignore */ }

const ageOptions = ['1年内', '1-3年', '3-5年', '5年以上'];
const playOptions = ['野钓', '路亚', '黑坑', '海钓', '冰钓'];

const form = ref({
  avatar: '',
  name: '老王钓鱼',
  age: '3-5年',
  play: ['野钓', '路亚'] as string[],
  city: '南京',
  visible: true,
  publicSpot: false,
});

const togglePlay = (p: string) => {
  const idx = form.value.play.indexOf(p);
  if (idx >= 0) form.value.play.splice(idx, 1);
  else form.value.play.push(p);
};

const totalFields = 3;
const filled = computed(() => {
  let n = 0;
  if (form.value.age) n += 1;
  if (form.value.play.length > 0) n += 1;
  if (form.value.city) n += 1;
  return n;
});
const remaining = computed(() => Math.max(0, totalFields - filled.value));
const progressPct = computed(() => Math.round((filled.value / totalFields) * 100));

const onPickCity = () => uni.showToast({ title: '修改城市 (待开发)', icon: 'none' });
const onSave = () => {
  if (remaining.value > 0) {
    uni.showToast({ title: `还有 ${remaining.value} 项必填`, icon: 'none' });
    return;
  }
  uni.showToast({ title: '已保存', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile-edit {
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
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.intro-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
}
.avatar-wrap {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: $soft-primary;
  border: 4rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.intro-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .intro-hello {
    font-size: 32rpx;
    color: $text-primary;
    font-weight: 900;
  }
  .intro-sub {
    font-size: 22rpx;
    color: $text-secondary;
    line-height: 1.4;
  }
}

.progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 4rpx;
}
.progress-bar {
  flex: 1;
  height: 16rpx;
  border-radius: 8rpx;
  background: $border-light;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: $primary;
  transition: width .3s ease;
}
.progress-text {
  font-size: 24rpx;
  font-weight: 800;
  color: $primary;
}

.card {
  background: $bg-card;
  border-radius: 32rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  &.pad {
    padding: 28rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
}
.card-title {
  font-size: 30rpx;
  font-weight: 900;
  color: $text-primary;
}

.seg-row {
  display: flex;
  gap: 16rpx;
}
.seg {
  flex: 1;
  height: 76rpx;
  border-radius: 28rpx;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 24rpx;
    color: $text-secondary;
  }
  &.active {
    background: $primary;
    text { color: #fff; font-weight: 900; }
  }
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.play-chip {
  height: 68rpx;
  padding: 0 28rpx;
  border-radius: 34rpx;
  background: $bg-page;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;

  text {
    font-size: 26rpx;
    color: $text-secondary;
  }
  &.active {
    background: $primary;
    text { color: #fff; font-weight: 900; }
  }
}

.city-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  &:active { background: $bg-hover; }
}
.city-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $soft-blue;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.city-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .city-main {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .city-sub {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.city-edit {
  font-size: 26rpx;
  color: $primary;
  font-weight: 800;
}

.privacy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104rpx;
  padding: 0 32rpx;
  gap: 16rpx;

  .privacy-main {
    font-size: 26rpx;
    color: $text-primary;
    font-weight: 800;
  }
}
.divider {
  height: 1rpx;
  background: $border-light;
  margin: 0 32rpx;
}

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

.end-pad { height: 32rpx; }

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
