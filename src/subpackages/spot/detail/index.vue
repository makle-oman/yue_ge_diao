<template>
  <view class="spot-detail">
    <!-- 顶部悬浮操作（脱离滚动流） -->
    <view
      class="hero-top"
      :style="heroTopStyle"
    >
      <view class="hero-icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="hero-icon-btn" @click="onShare">
        <mxy-icon name="ios_share" :size="40" color="#fff" />
      </view>
    </view>

    <!-- 滚动内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 顶部 Hero（随内容滚动） -->
      <view class="hero">
        <swiper class="hero-swiper" :current="heroIndex" @change="onHeroChange" circular>
          <swiper-item v-for="(src, idx) in spot.gallery" :key="idx">
            <image class="hero-img" :src="src" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="hero-shade" />
        <view class="hero-count">
          <text class="hero-count-text">{{ heroIndex + 1 }}/{{ spot.gallery.length }}</text>
        </view>
      </view>

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

    </scroll-view>

    <!-- 底部 CTA 栏 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="bottom-btn bottom-btn--ghost" :class="{ 'bottom-btn--wanted': isWanted }" @click="onWantGo">
        <text class="bottom-btn-text">{{ wantBtnLabel }}</text>
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
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  spotDetail,
  wantSpot,
  spotHistory,
  SPOT_TYPE_LABEL,
  WATER_TYPE_LABEL,
  type SpotDetail,
  type CatchHistoryItem,
} from '@/api/spots';

interface Tag { label: string; tone: 'green' | 'blue' | 'orange' }
interface Facility { label: string; sub: string }
interface CatchItem { id: string; cover: string; tag?: string }

const { statusBarHeight, safeBottom, capsuleRightWidth } = useSystemInfo();

const heroTopStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {
    paddingTop: statusBarHeight.value + 'px',
  };
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1727524315467-264c0bd47a13?w=900',
  'https://images.unsplash.com/photo-1564875009929-58c9517cd6fd?w=900',
  'https://images.unsplash.com/photo-1635712291708-7afe9e037503?w=900',
];
const FALLBACK_CATCH_COVER = 'https://images.unsplash.com/photo-1741134913547-46bbab5a1f60?w=400';
const TAG_TONES: Tag['tone'][] = ['green', 'blue', 'orange'];

const heroIndex = ref(0);
const spotId = ref('');
const loading = ref(true);
const isWanted = ref(false);
const wantPending = ref(false);

const spot = ref({
  id: '',
  name: '加载中…',
  type: '',
  distance: '',
  feature: '',
  rate: 0,
  want: 0,
  recent: 0,
  tags: [] as Tag[],
  gallery: FALLBACK_GALLERY as string[],
  lat: 0,
  lng: 0,
  address: '' as string | null,
});

const weather = ref({
  score: 82,
  title: '今日宜钓 · 微风气压稳',
  sub: '24℃ 多云，东北风 3 级，建议早晚窗口作钓。',
});

const facilities = ref<Facility[]>([]);
const catches = ref<CatchItem[]>([]);

const wantBtnLabel = computed(() => (isWanted.value ? '已想去' : '想去'));

