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
          <view class="op-row" @click="onLogout">
            <text class="op-label">退出登录</text>
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

const onEditProfile = () => uni.navigateTo({ url: '/subpackages/profile/edit' });
const onPickField = (k: string) => uni.showToast({ title: `编辑 ${k} (待开发)`, icon: 'none' });
const onSubscription = () => uni.showToast({ title: '消息订阅设置 (待开发)', icon: 'none' });
const onHelp = () => uni.showToast({ title: '帮助与反馈 (待开发)', icon: 'none' });
const onLogout = () => uni.showModal({
  title: '退出登录',
  content: '退出后将返回登录页，是否继续？',
  confirmText: '退出',
  success: (r) => {
    if (r.confirm) uni.reLaunch({ url: '/pages/login/index' });
  },
});
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

<style lang="scss" scoped src="./setting.scss"></style>
