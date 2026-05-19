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
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const { safeBottom } = useSystemInfo();

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

<style lang="scss" scoped src="./edit.scss"></style>
