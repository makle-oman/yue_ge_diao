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

      <!-- 开发期一键登录：仅 NODE_ENV !== 'production' 可见，方便联调 -->
      <view v-if="enableDevLogin" class="phone-btn" style="margin-top: 16rpx; background: #FFF4E1;" @click="onDevQuickLogin">
        <mxy-icon name="bug_report" :size="32" color="#B7791F" />
        <text class="phone-btn-text" style="color: #B7791F;">[开发] 随机账号登录</text>
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
import { useSystemInfo } from '@/utils/useSystemInfo';
import { devLogin } from '@/api/auth';
import { useAuthStore } from '@/stores';
import { env } from '@/config/env';

const { statusBarHeight } = useSystemInfo();
const authStore = useAuthStore();

const agreed = ref(false);
const enableDevLogin = env.enableDevLogin;

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

// 真·微信授权登录暂未接入；开发期复用 dev-login，便于在 H5 / 模拟器走通主流程
const onWxLogin = async () => {
  if (!ensureAgreed()) return;
  if (!enableDevLogin) {
    uni.showToast({ title: '微信授权登录 (待开发)', icon: 'none' });
    return;
  }
  await runDevLogin('wx_mock');
};

const onPhoneLogin = () => {
  if (!ensureAgreed()) return;
  uni.showToast({ title: '手机号登录 (待开发)', icon: 'none' });
};

const onDevQuickLogin = async () => {
  if (!ensureAgreed()) return;
  await runDevLogin(`dev_${Date.now()}`);
};

async function runDevLogin(openid: string) {
  uni.showLoading({ title: '登录中...' });
  try {
    const { token, refreshToken, user } = await devLogin({ openid });
    authStore.login(token, refreshToken, user);
    // 异步 fire-and-forget 把完整 profile 也拉一份(供 profile 页直接消费)
    authStore.refreshMe();
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/profile/index',
        fail: () => uni.redirectTo({ url: '/pages/profile/index' }),
      });
    }, 600);
  } catch (e) {
    uni.hideLoading();
    // request.ts 已经统一 Toast,这里仅打日志
    console.warn('[login] dev-login failed', e);
  }
}

const onPolicy = (k: 'user' | 'privacy') => {
  const title = k === 'user' ? '用户协议' : '隐私政策';
  uni.showToast({ title: `${title} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
