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
          <view class="row method-row">
            <text class="row-label">钓法</text>
            <view class="method-chips">
              <view
                v-for="m in methods"
                :key="m"
                class="method-chip"
                :class="{ active: form.method === m }"
                @click="form.method = m"
              >
                <text>{{ m }}</text>
              </view>
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
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const methods = ['手竿', '路亚', '海钓', '抛竿'];

const form = ref({
  photos: ['https://images.unsplash.com/photo-1770475746172-e96a7fc5d8de?w=300'],
  fish: ['鲫鱼', '鲤鱼'],
  weight: '1.2斤',
  length: '28cm',
  spot: '燕子矶江边',
  method: '手竿',
  desc: '今天气压回升,鱼口明显变好,早口半小时连上三条。',
  publicSpot: true,
  allowComment: true,
});

const weather = ref({
  auto: true,
  text: '多云 24℃ · 东风 3 级 · 气压稳定',
});

const onPickFish = () => uni.showToast({ title: '选择鱼种 (待开发)', icon: 'none' });
const onPickSpot = () => uni.showToast({ title: '选择关联钓点 (待开发)', icon: 'none' });
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

<style lang="scss" scoped src="./create.scss"></style>
