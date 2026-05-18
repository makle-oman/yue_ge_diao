<template>
  <view class="login">
    <!-- Hero -->
    <view class="hero">
      <image
        class="hero-img"
        src="https://images.unsplash.com/photo-1706652783711-fcb68bad9c9f?w=900"
        mode="aspectFill"
      />
      <view class="hero-shade" />
      <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="back-btn" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="brand">
          <mxy-icon name="phishing" :size="36" color="#fff" />
          <text class="brand-text">约个钓</text>
        </view>
      </view>
    </view>

    <!-- Panel -->
    <view class="panel">
      <view class="welcome">
        <text class="welcome-title">微信一键登录</text>
        <text class="welcome-sub">用于同步头像昵称，并在发布内容前完善钓鱼资料。</text>
      </view>

      <view class="wx-btn" @click="onWxLogin">
        <mxy-icon name="chat" :size="36" color="#fff" />
        <text class="wx-btn-text">微信授权登录</text>
      </view>

      <view class="phone-btn" @click="onPhoneLogin">
        <mxy-icon name="call" :size="32" color="#1A2B33" />
        <text class="phone-btn-text">手机号快捷登录</text>
      </view>

      <view class="benefits">
        <view class="benefit">
          <mxy-icon name="check_circle" :size="28" color="#2D8F87" />
          <text class="benefit-text">定位仅用于附近钓点和钓友推荐</text>
        </view>
        <view class="benefit">
          <mxy-icon name="check_circle" :size="28" color="#2D8F87" />
          <text class="benefit-text">鱼获位置可选择隐藏，保护秘密钓点</text>
        </view>
      </view>

      <view class="agreement" @click="agreed = !agreed">
        <view class="agree-box" :class="{ on: agreed }">
          <mxy-icon v-if="agreed" name="check" :size="22" color="#fff" />
        </view>
        <text class="agree-text">
          已阅读并同意
          <text class="agree-link" @click.stop="onPolicy('user')">《用户协议》</text>
          <text class="agree-link" @click.stop="onPolicy('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>
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

const agreed = ref(false);

const ensureAgreed = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
    return false;
  }
  return true;
};

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {
  uni.switchTab({ url: '/pages/index/index' });
});

const onWxLogin = () => {
  if (!ensureAgreed()) return;
  uni.showLoading({ title: '登录中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.redirectTo({ url: '/pages/profile/edit' }), 600);
  }, 800);
};

const onPhoneLogin = () => {
  if (!ensureAgreed()) return;
  uni.showToast({ title: '手机号登录 (待开发)', icon: 'none' });
};

const onPolicy = (k: 'user' | 'privacy') => {
  const title = k === 'user' ? '用户协议' : '隐私政策';
  uni.showToast({ title: `${title} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.login {
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
  height: 896rpx;
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
  background: linear-gradient(
    to bottom,
    rgba(18, 52, 45, 0.30) 0%,
    rgba(18, 52, 45, 0.55) 70%,
    rgba(18, 52, 45, 0.80) 100%
  );
}
.hero-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 16rpx 32rpx 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  z-index: 3;
}
.back-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10rpx;

  .brand-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 900;
    letter-spacing: 2rpx;
  }
}

/* ---------- Panel ---------- */
.panel {
  flex: 1;
  margin-top: -56rpx;
  background: $bg-page;
  border-radius: 56rpx 56rpx 0 0;
  padding: 56rpx 48rpx;
  display: flex;
  flex-direction: column;
  gap: 36rpx;
  position: relative;
  z-index: 4;
}

.welcome {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .welcome-title {
    font-size: 48rpx;
    color: $text-primary;
    font-weight: 900;
  }
  .welcome-sub {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.wx-btn {
  height: 104rpx;
  border-radius: 52rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(45, 143, 135, 0.32);

  &:active { transform: scale(.98); }

  .wx-btn-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 900;
  }
}

.phone-btn {
  height: 96rpx;
  border-radius: 48rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  &:active { transform: scale(.98); }

  .phone-btn-text {
    font-size: 30rpx;
    color: $text-primary;
    font-weight: 800;
  }
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 8rpx 0;
}
.benefit {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .benefit-text {
    flex: 1;
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.agreement {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 4rpx 0;

  &:active { opacity: .8; }
}
.agree-box {
  width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  border: 2rpx solid $border-base;
  background: $bg-card;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;

  &.on {
    background: $primary;
    border-color: $primary;
  }
}
.agree-text {
  flex: 1;
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;

  .agree-link {
    color: $primary;
    font-weight: 700;
  }
}
</style>
