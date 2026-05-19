<template>
  <view class="catch-create">
    <mxy-form-nav
      title="发布鱼获"
      left-text="取消"
      action-text="发布"
      @action="onPublish"
    />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 照片 -->
        <view class="card pad">
          <text class="card-title">鱼获照片(至少 1 张)</text>
          <view class="photo-row">
            <view
              v-for="(p, idx) in form.photos"
              :key="idx"
              class="photo-cell"
            >
              <image class="photo-img" :src="p" mode="aspectFill" />
              <view class="photo-del" @click="onDelPhoto(idx)">
                <mxy-icon name="close" :size="22" color="#fff" />
              </view>
            </view>
            <view v-if="form.photos.length < 9" class="photo-add" @click="onAddPhoto">
              <mxy-icon name="add_a_photo" :size="48" color="#6B7B85" />
            </view>
          </view>
        </view>

        <!-- 必填字段 -->
        <view class="card">
          <view class="row" @click="onPickFish">
            <text class="row-label">鱼种</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.fish.join('  ') || '请选择' }}  +</text>
            </view>
          </view>
          <view class="divider" />
          <view class="row weight-row">
            <text class="row-label">重量 / 长度</text>
            <view class="weight-inputs">
              <input
                class="weight-input"
                v-model="form.weight"
                placeholder="重量"
                placeholder-style="color:#99A5AD"
              />
              <text class="weight-sep">/</text>
              <input
                class="weight-input"
                v-model="form.length"
                placeholder="长度"
                placeholder-style="color:#99A5AD"
              />
            </view>
          </view>
          <view class="divider" />
          <view class="row select" @click="onPickSpot">
            <text class="row-label">关联钓点</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.spot }}</text>
              <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
            </view>
          </view>
          <view class="divider" />
          <view class="row select" @click="openMethodSheet">
            <text class="row-label">钓法</text>
            <view class="row-value">
              <text class="row-value-text">{{ form.method }}</text>
              <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
            </view>
          </view>
        </view>

        <!-- 描述 -->
        <view class="card pad">
          <text class="card-title">文字描述</text>
          <textarea
            class="desc-input"
            v-model="form.desc"
            placeholder="今天气压、漂相、钩饵线组、放流情况..."
            placeholder-style="color:#99A5AD"
            maxlength="500"
            auto-height
          />
        </view>

        <!-- 天气 -->
        <view class="weather-card">
          <view class="weather-icon">
            <mxy-icon name="cloud" :size="44" color="#5BA9C4" />
          </view>
          <view class="weather-text">
            <text class="weather-main">自动填充天气</text>
            <text class="weather-sub">{{ weather.text }}</text>
          </view>
          <view class="switch" :class="{ on: weather.auto }" @click="weather.auto = !weather.auto">
            <view class="switch-dot" />
          </view>
        </view>

        <!-- 隐私 -->
        <view class="card">
          <view class="row">
            <text class="row-label">公开钓点位置</text>
            <view class="switch" :class="{ on: form.publicSpot }" @click="form.publicSpot = !form.publicSpot">
              <view class="switch-dot" />
            </view>
          </view>
          <view class="divider" />
          <view class="row">
            <text class="row-label">允许评论</text>
            <view class="switch" :class="{ on: form.allowComment }" @click="form.allowComment = !form.allowComment">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>

    <!-- Design 35: 钓法选择浮层 -->
    <view v-if="methodSheetOpen" class="method-layer">
      <view class="method-scrim" @click="closeMethodSheet" />
      <view class="method-sheet" :style="{ paddingBottom: (safeBottom + 24) + 'px' }">
        <view class="ms-handle" />
        <view class="ms-head">
          <text class="ms-cancel" @click="closeMethodSheet">取消</text>
          <text class="ms-title">选择钓法</text>
          <text class="ms-done" @click="onMethodConfirm">确定</text>
        </view>

        <view class="ms-selected">
          <text class="ms-selected-text">当前选择：{{ pendingMethod }}</text>
          <mxy-icon name="check_circle" :size="44" color="#2D8F87" />
        </view>

        <view class="ms-options">
          <template v-for="(m, idx) in methodOptions" :key="m.name">
            <view
              class="ms-option"
              :class="{ selected: pendingMethod === m.name }"
              @click="onPickMethod(m)"
            >
              <text class="ms-option-text">{{ m.name }}</text>
              <mxy-icon
                v-if="m.isOther"
                name="chevron_right"
                :size="44"
                color="#6B7B85"
              />
              <mxy-icon
                v-else-if="pendingMethod === m.name"
                name="radio_button_checked"
                :size="44"
                color="#2D8F87"
              />
              <mxy-icon
                v-else
                name="radio_button_unchecked"
                :size="44"
                color="#6B7B85"
              />
            </view>
            <view v-if="idx < methodOptions.length - 1" class="ms-option-divider" />
          </template>
        </view>

        <view class="ms-note">
          <mxy-icon name="lightbulb" :size="40" color="#5BA9C4" />
          <text class="ms-note-text">同一套弹层可复用于饵料、隐私、天气、鱼情等选项</text>
        </view>
        <view class="ms-safe" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { safeBottom } = useSystemInfo();

interface MethodOption {
  name: string;
  isOther?: boolean;
}
const methodOptions: MethodOption[] = [
  { name: '台钓' },
  { name: '路亚' },
  { name: '矶钓' },
  { name: '海竿' },
  { name: '其他钓法', isOther: true },
];

const form = ref({
  photos: ['https://images.unsplash.com/photo-1770475746172-e96a7fc5d8de?w=300'],
  fish: ['鲫鱼', '鲤鱼'],
  weight: '1.2斤',
  length: '28cm',
  spot: '燕子矶江边',
  method: '台钓',
  desc: '今天气压回升,鱼口明显变好,早口半小时连上三条。',
  publicSpot: true,
  allowComment: true,
});

const weather = ref({
  auto: true,
  text: '多云 24℃ · 东风 3 级 · 气压稳定',
});

/* ---------- 钓法弹层 (Design 35) ---------- */
const methodSheetOpen = ref(false);
const pendingMethod = ref(form.value.method);

const openMethodSheet = () => {
  pendingMethod.value = form.value.method;
  methodSheetOpen.value = true;
};
const closeMethodSheet = () => { methodSheetOpen.value = false; };
const onPickMethod = (m: MethodOption) => {
  if (m.isOther) {
    uni.showModal({
      title: '输入钓法',
      placeholderText: '如 矶筏、滩钓',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) pendingMethod.value = res.content;
      },
    });
    return;
  }
  pendingMethod.value = m.name;
};
const onMethodConfirm = () => {
  form.value.method = pendingMethod.value;
  methodSheetOpen.value = false;
};

const onPickFish = () => uni.navigateTo({ url: '/subpackages/catch/fish-picker/index' });
const onPickSpot = () => uni.navigateTo({ url: '/subpackages/catch/spot-picker/index' });
const onAddPhoto = () => {
  uni.chooseImage({
    count: 9 - form.value.photos.length,
    success: (res) => { form.value.photos.push(...res.tempFilePaths); },
  });
};
const onDelPhoto = (idx: number) => form.value.photos.splice(idx, 1);
const onPublish = () => {
  if (form.value.photos.length === 0) {
    uni.showToast({ title: '至少上传 1 张照片', icon: 'none' });
    return;
  }
  if (form.value.fish.length === 0) {
    uni.showToast({ title: '请选择鱼种', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已发布', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
