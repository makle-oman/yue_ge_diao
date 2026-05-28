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
          :class="{ selected: selected.includes(f.name) }"
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
      <text class="foot-text">{{ selected.length ? '已选择:' + selected.join('、') : '未选择鱼种' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const { statusBarHeight, safeBottom } = useSystemInfo();

const keyword = ref('');
const selected = ref<string[]>([]);
const segment = ref<'淡水' | '海水'>('淡水');
const target = ref('catch:create');
const segments = ['淡水', '海水'] as const;

const recents = ref([
  { name: '鲫鱼', tone: 'tone-primary' },
  { name: '翘嘴', tone: 'tone-blue' },
  { name: '鲤鱼', tone: 'tone-outline' },
]);

interface Fish {
  name: string;
  type: '淡水' | '海水';
  iconBg: string;
  iconColor: string;
}

const allFishes: Fish[] = [
  { name: '鲫鱼', type: '淡水', iconBg: '#EAF5F4', iconColor: '#2D8F87' },
  { name: '鲤鱼', type: '淡水', iconBg: '#EAF6FA', iconColor: '#5BA9C4' },
  { name: '草鱼', type: '淡水', iconBg: '#FFF4E1', iconColor: '#F5A623' },
  { name: '青鱼', type: '淡水', iconBg: '#EAF5F4', iconColor: '#2D8F87' },
  { name: '翘嘴', type: '淡水', iconBg: '#EAF6FA', iconColor: '#5BA9C4' },
  { name: '黑鱼', type: '淡水', iconBg: '#FFF0F0', iconColor: '#FF6B6B' },
  { name: '鲈鱼', type: '海水', iconBg: '#EAF6FA', iconColor: '#5BA9C4' },
  { name: '黄花鱼', type: '海水', iconBg: '#FFF4E1', iconColor: '#F5A623' },
  { name: '带鱼', type: '海水', iconBg: '#EAF5F4', iconColor: '#2D8F87' },
  { name: '鲷鱼', type: '海水', iconBg: '#FFF0F0', iconColor: '#FF6B6B' },
];

const filteredFishes = computed(() => {
  let list = allFishes.filter(f => f.type === segment.value);
  if (keyword.value.trim()) {
    list = list.filter(f => f.name.includes(keyword.value.trim()));
  }
  return list;
});

const pick = (name: string) => {
  const idx = selected.value.indexOf(name);
  if (idx >= 0) selected.value.splice(idx, 1);
  else selected.value.push(name);
};

function applyInitialFish(data: unknown) {
  if (Array.isArray(data)) {
    selected.value = data.filter((x): x is string => typeof x === 'string');
  }
}

function parseSelectedParam(raw: unknown): string[] {
  const text = decodeURIComponent(String(raw || ''));
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [text];
  }
}

// 接收发布页传入的已选鱼种，用于回显（编辑模式或返回再选）
onLoad((options) => {
  const currentTarget = decodeURIComponent(String(options?.target || ''));
  if (currentTarget) target.value = currentTarget;
  const fromQuery = parseSelectedParam(options?.selected);
  if (fromQuery.length) selected.value = fromQuery;
  const ch = (uni as any).getOpenerEventChannel?.();
  ch?.on?.('initFish', (data: unknown) => {
    applyInitialFish(data);
  });
});
onMounted(() => {});

const onCancel = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onDone = () => {
  if (selected.value.length === 0) {
    uni.showToast({ title: '请至少选择 1 种鱼', icon: 'none' });
    return;
  }
  const ch = (uni as any).getOpenerEventChannel?.();
  ch?.emit?.('fishSelected', [...selected.value]);
  uni.$emit(`${target.value}:fish-selected`, {
    names: [...selected.value],
  });
  uni.navigateBack({ delta: 1 });
};
const onCustom = () => {
  uni.navigateTo({ url: '/subpackages/catch/custom-fish/index' });
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
