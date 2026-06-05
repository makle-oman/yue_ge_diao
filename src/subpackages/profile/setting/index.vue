<template>
  <view class="profile-setting">
    <mxy-form-nav title="设置与资料" action-text="保存" :action-disabled="saving" @action="onSave" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <view class="avatar-area">
          <view class="avatar-wrap" @click="onPickAvatar">
            <mxy-avatar :src="form.avatar" :size="128" />
            <view class="camera-badge">
              <mxy-icon name="add_a_photo" :size="28" color="#fff" />
            </view>
          </view>
          <text class="avatar-tip">点击更换头像</text>
        </view>

        <view class="section-card">
          <view class="section-title">
            <mxy-icon name="person" :size="30" color="#2D8F87" />
            <text>基础信息</text>
          </view>

          <text class="field-label">昵称</text>
          <view class="text-field">
            <input
              v-model="form.name"
              class="field-input"
              maxlength="32"
              placeholder="请输入昵称"
              placeholder-class="input-placeholder"
            />
          </view>

          <text class="field-label">性别</text>
          <view class="segment-row">
            <view
              v-for="item in genderOptions"
              :key="item.value"
              class="segment"
              :class="{ active: form.gender === item.value }"
              @click="form.gender = item.value"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>

          <text class="field-label">所在地</text>
          <view class="text-field">
            <input
              v-model="form.city"
              class="field-input"
              maxlength="32"
              placeholder="请输入所在地"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">
            <mxy-icon name="phishing" :size="30" color="#2D8F87" />
            <text>钓鱼资历</text>
          </view>

          <text class="field-label">钓龄</text>
          <view class="chip-row compact">
            <view
              v-for="item in ageOptions"
              :key="item"
              class="chip"
              :class="{ active: form.age === item }"
              @click="form.age = item"
            >
              <text>{{ item }}</text>
            </view>
          </view>

          <text class="field-label">主玩方式 (可多选)</text>
          <view class="chip-row">
            <view
              v-for="item in playOptions"
              :key="item"
              class="chip play"
              :class="{ active: form.play.includes(item) }"
              @click="togglePlay(item)"
            >
              <mxy-icon v-if="form.play.includes(item)" name="check" :size="22" color="#fff" />
              <text>{{ item }}</text>
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
      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" :class="{ disabled: saving }" @click="onSave">
        <text class="submit-btn-text">{{ saving ? '保存中...' : '保存设置' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import { uploadImage } from '@/utils/upload';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import {
  updateMe,
  FISHING_AGE_BAND_LABEL,
  FISHING_AGE_BAND_CODE,
  type MeProfile,
  type UpdateMePayload,
} from '@/api/users';
import { useAuthStore } from '@/stores/auth';

const { safeBottom } = useSystemInfo();
const authStore = useAuthStore();

const ageOptions = ['1年内', '1-3年', '3-5年', '5年以上'] as const;
const playOptions = ['野钓', '路亚', '黑坑', '海钓', '冰钓'] as const;
const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
] as const;

type AgeLabel = (typeof ageOptions)[number];
type GenderValue = 0 | (typeof genderOptions)[number]['value'];

const form = ref({
  avatar: '',
  name: '',
  gender: 0 as GenderValue,
  age: '' as '' | AgeLabel,
  play: [] as string[],
  city: '',
});

const saving = ref(false);
const uploading = ref(false);
const privacy = ref({
  visible: true,
  publicSpot: false,
});

function applyProfile(me: MeProfile) {
  form.value.avatar = me.avatar || '';
  form.value.name = me.nickname || `钓友${String(me.id).slice(-4)}`;
  form.value.gender = me.gender === 1 || me.gender === 2 ? me.gender : 0;
  form.value.age = me.fishingAgeBand
    ? (FISHING_AGE_BAND_LABEL[me.fishingAgeBand] as AgeLabel)
    : '';
  form.value.play = Array.isArray(me.playStyles) ? [...me.playStyles] : [];
  form.value.city = me.city || '';
  privacy.value.visible = me.allowNearby;
  privacy.value.publicSpot = me.allowShowLoc;
}

onMounted(async () => {
  const me = authStore.profile || await authStore.refreshMe();
  if (me) applyProfile(me);
});

const togglePlay = (item: string) => {
  const idx = form.value.play.indexOf(item);
  if (idx >= 0) form.value.play.splice(idx, 1);
  else form.value.play.push(item);
};

const onPickAvatar = () => {
  if (uploading.value) return;
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const path = res.tempFilePaths?.[0];
      if (!path) return;
      uploading.value = true;
      uni.showLoading({ title: '上传中...' });
      try {
        const uploaded = await uploadImage(path);
        form.value.avatar = uploaded.url;
        uni.showToast({ title: '头像已上传', icon: 'success' });
      } finally {
        uploading.value = false;
        uni.hideLoading();
      }
    },
  });
};

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

const onSave = async () => {
  if (saving.value) return;
  const name = form.value.name.trim();
  if (!name) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }
  saving.value = true;
  try {
    const payload: UpdateMePayload = {
      nickname: name,
      avatar: form.value.avatar,
      gender: form.value.gender,
      city: form.value.city.trim(),
      playStyles: form.value.play,
      allowNearby: privacy.value.visible,
      allowShowLoc: privacy.value.publicSpot,
    };
    if (form.value.age) {
      payload.fishingAgeBand = FISHING_AGE_BAND_CODE[form.value.age];
    }
    const updated = await updateMe(payload);
    authStore.patchProfile(updated);
    uni.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
  } catch (e: unknown) {
    const msg = typeof e === 'object' && e && 'msg' in e
      ? String((e as { msg?: unknown }).msg || '')
      : '';
    uni.showToast({ title: msg || '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
