<template>
  <view class="profile-edit">
    <mxy-form-nav title="完善资料" left-text="稍后" @action="onSave" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <view class="intro-card">
          <view class="avatar-wrap" @click="onPickAvatar">
            <mxy-avatar :src="form.avatar" :size="96" />
            <view class="avatar-mask">
              <mxy-icon name="add_a_photo" :size="28" color="#fff" />
            </view>
          </view>
          <view class="intro-text">
            <text class="intro-hello">{{ form.name }}</text>
            <text class="intro-sub">头像、昵称、城市和玩法会展示在个人主页。</text>
          </view>
        </view>

        <view class="progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPct + '%' }" />
          </view>
          <text class="progress-text">{{ filled }}/{{ totalFields }}</text>
        </view>

        <view class="card pad">
          <text class="card-title">昵称</text>
          <view class="input-row">
            <mxy-icon name="person" :size="30" color="#6F7E86" />
            <input
              v-model="form.name"
              class="form-input"
              maxlength="32"
              placeholder="请输入昵称"
              placeholder-class="input-placeholder"
            />
          </view>
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
            <text class="city-sub">{{ form.city || '未填写' }} · 点击修改</text>
          </view>
          <text class="city-edit">修改</text>
        </view>

        <view class="card">
          <view class="privacy-row">
            <text class="privacy-main">允许附近钓友看到我</text>
            <view class="switch" :class="{ on: form.allowNearby }" @click="form.allowNearby = !form.allowNearby">
              <view class="switch-dot" />
            </view>
          </view>
          <view class="divider" />
          <view class="privacy-row">
            <text class="privacy-main">默认公开鱼获位置</text>
            <view class="switch" :class="{ on: form.allowShowLoc }" @click="form.allowShowLoc = !form.allowShowLoc">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" :class="{ disabled: saving }" @click="onSave">
        <text class="submit-btn-text">{{ saving ? '保存中…' : '保存并进入约个钓' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import { uploadImage } from '@/utils/upload';
import {
  updateMe,
  FISHING_AGE_BAND_LABEL,
  FISHING_AGE_BAND_CODE,
  type FishingAgeBand,
  type UpdateMePayload,
  type MeProfile,
} from '@/api/users';
import { useAuthStore } from '@/stores';

const { safeBottom } = useSystemInfo();
const authStore = useAuthStore();

const ageOptions = ['1年内', '1-3年', '3-5年', '5年以上'] as const;
const playOptions = ['野钓', '路亚', '黑坑', '海钓', '冰钓'] as const;
const cityOptions = ['南京', '上海', '杭州', '苏州', '北京', '广州', '深圳', '成都', '武汉', '重庆'];

const form = ref({
  avatar: '',
  name: '',
  age: '' as '' | (typeof ageOptions)[number],
  play: [] as string[],
  city: '',
  allowNearby: true,
  allowShowLoc: false,
});

const saving = ref(false);
const uploading = ref(false);

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

function fillFormFromProfile(me: MeProfile) {
  form.value.avatar = me.avatar || '';
  form.value.name = me.nickname || `钓友${String(me.id).slice(-4)}`;
  form.value.age = me.fishingAgeBand
    ? (FISHING_AGE_BAND_LABEL[me.fishingAgeBand] as (typeof ageOptions)[number])
    : '';
  form.value.play = Array.isArray(me.playStyles) ? [...me.playStyles] : [];
  form.value.city = me.city || '';
  form.value.allowNearby = me.allowNearby;
  form.value.allowShowLoc = me.allowShowLoc;
}

async function loadMe() {
  if (!authStore.isLoggedIn) return;
  // 优先用 store 里已有的 profile,避免重复 /users/me 请求
  if (authStore.profile) {
    fillFormFromProfile(authStore.profile);
    return;
  }
  const me = await authStore.refreshMe();
  if (me) fillFormFromProfile(me);
}

onLoad(() => {
  loadMe();
});

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
      let avatarUploaded = false;
      try {
        const uploaded = await uploadImage(path);
        form.value.avatar = uploaded.url;
        avatarUploaded = true;
      } catch (e) {
        console.warn('[profile-edit] upload avatar failed', e);
      } finally {
        uploading.value = false;
        uni.hideLoading();
        if (avatarUploaded) uni.showToast({ title: '头像已上传', icon: 'success' });
      }
    },
  });
};

const onPickCity = () => uni.showActionSheet({
  itemList: cityOptions,
  success: ({ tapIndex }) => {
    form.value.city = cityOptions[tapIndex] || form.value.city;
  },
});

const onSave = async () => {
  if (saving.value) return;
  const name = form.value.name.trim();
  if (!name) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }
  if (remaining.value > 0) {
    uni.showToast({ title: `还有 ${remaining.value} 项必填`, icon: 'none' });
    return;
  }
  saving.value = true;
  try {
    const payload: UpdateMePayload = {
      nickname: name,
      avatar: form.value.avatar,
      city: form.value.city,
      playStyles: form.value.play,
      allowNearby: form.value.allowNearby,
      allowShowLoc: form.value.allowShowLoc,
    };
    if (form.value.age) {
      const code = FISHING_AGE_BAND_CODE[form.value.age];
      if (code) payload.fishingAgeBand = code as FishingAgeBand;
    }
    const updated = await updateMe(payload);
    // store 局部更新,profile 页 computed 自动响应,不用 onShow 重拉
    authStore.patchProfile(updated);
    uni.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
  } catch (e) {
    // request.ts 已弹过 Toast,这里只兜底打日志
    console.warn('[profile-edit] updateMe failed', e);
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