/** photos 里既可能是绝对 URL 也可能是 OSS key；OSS 没接上传 host 前回退占位。 */
function normalizeGallery(photos: string[]): string[] {
  const usable = photos.filter((p) => /^https?:\/\//.test(p));
  return usable.length > 0 ? usable : FALLBACK_GALLERY;
}

function pickCover(photos: string[]): string {
  const first = photos[0];
  if (first && /^https?:\/\//.test(first)) return first;
  return FALLBACK_CATCH_COVER;
}

function buildTags(item: SpotDetail): Tag[] {
  const tags: Tag[] = [];
  item.fishSpecies.slice(0, 2).forEach((label, i) => {
    tags.push({ label, tone: TAG_TONES[i % TAG_TONES.length] });
  });
  const paid = item.facilities?.paid;
  if (paid === true) tags.push({ label: '收费', tone: 'orange' });
  else if (paid === false) tags.push({ label: '免费', tone: 'green' });
  return tags;
}

function buildFacilities(item: SpotDetail): Facility[] {
  const list: Facility[] = [];
  const f = item.facilities || {};
  if ('park' in f) list.push({ label: '停车', sub: f.park ? '可停车' : '无' });
  if ('toilet' in f) list.push({ label: '厕所', sub: f.toilet ? '有' : '无' });
  if (item.waterType) list.push({ label: '水域', sub: WATER_TYPE_LABEL[item.waterType] ?? '—' });
  if (list.length === 0) list.push({ label: '提示', sub: '暂无设施信息' });
  return list;
}

function buildHeader(item: SpotDetail): string {
  // 详情接口不返回距离，用「类型 · 城市」占位
  const parts: string[] = [`${SPOT_TYPE_LABEL[item.type]}点`];
  if (item.city) parts.push(item.city);
  if (item.waterType) parts.push(WATER_TYPE_LABEL[item.waterType]);
  return parts.join(' · ');
}

function adaptCatch(item: CatchHistoryItem): CatchItem {
  const fish = item.fishSpecies[0];
  const weightKg = item.weight ? (item.weight / 500).toFixed(1) + '斤' : '';
  const tag = fish ? (weightKg ? `${fish} ${weightKg}` : fish) : undefined;
  return {
    id: item.id,
    cover: pickCover(item.photos),
    tag,
  };
}

async function loadDetail() {
  if (!spotId.value) {
    uni.showToast({ title: '钓点 id 缺失', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    const d = await spotDetail(spotId.value);
    spot.value = {
      id: d.id,
      name: d.name,
      type: SPOT_TYPE_LABEL[d.type],
      distance: d.city || '',
      feature: d.description || buildHeader(d),
      rate: d.ratingCount > 0 ? d.avgRating : 0,
      want: d.wantCount,
      recent: d.catchCount7Days,
      tags: buildTags(d),
      gallery: normalizeGallery(d.photos),
      lat: d.lat,
      lng: d.lng,
      address: d.address,
    };
    facilities.value = buildFacilities(d);
    isWanted.value = d.yourWantStatus;
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '加载详情失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function loadCatchesPreview() {
  if (!spotId.value) return;
  try {
    const resp = await spotHistory(spotId.value, { days: 30, limit: 6 });
    catches.value = resp.catches.map(adaptCatch);
  } catch (_) {
    // 鱼获预览失败不打断主流程
  }
}

onLoad((options) => {
  spotId.value = String(options?.id ?? '');
  loadDetail();
  loadCatchesPreview();
});

const onHeroChange = (e: any) => { heroIndex.value = e.detail.current; };
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onNavigate = () => {
  if (!spot.value.lat || !spot.value.lng) return;
  uni.openLocation({
    latitude: spot.value.lat,
    longitude: spot.value.lng,
    name: spot.value.name,
    address: spot.value.address || spot.value.feature,
    scale: 16,
  });
};

async function onWantGo() {
  if (!spot.value.id || wantPending.value) return;
  wantPending.value = true;
  const next = isWanted.value ? 'unwant' : 'want';
  try {
    const resp = await wantSpot(spot.value.id, next);
    isWanted.value = next === 'want';
    spot.value.want = resp.wantCount;
    uni.showToast({
      title: isWanted.value ? '已加入想去' : '已取消想去',
      icon: 'success',
    });
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '操作失败', icon: 'none' });
  } finally {
    wantPending.value = false;
  }
}

const onPostCatch = () => uni.navigateTo({ url: `/subpackages/catch/create/index?spotId=${spot.value.id}` });
const onMoreCatches = () =>
  uni.navigateTo({ url: `/subpackages/spot/history/index?id=${spot.value.id}` });
const onCatchTap = (c: CatchItem) => uni.navigateTo({ url: `/subpackages/catch/detail/index?id=${c.id}` });
</script>

<style lang="scss" scoped src="./index.scss"></style>
