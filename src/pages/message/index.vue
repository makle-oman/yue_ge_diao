<template>
  <view class="message-page">
    <!-- 顶部状态栏占位 + 标题栏 -->
    <view class="msg-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="msg-nav" :style="msgNavStyle">
        <text class="msg-title">消息</text>
        <text class="msg-read-all" @click="onReadAll">全部已读</text>
      </view>
    </view>

    <!-- 滚动内容: 仅列表区可滚动 -->
    <scroll-view class="msg-scroll" scroll-y>
      <!-- 4 个互动入口 -->
      <view class="msg-types-card">
        <view
          v-for="t in entryTypes"
          :key="t.key"
          class="msg-type"
          @click="onTypeTap(t)"
        >
          <view class="msg-type-icon" :style="{ background: t.bg }">
            <mxy-icon :name="t.icon" :size="44" :color="t.color" />
            <view v-if="t.badge" class="msg-type-dot" :style="{ minWidth: t.badge.length > 1 ? '32rpx' : '24rpx' }">
              <text class="msg-type-dot-text">{{ t.badge }}</text>
            </view>
          </view>
          <text class="msg-type-label">{{ t.label }}</text>
        </view>
      </view>

      <!-- 最近互动标题 -->
      <view class="msg-section-title">
        <text>最近互动</text>
      </view>

      <!-- 互动列表 -->
      <view class="msg-list-card">
        <view
          v-for="(row, idx) in rows"
          :key="row.id"
          class="msg-row"
          @click="onRowTap(row)"
        >
          <!-- 头像: 有 avatar 用图，没有用色块占位 -->
          <view v-if="!row.avatar" class="msg-row-av" :style="{ background: row.avBg }" />
          <image v-else class="msg-row-av" :src="row.avatar" mode="aspectFill" />

          <view class="msg-row-text">
            <text class="msg-row-main">{{ row.main }}</text>
            <text class="msg-row-sub" :class="{ accent: row.subAccent }">{{ row.sub }}</text>
          </view>

          <!-- 右侧: 缩略图 / 按钮 / 空 -->
          <image v-if="row.thumb" class="msg-row-thumb" :src="row.thumb" mode="aspectFill" />
          <view v-else-if="row.action" class="msg-row-btn" @click.stop="onAction(row)">
            <text class="msg-row-btn-text">{{ row.action }}</text>
          </view>

          <!-- 分隔线 -->
          <view v-if="idx !== rows.length - 1" class="msg-row-divider" />
        </view>
      </view>

    </scroll-view>

    <CustomTabBar current="message" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface EntryType {
  key: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  badge?: string;
}

interface MsgRow {
  id: string;
  main: string;
  sub: string;
  subAccent?: boolean;
  avatar?: string;
  avBg?: string;
  thumb?: string;
  action?: string;
}

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();

const msgNavStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {};
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

const entryTypes = ref<EntryType[]>([
  { key: 'comment', label: '评论', icon: 'alternate_email', color: '#F5A623', bg: '#FFF4E1', badge: '2' },
  { key: 'like',    label: '赞',   icon: 'favorite',        color: '#FF6B6B', bg: '#FFF0F0', badge: '12' },
  { key: 'team',    label: '组队', icon: 'groups',          color: '#5BA9C4', bg: '#EAF6FA', badge: '1' },
  { key: 'system',  label: '系统', icon: 'campaign',        color: '#2D8F87', bg: '#EAF5F4' },
]);

const rows = ref<MsgRow[]>([
  {
    id: 'r1',
    main: '老王 赞了你的鱼获',
    sub: '5 分钟前',
    avBg: '#EAF5F4',
    thumb: 'https://images.unsplash.com/photo-1568727349390-7deb45c78797?w=200',
  },
  {
    id: 'r2',
    main: '阿峰 评论：这点水深多少？',
    sub: '18 分钟前',
    avBg: '#EAF6FA',
    thumb: 'https://images.unsplash.com/photo-1716947312960-73401605ee50?w=200',
  },
  {
    id: 'r3',
    main: '小陈 报名了你的组队',
    sub: '今天 08:20 · 待审核',
    subAccent: true,
    avBg: '#FFF4E1',
    action: '查看',
  },
  {
    id: 'r4',
    main: '海风 关注了你',
    sub: '昨天',
    avBg: '#EAF5F4',
  },
  {
    id: 'r5',
    main: '系统：钓点审核已通过',
    sub: '昨天 19:42',
    avBg: '#EAF6FA',
  },
]);

const onReadAll = () => uni.showToast({ title: '已全部标记为已读', icon: 'success' });
const onTypeTap = (t: EntryType) => uni.showToast({ title: `${t.label}(待开发)`, icon: 'none' });
const onRowTap = (r: MsgRow) => {
  uni.navigateTo({
    url: `/subpackages/message/conversation/index?peer=${encodeURIComponent(r.main)}`,
  });
};
const onAction = (r: MsgRow) => onRowTap(r);
</script>

<style lang="scss" scoped src="./index.scss"></style>
