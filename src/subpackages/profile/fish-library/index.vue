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
            <text class="progress-side">{{ rewardText }}</text>
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
            @click="activeSeg = s.key"
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
            @click="activeChip = c.key"
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
            :class="{ locked: !f.unlocked }"
            @click="onTap(f)"
          >
            <view class="fish-circle" :class="`tone-${f.tone}`">
              <mxy-icon name="set_meal" :size="48" :color="f.unlocked ? '#1A2B33' : '#BFC8CE'" />
              <view v-if="f.unlocked" class="fish-check">
                <mxy-icon name="check" :size="20" color="#fff" />
              </view>
            </view>
            <text class="fish-name">{{ f.name }}</text>
            <text class="fish-meta">{{ f.unlocked ? f.record : '未点亮' }}</text>
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
import { computed, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  fishLibrary,
  type FishCategory,
  type FishLibraryItem,
  type FishLibraryStats,
} from '@/api/fishes';
import { formatWeight } from '@/api/catches';

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();

const heroTopStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {};
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

type SegKey = FishCategory;
type ChipKey = 'unlocked' | 'common' | 'locked';
type Tone = 'primary' | 'blue' | 'orange' | 'ghost';

interface Fish {
  name: string;
  category: FishCategory;
  tone: Tone;
  record: string;
  unlocked: boolean;
  common: boolean;
}

const activeSeg = ref<SegKey>('fresh');
const activeChip = ref<ChipKey>('unlocked');
const loading = ref(false);

const segments = [
  { key: 'fresh' as SegKey, label: '淡水鱼' },
  { key: 'sea' as SegKey, label: '海鱼' },
];
const chips = [
  { key: 'unlocked' as ChipKey, label: '已点亮' },
  { key: 'common' as ChipKey, label: '常见鱼' },
  { key: 'locked' as ChipKey, label: '未点亮' },
];

const stats = ref<FishLibraryStats>({
  fresh: { done: 0, total: 0 },
  sea: { done: 0, total: 0 },
});
const fishList = ref<Fish[]>([]);

function fishTone(f: FishLibraryItem, index: number): Tone {
  if (!f.unlocked) return 'ghost';
  const tones: Tone[] = f.category === 'sea'
    ? ['blue', 'primary', 'orange']
    : ['primary', 'orange', 'blue'];
  return tones[index % tones.length];
}

function fishRecord(f: FishLibraryItem): string {
  if (!f.unlocked) return '未点亮';
  if (f.maxWeightG != null) return `记录 ${formatWeight(f.maxWeightG)}`;
  return '已点亮';
}

function adaptFish(f: FishLibraryItem, index: number): Fish {
  return {
    name: f.name,
    category: f.category,
    tone: fishTone(f, index),
    record: fishRecord(f),
    unlocked: f.unlocked,
    common: f.common,
  };
}

async function loadLibrary() {
  if (loading.value) return;
  loading.value = true;
  try {
    const resp = await fishLibrary();
    stats.value = resp.stats;
    fishList.value = resp.list.map(adaptFish);
  } catch (e) {
    console.warn('[fish-library] load failed', e);
  } finally {
    loading.value = false;
  }
}

const totalUnlocked = computed(() => stats.value.fresh.done + stats.value.sea.done);
const totalCount = computed(() => stats.value.fresh.total + stats.value.sea.total);
const progressPct = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round((totalUnlocked.value / totalCount.value) * 100);
});
const barPct = progressPct;
const rewardText = computed(() => {
  if (!totalCount.value) return '鱼库加载中';
  const need = Math.ceil(totalCount.value * 0.8);
  if (totalUnlocked.value >= need) return '已解锁 80% 奖励';
  return `距 80% 还差 ${need - totalUnlocked.value} 种`;
});

const displayFish = computed<Fish[]>(() => {
  const pool = fishList.value.filter((f) => f.category === activeSeg.value);
  switch (activeChip.value) {
    case 'unlocked': return pool.filter((f) => f.unlocked);
    case 'locked': return pool.filter((f) => !f.unlocked);
    case 'common': return pool.filter((f) => f.common);
    default: return pool;
  }
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onTap = (f: Fish) => {
  uni.showToast({
    title: f.unlocked ? `${f.name} · ${f.record}` : `${f.name} 尚未点亮`,
    icon: 'none',
  });
};

onMounted(loadLibrary);
onShow(loadLibrary);
</script>

<style lang="scss" scoped src="./index.scss"></style>
