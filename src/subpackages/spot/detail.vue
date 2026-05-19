<template>
  <view class="spot-detail">
    <!-- 顶部 Hero -->
    <view class="hero">
      <swiper class="hero-swiper" :current="heroIndex" @change="onHeroChange" circular>
        <swiper-item v-for="(src, idx) in spot.gallery" :key="idx">
          <image class="hero-img" :src="src" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="hero-shade" />

      <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="hero-icon-btn" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="hero-icon-btn" @click="onShare">
          <mxy-icon name="ios_share" :size="40" color="#fff" />
        </view>
      </view>

      <view class="hero-count">
        <text class="hero-count-text">{{ heroIndex + 1 }}/{{ spot.gallery.length }}</text>
      </view>
    </view>

    <!-- 滚动内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 钓点基础信息卡 -->
      <view class="spot-info">
        <view class="spot-info-head">
          <view class="spot-info-left">
            <text class="spot-name">{{ spot.name }}</text>
            <text class="spot-meta">{{ spot.type }} · {{ spot.distance }} · {{ spot.feature }}</text>
          </view>
          <view class="nav-btn" @click="onNavigate">
            <mxy-icon name="navigation" :size="28" color="#fff" />
            <text class="nav-btn-text">导航</text>
          </view>
        </view>

        <view class="tag-row">
          <view v-for="t in spot.tags" :key="t.label" class="tag" :class="`tag--${t.tone}`">
            <text class="tag-text">{{ t.label }}</text>
          </view>
        </view>

        <view class="stat-row">
          <text class="stat-rate">★ {{ spot.rate }}</text>
          <text class="stat-text">{{ spot.want }} 人想去</text>
          <text class="stat-text">近 7 天 {{ spot.recent }} 条鱼获</text>
        </view>
      </view>

      <!-- 宜钓指数 -->
      <view class="weather-card">
        <view class="weather-score">
          <text class="weather-score-num">{{ weather.score }}</text>
        </view>
        <view class="weather-info">
          <text class="weather-title">{{ weather.title }}</text>
          <text class="weather-sub">{{ weather.sub }}</text>
        </view>
      </view>

      <!-- 实用信息 -->
      <view class="facility-card">
        <view v-for="f in facilities" :key="f.label" class="facility-cell">
          <text class="facility-label">{{ f.label }}</text>
          <text class="facility-sub">{{ f.sub }}</text>
        </view>
      </view>

      <!-- 历史鱼获 -->
      <view class="section-title">
        <text>历史鱼获</text>
        <text class="section-more" @click="onMoreCatches">全部 ›</text>
      </view>
      <view class="catch-row">
        <view
          v-for="c in catches"
          :key="c.id"
          class="catch-card"
          @click="onCatchTap(c)"
        >
          <image class="catch-img" :src="c.cover" mode="aspectFill" />
          <view v-if="c.tag" class="catch-tag">
            <text class="catch-tag-text">{{ c.tag }}</text>
          </view>
        </view>
      </view>

      <view class="end-pad" />
    </scroll-view>

    <!-- 底部 CTA 栏 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="bottom-btn bottom-btn--ghost" @click="onWantGo">
        <text class="bottom-btn-text">想去</text>
      </view>
      <view class="bottom-btn bottom-btn--blue" @click="onNavigate">
        <text class="bottom-btn-text blue">导航</text>
      </view>
      <view class="bottom-btn bottom-btn--primary" @click="onPostCatch">
        <text class="bottom-btn-text primary">在这里发布鱼获</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

interface Tag { label: string; tone: 'green' | 'blue' | 'orange' }
interface Facility { label: string; sub: string }
interface CatchItem { id: string; cover: string; tag?: string }

const { statusBarHeight, safeBottom } = useSystemInfo();

const heroIndex = ref(0);

const spot = ref({
  id: 's1',
  name: '燕子矶江边',
  type: '野钓点',
  distance: '2.3km',
  feature: '江边缓流',
  rate: 4.5,
  want: 128,
  recent: 18,
  tags: [
    { label: '鲫鱼', tone: 'green' },
    { label: '鲤鱼', tone: 'blue' },
    { label: '免费', tone: 'orange' },
  ] as Tag[],
  gallery: [
    'https://images.unsplash.com/photo-1727524315467-264c0bd47a13?w=900',
    'https://images.unsplash.com/photo-1564875009929-58c9517cd6fd?w=900',
    'https://images.unsplash.com/photo-1635712291708-7afe9e037503?w=900',
  ],
});

const weather = ref({
  score: 82,
  title: '今日宜钓 · 微风气压稳',
  sub: '24℃ 多云，东北风 3 级，建议早晚窗口作钓。',
});

const facilities = ref<Facility[]>([
  { label: '停车', sub: '路边少量' },
  { label: '厕所', sub: '800m' },
  { label: '水深', sub: '1.5-3m' },
]);

const catches = ref<CatchItem[]>([
  { id: 'c1', cover: 'https://images.unsplash.com/photo-1635712291708-7afe9e037503?w=400', tag: '鲫鱼 1斤' },
  { id: 'c2', cover: 'https://images.unsplash.com/photo-1564875009929-58c9517cd6fd?w=400' },
  { id: 'c3', cover: 'https://images.unsplash.com/photo-1741134913547-46bbab5a1f60?w=400' },
]);

const onHeroChange = (e: any) => { heroIndex.value = e.detail.current; };
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onNavigate = () => uni.showToast({ title: '调起地图导航 (待开发)', icon: 'none' });
const onWantGo = () => uni.showToast({ title: '已加入想去', icon: 'success' });
const onPostCatch = () => uni.navigateTo({ url: `/subpackages/catch/create?spotId=${spot.value.id}` });
const onMoreCatches = () => uni.showToast({ title: '历史鱼获 (待开发)', icon: 'none' });
const onCatchTap = (c: CatchItem) => uni.navigateTo({ url: `/subpackages/catch/detail?id=${c.id}` });
</script>

<style lang="scss" scoped src="./detail.scss"></style>
