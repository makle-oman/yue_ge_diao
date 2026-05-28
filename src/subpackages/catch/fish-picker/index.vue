<template>
  <view class="picker-page">
    <!-- 顶部状态栏+导航(取消/标题/完成) -->
    <view class="picker-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="picker-nav">
        <view class="nav-cancel" @click="onCancel"><text>取消</text></view>
        <text class="nav-title">选择鱼种</text>
        <view class="nav-done" @click="onDone"><text>完成</text></view>
      </view>
    </view>

    <scroll-view class="picker-scroll" scroll-y>
      <!-- 搜索框 -->
      <view class="search-bar">
        <mxy-icon name="search" :size="40" color="#6B7B85" />
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索鱼种,如 鲫鱼、翘嘴"
          placeholder-class="search-placeholder"
        />
      </view>

      <!-- 最近选择 -->
      <view class="recent-card">
        <text class="recent-title">最近选择</text>
        <view class="recent-chips">
          <view
            v-for="r in recents"
            :key="r.name"
            class="recent-chip"
            :class="r.tone"
            @click="pick(r.name)"
          >
            <text>{{ r.name }}</text>
          </view>
        </view>
      </view>

      <!-- 淡水/海水 切换 -->
      <view class="segment">
        <view
          v-for="s in segments"
          :key="s"
          class="segment-item"
          :class="{ active: segment === s }"
          @click="segment = s"
        >
          <text>{{ s }}</text>
        </view>
      </view>

      <!-- 鱼种网格 (2 列) -->
      <view class="fish-grid">
        <view
          v-for="f in filteredFishes"
          :key="f.name"
          class="fish-card"
          :class="{ selected: selected === f.name }"
          @click="pick(f.name)"
        >
          <view class="fish-icon" :style="{ background: f.iconBg }">
            <text class="fish-emoji" :style="{ color: f.iconColor }">{{ f.name.charAt(0) }}</text>
          </view>
          <text class="fish-name">{{ f.name }}</text>
        </view>
      </view>

      <!-- 自定义鱼种入口 -->
      <view class="custom-entry" @click="onCustom">
        <text>没有找到?添加自定义鱼种</text>
        <mxy-icon name="add" :size="40" color="#2D8F87" />
      </view>

      <view class="scroll-pad" />
    </scroll-view>

    <!-- 底部已选 -->
    <view class="picker-foot" :style="{ paddingBottom: safeBottom + 'px' }">
      <text class="foot-text">{{ selected ? '已选择:' + selected : '未选择鱼种' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import { fishCatalog, type FishCategory } from '@/api/fishes';

const { statusBarHeight, safeBottom } = useSystemInfo();

type Segment = '淡水' | '海水';

const keyword = ref('');
const selected = ref('');
const segment = ref<Segment>('淡水');
const target = ref('catch:create');
const segments = ['淡水', '海水'] as const;

const recents = ref([
  { name: '鲫鱼', tone: 'tone-primary' },
  { name: '翘嘴', tone: 'tone-blue' },
  { name: '海鲈', tone: 'tone-outline' },
]);

interface Fish {
  name: string;
  type: Segment;
  iconBg: string;
  iconColor: string;
}

const fallbackFishes: Fish[] = [
  { name: '鲫鱼', type: '淡水', iconBg: '#EAF5F4', iconColor: '#2D8F87' },
  { name: '鲤鱼', type: '淡水', iconBg: '#EAF6FA', iconColor: '#5BA9C4' },
  { name: '草鱼', type: '淡水', iconBg: '#FFF4E1', iconColor: '#F5A623' },
  { name: '青鱼', type: '淡水', iconBg: '#EAF5F4', iconColor: '#2D8F87' },
  { name: '翘嘴', type: '淡水', iconBg: '#EAF6FA', iconColor: '#5BA9C4' },
  { name: '黑鱼', type: '淡水', iconBg: '#FFF0F0', iconColor: '#FF6B6B' },
  { name: '海鲈', type: '海水', iconBg: '#EAF6FA', iconColor: '#5BA9C4' },
  { name: '黄花鱼', type: '海水', iconBg: '#FFF4E1', iconColor: '#F5A623' },
  { name: '带鱼', type: '海水', iconBg: '#EAF5F4', iconColor: '#2D8F87' },
  { name: '鲷鱼', type: '海水', iconBg: '#FFF0F0', iconColor: '#FF6B6B' },
];

const allFishes = ref<Fish[]>(fallbackFishes);

const categoryLabel: Record<FishCategory, Segment> = {
  fresh: '淡水',
  sea: '海水',
};

const palette = [
  ['#EAF5F4', '#2D8F87'],
  ['#EAF6FA', '#5BA9C4'],
  ['#FFF4E1', '#F5A623'],
  ['#FFF0F0', '#FF6B6B'],
] as const;

const filteredFishes = computed(() => {
  let list = allFishes.value.filter((f) => f.type === segment.value);
  const kw = keyword.value.trim();
  if (kw) list = list.filter((f) => f.name.includes(kw));
  return list;
});

function syncSegmentWithSelected() {
  const current = allFishes.value.find((f) => f.name === selected.value);
  if (current) segment.value = current.type;
}

function adaptCatalogItem(
  f: { name: string; category: FishCategory },
  index: number,
): Fish {
  const [iconBg, iconColor] = palette[index % palette.length];
  return {
    name: f.name,
    type: categoryLabel[f.category],
    iconBg,
    iconColor,
  };
}

async function loadFishes() {
  try {
    const resp = await fishCatalog();
    if (!resp.list.length) return;
    allFishes.value = resp.list.map(adaptCatalogItem);
    if (!selected.value) selected.value = allFishes.value[0]?.name || '';
    syncSegmentWithSelected();
  } catch (e) {
    console.warn('[fish-picker] fishCatalog failed', e);
    if (!selected.value) selected.value = '鲫鱼';
    syncSegmentWithSelected();
  }
}

const pick = (name: string) => {
  selected.value = name;
};
const onCancel = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onDone = () => {
  if (!selected.value) {
    uni.showToast({ title: '请先选择鱼种', icon: 'none' });
    return;
  }
  uni.$emit(`${target.value}:fish-selected`, {
    name: selected.value,
    names: [selected.value],
  });
  uni.showToast({ title: '已选择 ' + selected.value, icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }), 300);
};
const onCustom = () => {
  uni.navigateTo({ url: '/subpackages/catch/custom-fish/index' });
};

onLoad((options) => {
  const current = decodeURIComponent(String(options?.selected || ''));
  const currentTarget = decodeURIComponent(String(options?.target || ''));
  if (currentTarget) target.value = currentTarget;
  if (current) selected.value = current;
  syncSegmentWithSelected();
});

onMounted(loadFishes);
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
