<template>
  <view class="fish-lib">
    <!-- 渐变 Hero -->
    <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="hero-top" :style="heroTopStyle">
        <view class="hero-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="hero-share" @click="onShare">
          <mxy-icon name="ios_share" :size="40" color="#fff" />
        </view>
      </view>
      <view class="hero-body">
        <text class="hero-title">鱼库成就</text>
        <text class="hero-sub">淡水鱼 / 海鱼 · 已点亮 {{ totalUnlocked }} / {{ totalCount }} 种</text>
      </view>
      <view class="hero-badge">
        <text class="hero-badge-num">{{ progressPct }}%</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 总进度卡 -->
        <view class="progress-card">
          <view class="progress-head">
            <text class="progress-title">总进度</text>
            <text class="progress-side">解锁 80% 奖励</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: barPct + '%' }" />
          </view>
          <view class="progress-foot">
            <text class="progress-foot-text">淡水鱼 {{ stats.fresh.done }}/{{ stats.fresh.total }}</text>
            <text class="progress-foot-text">海鱼 {{ stats.sea.done }}/{{ stats.sea.total }}</text>
          </view>
        </view>

        <!-- 淡水/海鱼分段 -->
        <view class="segment">
          <view
            v-for="s in segments"
            :key="s.key"
            class="seg"
            :class="{ active: activeSeg === s.key }"
            @click="switchSegment(s.key)"
          >
            <text>{{ s.label }}</text>
          </view>
        </view>

        <!-- 3 chip pill -->
        <view class="chips">
          <view
            v-for="c in chips"
            :key="c.key"
            class="chip"
            :class="{ active: activeChip === c.key }"
            @click="switchChip(c.key)"
          >
            <text>{{ c.label }}</text>
          </view>
        </view>

        <!-- 章节标题 -->
        <view class="section-head">
          <text class="section-title">{{ activeSeg === 'fresh' ? '淡水鱼图鉴' : '海水鱼图鉴' }}</text>
          <text class="section-meta">最近点亮</text>
        </view>

        <!-- 网格 -->
        <view class="fish-grid">
          <view
            v-for="f in displayFish"
            :key="f.name"
            class="fish-tile"
            :class="[{ locked: !f.unlocked }, f.rarityClass]"
            @click="onTap(f)"
          >
            <view class="fish-cover">
              <image v-if="f.image" class="fish-img" :src="f.image" mode="aspectFill" />
              <view v-else class="fish-silhouette">
                <view class="fish-body-shape" />
                <view class="fish-tail-shape" />
              </view>
              <view v-if="f.rarityLabel" class="rarity-badge">
                <text>{{ f.rarityLabel }}</text>
              </view>
              <view v-if="!f.unlocked" class="lock-mask">
                <mxy-icon name="lock" :size="34" color="#fff" />
              </view>
            </view>
            <view class="fish-info">
              <text class="fish-name">{{ f.unlocked ? f.name : '未知鱼种' }}</text>
              <text class="fish-meta">{{ f.unlocked ? f.record : '未解锁' }}</text>
              <view class="fish-foot">
                <mxy-icon :name="f.unlocked ? 'schedule' : 'info'" :size="22" :color="f.unlocked ? '#2D8F87' : '#AAB6BD'" />
                <text>{{ f.unlocked ? f.firstCatchText : f.lockHint }}</text>
              </view>
            </view>
          </view>
          <view v-if="!displayFish.length" class="empty-state">
            <text>暂无鱼种</text>
          </view>
        </view>

        <!-- 周目标 -->
        <view class="goal-card">
          <view class="goal-icon">
            <mxy-icon name="emoji_events" :size="40" color="#F5A623" />
          </view>
          <view class="goal-text">
            <text class="goal-main">本周目标：点亮黑鱼</text>
            <text class="goal-sub">推荐去江心洲北汊 · 早窗气压稳定</text>
          </view>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import { fetchFishLibrary, type FishCategory, type FishFilter, type FishItem, type FishRarity, type FishStats } from '@/api/fishes';
