<template>
  <view class="fish-lib">
    <!-- 渐变 Hero -->
    <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="hero-top">
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
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight } = useSystemInfo();

type SegKey = 'fresh' | 'sea';
type ChipKey = 'unlocked' | 'common' | 'locked';
type Tone = 'primary' | 'blue' | 'orange' | 'ghost';

interface Fish {
  name: string;
  tone: Tone;
  record: string;
  unlocked: boolean;
  common: boolean;
}

const activeSeg = ref<SegKey>('fresh');
const activeChip = ref<ChipKey>('unlocked');

const segments = [
  { key: 'fresh' as SegKey, label: '淡水鱼' },
  { key: 'sea'   as SegKey, label: '海鱼' },
];
const chips = [
  { key: 'unlocked' as ChipKey, label: '已点亮' },
  { key: 'common'   as ChipKey, label: '常见鱼' },
  { key: 'locked'   as ChipKey, label: '未点亮' },
];

const stats = ref({
  fresh: { done: 8, total: 20 },
  sea:   { done: 3, total: 18 },
});

const freshFish: Fish[] = [
  { name: '鲫鱼',  tone: 'primary', record: '记录 1.5kg', unlocked: true,  common: true },
  { name: '鲈鱼',  tone: 'blue',    record: '记录 1.2kg', unlocked: true,  common: true },
  { name: '翘嘴',  tone: 'orange',  record: '记录 0.8kg', unlocked: true,  common: true },
  { name: '鲈鱼',  tone: 'ghost',   record: '未点亮',     unlocked: false, common: true },
  { name: '鲤鱼',  tone: 'ghost',   record: '未点亮',     unlocked: false, common: true },
  { name: '草鱼',  tone: 'ghost',   record: '未点亮',     unlocked: false, common: true },
];

const seaFish: Fish[] = [
  { name: '黄花鱼', tone: 'primary', record: '记录 0.6kg', unlocked: true,  common: true },
  { name: '海鲈',   tone: 'blue',    record: '记录 1.8kg', unlocked: true,  common: true },
  { name: '鲷鱼',   tone: 'ghost',   record: '未点亮',     unlocked: false, common: true },
  { name: '马鲛鱼', tone: 'ghost',   record: '未点亮',     unlocked: false, common: false },
];

const totalUnlocked = computed(() => stats.value.fresh.done + stats.value.sea.done);
const totalCount = computed(() => stats.value.fresh.total + stats.value.sea.total);
const progressPct = computed(() => Math.round(totalUnlocked.value / totalCount.value * 100));
const barPct = progressPct;

const displayFish = computed<Fish[]>(() => {
  const pool = activeSeg.value === 'fresh' ? freshFish : seaFish;
  switch (activeChip.value) {
    case 'unlocked': return pool.filter(f => f.unlocked);
    case 'locked':   return pool.filter(f => !f.unlocked);
    case 'common':   return pool.filter(f => f.common);
    default:         return pool;
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
</script>

<style lang="scss" scoped src="./index.scss"></style>
