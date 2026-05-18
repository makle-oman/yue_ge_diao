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

interface Tag { label: string; tone: 'green' | 'blue' | 'orange' }
interface Facility { label: string; sub: string }
interface CatchItem { id: string; cover: string; tag?: string }

const statusBarHeight = ref(0);
const safeBottom = ref(0);
try {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 20;
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
} catch (_e) {
  statusBarHeight.value = 20;
}

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
const onPostCatch = () => uni.navigateTo({ url: `/pages/catch/create?spotId=${spot.value.id}` });
const onMoreCatches = () => uni.showToast({ title: '历史鱼获 (待开发)', icon: 'none' });
const onCatchTap = (c: CatchItem) => uni.navigateTo({ url: `/pages/catch/detail?id=${c.id}` });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.spot-detail {
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
  height: 504rpx; /* 252px */
  flex: none;
}
.hero-swiper, .hero-img {
  width: 100%;
  height: 100%;
}
.hero-img {
  display: block;
}
.hero-shade {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.16);
  pointer-events: none;
}
.hero-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx 0;
  z-index: 3;
}
.hero-icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: scale(.94); }
}
.hero-count {
  position: absolute;
  right: 32rpx;
  bottom: 24rpx;
  height: 44rpx;
  padding: 0 16rpx;
  border-radius: 22rpx;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;

  .hero-count-text {
    font-size: 22rpx;
    color: #fff;
    font-weight: 800;
    line-height: 1;
  }
}

/* ---------- 滚动区 ---------- */
.content {
  flex: 1;
  min-height: 0;
}

/* ---------- 信息卡 ---------- */
.spot-info {
  margin: -80rpx 32rpx 0;
  padding: 28rpx;
  background: $bg-card;
  border-radius: 28rpx;
  box-shadow: 0 12rpx 36rpx rgba(26, 43, 51, 0.14);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  position: relative;
  z-index: 4;
}
.spot-info-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.spot-info-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .spot-name {
    font-size: 44rpx;
    font-weight: 900;
    color: $text-primary;
    line-height: 1.1;
  }
  .spot-meta {
    font-size: 26rpx;
    color: $text-secondary;
  }
}
.nav-btn {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: $primary;
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;

  &:active { transform: scale(.96); }

  .nav-btn-text {
    font-size: 26rpx;
    color: #fff;
    font-weight: 800;
  }
}

.tag-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
.tag {
  height: 48rpx;
  padding: 0 20rpx;
  border-radius: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .tag-text {
    font-size: 22rpx;
    font-weight: 800;
    line-height: 1;
  }
  &--green  { background: $soft-primary; .tag-text { color: $primary; } }
  &--blue   { background: $soft-blue;    .tag-text { color: $secondary; } }
  &--orange { background: $soft-orange;  .tag-text { color: $accent; } }
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex-wrap: wrap;

  .stat-rate {
    font-size: 26rpx;
    color: $accent;
    font-weight: 900;
  }
  .stat-text {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

/* ---------- 宜钓指数 ---------- */
.weather-card {
  margin: 28rpx 32rpx 0;
  padding: 28rpx;
  background: $soft-primary;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.weather-score {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: #fff;
  border: 6rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .weather-score-num {
    font-size: 44rpx;
    font-weight: 900;
    color: $primary;
    line-height: 1;
  }
}
.weather-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .weather-title {
    font-size: 30rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .weather-sub {
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.4;
  }
}

/* ---------- 实用信息 ---------- */
.facility-card {
  margin: 28rpx 32rpx 0;
  padding: 24rpx;
  background: $bg-card;
  border-radius: 28rpx;
  box-shadow: 0 6rpx 20rpx rgba(26, 43, 51, 0.06);
  display: flex;
  gap: 16rpx;
}
.facility-cell {
  flex: 1;
  height: 96rpx;
  border-radius: 20rpx;
  background: $bg-page;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  .facility-label {
    font-size: 24rpx;
    color: $text-primary;
    font-weight: 800;
  }
  .facility-sub {
    font-size: 20rpx;
    color: $text-secondary;
  }
}

/* ---------- 历史鱼获 ---------- */
.section-title {
  margin: 36rpx 32rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  text {
    font-size: 32rpx;
    font-weight: 900;
    color: $text-primary;
  }
  .section-more {
    font-size: 24rpx;
    color: $primary;
    font-weight: 700;
  }
}

.catch-row {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx;
}
.catch-card {
  position: relative;
  flex: 1;
  height: 180rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: $bg-hover;

  &:active { transform: scale(.97); }

  .catch-img {
    width: 100%;
    height: 100%;
    display: block;
  }
}
.catch-tag {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  height: 36rpx;
  padding: 0 12rpx;
  border-radius: 18rpx;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;

  .catch-tag-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 800;
  }
}

.end-pad { height: 200rpx; }

/* ---------- 底部 CTA ---------- */
.bottom-bar {
  flex: none;
  display: flex;
  gap: 20rpx;
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  padding: 20rpx 32rpx 20rpx;
}
.bottom-btn {
  height: 92rpx;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { transform: scale(.97); }

  .bottom-btn-text {
    font-size: 28rpx;
    font-weight: 800;
    color: $text-primary;

    &.blue   { color: $secondary; }
    &.primary { color: #fff; }
  }

  &--ghost   { width: 156rpx; background: $bg-page; }
  &--blue    { width: 156rpx; background: $soft-blue; }
  &--primary { flex: 1; background: $primary; }
}
</style>