import { formatWeight } from '@/api/catches';

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();

const heroTopStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {};
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

type SegKey = 'fresh' | 'sea';
type Tone = 'primary' | 'blue' | 'orange' | 'ghost';

interface Fish {
  name: string;
  category: FishCategory;
  tone: Tone;
  record: string;
  firstCatchText: string;
  lockHint: string;
  rarity?: FishRarity;
  rarityLabel: string;
  rarityClass: string;
  image?: string;
  unlocked: boolean;
  common: boolean;
}

const activeSeg = ref<SegKey>('fresh');
const activeChip = ref<FishFilter>('all');

const segments = [
  { key: 'fresh' as SegKey, label: '淡水鱼' },
  { key: 'sea'   as SegKey, label: '海鱼' },
];
const chips = [
  { key: 'all'      as FishFilter, label: '全部' },
  { key: 'common'   as FishFilter, label: '常见' },
  { key: 'rare'     as FishFilter, label: '稀有' },
  { key: 'locked'   as FishFilter, label: '未点亮' },
];

const stats = ref<FishStats>({
  fresh: { done: 0, total: 0 },
  sea:   { done: 0, total: 0 },
});
const fishList = ref<Fish[]>([]);
const loading = ref(false);
let requestSeq = 0;

const totalUnlocked = computed(() => stats.value.fresh.done + stats.value.sea.done);
const totalCount = computed(() => stats.value.fresh.total + stats.value.sea.total);
const progressPct = computed(() => totalCount.value ? Math.round(totalUnlocked.value / totalCount.value * 100) : 0);
const barPct = progressPct;
const rarityText: Record<FishRarity, string> = {
  rare: '稀有',
  epic: '极罕',
  legendary: '传说',
};

function toneOf(f: FishItem): Tone {
  if (!f.unlocked) return 'ghost';
  if (f.category === 'sea') return 'blue';
  if (f.common) return 'primary';
  return 'orange';
}
function formatFirstCatch(date: string | null) {
  if (!date) return '首次: 未记录';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '首次: 未记录';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `首次: ${y}.${m}.${day}`;
}

function adaptFish(f: FishItem): Fish {
  const rarityLabel = f.rarity ? rarityText[f.rarity] : '';
  return {
    name: f.name,
    category: f.category,
    tone: toneOf(f),
    record: f.unlocked ? `最高 ${formatWeight(f.maxWeightG)}` : '未点亮',
    firstCatchText: formatFirstCatch(f.firstCatchAt),
    lockHint: f.rarity ? '未知水域' : (f.category === 'fresh' ? '淡水常见' : '海水常见'),
    rarity: f.rarity,
    rarityLabel,
    rarityClass: f.rarity ? `rarity-${f.rarity}` : '',
    image: f.image,
    unlocked: f.unlocked,
    common: f.common,
  };
}

async function loadLibrary() {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const resp = await fetchFishLibrary({
      category: activeSeg.value,
      filter: activeChip.value,
    });
    if (seq !== requestSeq) return;
    stats.value = resp.stats;
    fishList.value = resp.list.map(adaptFish);
  } catch (e: any) {
    if (seq === requestSeq) uni.showToast({ title: e?.msg || '鱼库加载失败', icon: 'none' });
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}
function switchSegment(key: SegKey) {
  if (activeSeg.value === key) return;
  activeSeg.value = key;
  activeChip.value = 'all';
  void loadLibrary();
}
function switchChip(key: FishFilter) {
  if (activeChip.value === key) return;
  activeChip.value = key;
  void loadLibrary();
}

const displayFish = computed<Fish[]>(() => fishList.value);

onMounted(loadLibrary);

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onTap = (f: Fish) => {
  uni.showToast({
    title: f.unlocked ? `${f.name} · ${f.record}` : `${f.name} 尚未点亮`,
    icon: 'none',
  });
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
