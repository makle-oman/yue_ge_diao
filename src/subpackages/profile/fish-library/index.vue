<template>
  <view class="fish-lib">
    <!-- 极光 Mesh Gradient Hero 顶栏 -->
    <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 极光流光背景层 -->
      <view class="hero-glow-1" />
      <view class="hero-glow-2" />
      <view class="hero-grid-pattern" />
      <view class="hero-circle-1" />
      <view class="hero-circle-2" />

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
        <!-- 游戏化里程碑进度卡 -->
        <view class="progress-card">
          <view class="progress-head">
            <text class="progress-title">总进度</text>
            <text class="progress-side">解锁 80% 奖励</text>
          </view>
          <view class="progress-bar-wrap">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: barPct + '%' }" />
              <!-- 里程碑节点 -->
              <view class="marker" style="left: 30%;">
                <view class="marker-dot" :class="{ reached: barPct >= 30 }" />
                <text class="marker-label">30%</text>
              </view>
              <view class="marker" style="left: 60%;">
                <view class="marker-dot" :class="{ reached: barPct >= 60 }" />
                <text class="marker-label">60%</text>
              </view>
              <view class="marker" style="left: 80%;">
                <view class="marker-dot gold-chest" :class="{ reached: barPct >= 80 }" />
                <text class="marker-label highlight">80% 🏆</text>
              </view>
            </view>
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
                <svg class="fish-bone-svg" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                  <!-- 细长鱼轮廓 -->
                  <g v-if="getBoneType(f.name) === 'slender'">
                    <path d="M 88 25 C 80 21 68 20 55 20 C 42 20 28 22 18 23 C 14 21 9 18 7 20 C 9 24 9 26 7 30 C 9 32 14 29 18 27 C 28 28 42 30 55 30 C 68 30 80 29 88 25 Z" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                  </g>
                  <!-- 扁宽鱼轮廓 -->
                  <g v-else-if="getBoneType(f.name) === 'deep'">
                    <path d="M 83 25 C 75 15 65 6 52 6 C 45 8 30 15 18 22 C 14 18 9 12 7 15 C 9 22 9 28 7 35 C 9 38 14 32 18 28 C 30 35 45 42 52 44 C 65 44 75 35 85 25 Z" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                  </g>
                  <!-- 掠食性鱼轮廓 -->
                  <g v-else-if="getBoneType(f.name) === 'predatory'">
                    <path d="M 85 25 C 75 17 68 15 60 15 C 55 10 45 8 40 16 C 30 17 20 20 16 22 C 12 18 8 12 6 15 C 8 22 8 28 6 35 C 8 38 12 32 16 28 C 20 30 30 33 40 34 C 45 38 55 38 60 35 C 68 35 75 33 85 25 Z" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                  </g>
                  <!-- 标准鱼轮廓 -->
                  <g v-else>
                    <path d="M 85 25 C 75 18 70 14 62 14 C 60 11 50 9 45 14 C 35 15 25 19 18 22 C 14 20 10 16 8 18 C 10 23 10 27 8 32 C 10 34 14 30 18 28 C 25 31 35 35 45 36 C 47 39 52 41 55 36 C 70 36 75 32 85 25 Z" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                  </g>
                </svg>
              </view>
              <view v-if="f.rarityLabel" class="rarity-badge">
                <text>{{ f.rarityLabel }}</text>
              </view>
              <view v-if="!f.unlocked" class="lock-mask">
                <view class="lock-glow-ring">
                  <mxy-icon name="lock" :size="30" color="#C29F72" />
                </view>
              </view>
            </view>
            <view class="fish-info">
              <text class="fish-name">{{ f.unlocked ? f.name : '未知鱼种' }}</text>
              <text class="fish-meta">{{ f.unlocked ? f.record : '未解锁' }}</text>
              <view class="fish-foot">
                <mxy-icon :name="f.unlocked ? 'schedule' : 'info'" :size="22" :color="f.unlocked ? '#2A3C36' : '#8A9995'" />
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

function getBoneType(name: string): string {
  const n = name || '';
  if (n.includes('黑鱼') || n.includes('鳗') || n.includes('鳝') || n.includes('泥鳅') || n.includes('鲶')) {
    return 'slender';
  }
  if (n.includes('鳊') || n.includes('鲳') || n.includes('鲫') || n.includes('鲂') || n.includes('缩骨')) {
    return 'deep';
  }
  if (n.includes('鲈') || n.includes('鳜') || n.includes('鲨') || n.includes('金枪') || n.includes('翘嘴') || n.includes('石斑')) {
    return 'predatory';
  }
  return 'standard';
}

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
