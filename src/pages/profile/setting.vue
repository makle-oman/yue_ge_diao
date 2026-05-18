<template>
  <view class="profile-setting">
    <mxy-form-nav title="设置与资料" action-text="保存" @action="onSave" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <view class="profile-card" @click="onEditProfile">
          <view class="avatar-wrap">
            <mxy-avatar :src="profile.avatar" :size="112" />
          </view>
          <view class="profile-text">
            <text class="profile-name">{{ profile.name }}</text>
            <text class="profile-sub">头像、昵称、钓龄和玩法标签</text>
          </view>
          <text class="edit-link">编辑</text>
        </view>

        <view class="card">
          <view class="row" @click="onPickField('age')">
            <text class="row-label">钓龄</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ profile.age }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickField('style')">
            <text class="row-label">主玩方式</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ profile.style.join(' / ') }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickField('city')">
            <text class="row-label">常驻城市</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ profile.city }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickField('signature')">
            <text class="row-label">个性签名</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ profile.signature }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
        </view>

        <view class="card">
          <text class="card-title">隐私设置</text>
          <view class="privacy-row">
            <view class="privacy-text">
              <text class="privacy-main">允许被附近钓友看到</text>
              <text class="privacy-sub">关闭后不会出现在附近钓友列表</text>
            </view>
            <view class="switch" :class="{ on: privacy.visible }" @click="privacy.visible = !privacy.visible">
              <view class="switch-dot" />
            </view>
          </view>
          <view class="divider" />
          <view class="privacy-row">
            <view class="privacy-text">
              <text class="privacy-main">默认公开鱼获位置</text>
              <text class="privacy-sub">每次发布仍可单独调整</text>
            </view>
            <view class="switch" :class="{ on: privacy.publicSpot }" @click="privacy.publicSpot = !privacy.publicSpot">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

        <view class="card">
          <view class="op-row" @click="onSubscription">
            <text class="op-label">消息订阅</text>
            <view class="op-value">
              <text class="op-value-text">已开启</text>
              <mxy-icon name="chevron_right" :size="28" color="#99A5AD" />
            </view>
          </view>
          <view class="divider" />
          <view class="op-row" @click="onHelp">
            <text class="op-label">帮助与反馈</text>
            <mxy-icon name="chevron_right" :size="28" color="#99A5AD" />
          </view>
          <view class="divider" />
          <view class="op-row" @click="onDelete">
            <text class="op-label danger">删除我的所有数据</text>
            <mxy-icon name="chevron_right" :size="28" color="#FF6B6B" />
          </view>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" @click="onSave">
        <text class="submit-btn-text">保存设置</text>
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

const profile = ref({
  avatar: '',
  name: '老王钓鱼',
  age: '5年以上',
  style: ['野钓', '路亚'],
  city: '南京',
  signature: '愿者上钩',
});

const privacy = ref({
  visible: true,
  publicSpot: false,
});

const onEditProfile = () => uni.navigateTo({ url: '/pages/profile/edit' });
const onPickField = (k: string) => uni.showToast({ title: `编辑 ${k} (待开发)`, icon: 'none' });
const onSubscription = () => uni.showToast({ title: '消息订阅设置 (待开发)', icon: 'none' });
const onHelp = () => uni.showToast({ title: '帮助与反馈 (待开发)', icon: 'none' });
const onDelete = () => uni.showModal({
  title: '删除所有数据',
  content: '此操作不可恢复，确认继续？',
  confirmText: '确认删除',
  confirmColor: '#FF6B6B',
  success: (r) => {
    if (r.confirm) uni.showToast({ title: '已提交删除请求', icon: 'success' });
  },
});
const onSave = () => {
  uni.showToast({ title: '已保存', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile-setting {
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

.profile-card {
  background: $bg-card;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);

  &:active { background: $bg-hover; }
}
.avatar-wrap {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: $soft-primary;
  border: 4rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.profile-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;

  .profile-name {
    font-size: 32rpx;
    color: $text-primary;
    font-weight: 900;
  }
  .profile-sub {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
.edit-link {
  font-size: 26rpx;
  color: $primary;
  font-weight: 900;
}

.card {
  background: $bg-card;
  border-radius: 32rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 108rpx;
  padding: 0 32rpx;

  .row-label {
    font-size: 28rpx;
    font-weight: 900;
    color: $text-primary;
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

.card-title {
  font-size: 30rpx;
  font-weight: 900;
  color: $text-primary;
  padding: 24rpx 32rpx 12rpx;
}
.privacy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx 32rpx;
}
.privacy-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;

  .privacy-main {
    font-size: 26rpx;
    font-weight: 800;
    color: $text-primary;
  }
  .privacy-sub {
    font-size: 22rpx;
    color: $text-secondary;
  }
}

.op-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  padding: 0 32rpx;

  &:active { background: $bg-hover; }

  .op-label {
    font-size: 26rpx;
    color: $text-primary;
    font-weight: 800;

    &.danger { color: $warning-strong; }
  }
  .op-value {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
  .op-value-text {
    font-size: 24rpx;
    color: $text-secondary;
  }
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
