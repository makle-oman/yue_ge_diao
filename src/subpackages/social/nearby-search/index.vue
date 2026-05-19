<template>
  <view class="nearby-search">
    <mxy-form-nav title="搜索附近钓友" action-text="地图" @action="onMap" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- Search -->
        <view class="search-bar">
          <mxy-icon name="search" :size="32" color="#6B7B85" />
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜地点 / 玩法 / 鱼类钓点"
            placeholder-class="search-ph"
            confirm-type="search"
          />
        </view>

        <!-- Chip filters -->
        <scroll-view class="chip-row" scroll-x show-scrollbar="false">
          <view class="chip-wrap">
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
        </scroll-view>

        <!-- Privacy banner -->
        <view class="privacy" @click="onPrivacy">
          <view class="privacy-icon">
            <mxy-icon name="lock" :size="28" color="#2D8F87" />
          </view>
          <view class="privacy-text">
            <text class="privacy-main">只展示开启附近可见的钓友</text>
            <text class="privacy-sub">默认仅显示在线状态 · 隐私可调</text>
          </view>
          <mxy-icon name="chevron_right" :size="32" color="#6B7B85" />
        </view>

        <!-- 章节标题 -->
        <view class="section-head">
          <text class="section-title">附近在线钓友</text>
          <text class="section-count">{{ filtered.length }} 人在线</text>
        </view>

        <!-- Angler 结果 -->
        <view class="angler-list">
          <view
            v-for="a in filtered"
            :key="a.id"
            class="angler-row"
            @click="onOpen(a)"
          >
            <view class="avatar" :class="`tone-${a.tone}`">
              <text class="avatar-text">{{ a.glyph }}</text>
              <view v-if="a.online" class="online-dot" />
            </view>
            <view class="row-main">
              <view class="row-head">
                <text class="row-name">{{ a.name }}</text>
                <view class="row-tag" :class="`tag--${a.online ? 'primary' : 'muted'}`">
                  <text>{{ a.online ? '在线' : '附近' }}</text>
                </view>
              </view>
              <text class="row-meta">{{ a.distance }} · {{ a.area }}</text>
              <text class="row-tags">{{ a.tags }}</text>
            </view>
            <view class="row-cta" @click.stop="onInvite(a)">
              <text class="row-cta-text">钓约</text>
            </view>
          </view>
        </view>

        <view class="end-pad" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

type ChipKey = 'within3' | 'lure' | 'wild' | 'star5';
type Tone = 'primary' | 'blue' | 'orange';

interface Angler {
  id: string;
  name: string;
  glyph: string;
  tone: Tone;
  distance: string;
  area: string;
  tags: string;
  online: boolean;
  play: 'lure' | 'wild' | 'mixed';
  star: number;
  km: number;
}

const keyword = ref('');
const activeChip = ref<ChipKey>('within3');

const chips = [
  { key: 'within3' as ChipKey, label: '3km内' },
  { key: 'lure'    as ChipKey, label: '路亚' },
  { key: 'wild'    as ChipKey, label: '野钓' },
  { key: 'star5'   as ChipKey, label: '5星以上' },
];

const anglers = ref<Angler[]>([
  {
    id: 'n1',
    name: '老周野钓',
    glyph: '老',
    tone: 'primary',
    distance: '2.4km',
    area: '燕子矶江边',
    tags: '5年钓龄 · 鲫鱼',
    online: true,
    play: 'wild',
    star: 4.6,
    km: 2.4,
  },
  {
    id: 'n2',
    name: '路亚小陈',
    glyph: '路',
    tone: 'blue',
    distance: '2.6km',
    area: '江心洲北汊',
    tags: '路亚翘嘴 · 装备齐',
    online: false,
    play: 'lure',
    star: 4.4,
    km: 2.6,
  },
  {
    id: 'n3',
    name: '阿强守水库',
    glyph: '阿',
    tone: 'orange',
    distance: '4.8km',
    area: '老山水库',
    tags: '10年钓龄 · 守钓达人',
    online: true,
    play: 'wild',
    star: 5.0,
    km: 4.8,
  },
  {
    id: 'n4',
    name: '老王凯凯',
    glyph: '老',
    tone: 'primary',
    distance: '6.3km',
    area: '高淳老坑',
    tags: '黑坑常驻 · 青鱼专精',
    online: true,
    play: 'mixed',
    star: 4.2,
    km: 6.3,
  },
]);

const filtered = computed<Angler[]>(() => {
  let pool = anglers.value;
  switch (activeChip.value) {
    case 'within3': pool = pool.filter(a => a.km <= 3); break;
    case 'lure':    pool = pool.filter(a => a.play === 'lure');  break;
    case 'wild':    pool = pool.filter(a => a.play === 'wild');  break;
    case 'star5':   pool = pool.filter(a => a.star >= 5);        break;
  }
  const kw = keyword.value.trim();
  if (kw) pool = pool.filter(a => a.name.includes(kw) || a.area.includes(kw) || a.tags.includes(kw));
  return pool;
});

const onMap = () => uni.showToast({ title: '地图视图 (待开发)', icon: 'none' });
const onPrivacy = () => uni.navigateTo({ url: '/subpackages/profile/setting/index?anchor=privacy' });
const onOpen = (a: Angler) => uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${a.id}` });
const onInvite = (a: Angler) => uni.showModal({
  title: '发起钓约',
  content: `向 ${a.name} 发起钓约?`,
  success: (r) => {
    if (r.confirm) uni.showToast({ title: '已发送钓约', icon: 'success' });
  },
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
