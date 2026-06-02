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
        <text class="welcome-title">手机号登录</text>
        <text class="welcome-sub">手机号会作为后台识别账号，微信端可用快速登录。</text>
      </view>

      <view class="auth-tabs">
        <view class="auth-tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">
          <text>登录</text>
        </view>
        <view class="auth-tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">
          <text>注册</text>
        </view>
      </view>

      <view class="auth-form">
        <view class="field">
          <text class="field-label">手机号</text>
          <view class="input-row">
            <mxy-icon name="call" :size="30" color="#6F7E86" />
            <input
              v-model="phone"
              class="form-input"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="field">
          <text class="field-label">密码</text>
          <view class="input-row">
            <mxy-icon name="lock" :size="30" color="#6F7E86" />
            <input
              v-model="password"
              class="form-input"
              :password="!passwordVisible"
              maxlength="32"
              placeholder="6-32 位密码"
              placeholder-class="input-placeholder"
            />
            <view class="password-toggle" @click="passwordVisible = !passwordVisible">
              <mxy-icon :name="passwordVisible ? 'visibility_off' : 'lock'" :size="30" color="#6F7E86" />
            </view>
          </view>
        </view>

        <view v-if="mode === 'register'" class="field">
          <text class="field-label">昵称</text>
          <view class="input-row">
            <mxy-icon name="person" :size="30" color="#6F7E86" />
            <input
              v-model="nickname"
              class="form-input"
              maxlength="32"
              placeholder="默认使用钓友 + 手机尾号"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="submit-btn" :class="{ disabled: submitting }" @click="onPasswordSubmit">
          <text class="submit-btn-text">{{ mode === 'login' ? '登录' : '注册并登录' }}</text>
        </view>
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view class="wx-btn" @click="onWxLogin">
        <mxy-icon name="chat" :size="32" color="#2D8F87" />
        <text class="wx-btn-text">微信快速登录</text>
      </view>
      <!-- #endif -->

      <view class="benefits">
        <view class="benefit">
          <mxy-icon name="check_circle" :size="28" color="#2D8F87" />
          <text class="benefit-text">手机号账号方便后台检索与管理</text>
        </view>
        <view class="benefit">
          <mxy-icon name="check_circle" :size="28" color="#2D8F87" />
          <text class="benefit-text">微信快速登录仅在微信小程序端展示</text>
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
import {
  passwordLogin,
  passwordRegister,
  wxLogin,
  type LoginResult,
} from '@/api/auth';
import { useAuthStore } from '@/stores';

const { statusBarHeight } = useSystemInfo();
const authStore = useAuthStore();

const mode = ref<'login' | 'register'>('login');
const phone = ref('');
const password = ref('');
const nickname = ref('');
const passwordVisible = ref(false);
const agreed = ref(false);
const submitting = ref(false);

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

const onPasswordSubmit = async () => {
  if (submitting.value) return;
  if (!ensureAgreed()) return;

  const p = phone.value.trim();
  const pw = password.value;
  if (!/^1[3-9]\d{9}$/.test(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' });
    return;
  }
  if (pw.length < 6 || pw.length > 32) {
    uni.showToast({ title: '密码需为 6-32 位', icon: 'none' });
    return;
  }

  submitting.value = true;
  uni.showLoading({ title: mode.value === 'login' ? '登录中...' : '注册中...' });
  try {
    const result = mode.value === 'login'
      ? await passwordLogin({ phone: p, password: pw })
      : await passwordRegister({
          phone: p,
          password: pw,
          nickname: nickname.value.trim() || undefined,
        });
    finishLogin(result);
  } catch (e) {
    uni.hideLoading();
    console.warn('[login] password auth failed', e);
  } finally {
    submitting.value = false;
  }
};

const onWxLogin = async () => {
  if (!ensureAgreed()) return;
  // #ifdef MP-WEIXIN
  await runWxLogin();
  return;
  // #endif
  uni.showToast({ title: '请使用手机号登录', icon: 'none' });
};

async function runWxLogin() {
  uni.showLoading({ title: '登录中...' });
  try {
    const loginRes = await new Promise<{ code?: string }>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve(res as { code?: string }),
        fail: reject,
      });
    });
    const code = loginRes.code?.trim();
    if (!code) throw new Error('微信登录凭证为空');
    finishLogin(await wxLogin({ code }));
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: '微信登录失败', icon: 'none' });
    console.warn('[login] wx-login failed', e);
  }
}

function finishLogin({ token, refreshToken, user }: LoginResult) {
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
}

const onPolicy = (k: 'user' | 'privacy') => {
  const title = k === 'user' ? '用户协议' : '隐私政策';
  uni.showToast({ title: `${title} (待开发)`, icon: 'none' });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
