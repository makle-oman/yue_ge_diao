<template>
  <view class="message-page">
    <!-- 顶部状态栏占位 + 标题栏 -->
    <view class="msg-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="msg-nav" :style="{ paddingRight: capsuleRightWidth + 'px' }">
        <text class="msg-title">消息</text>
        <text class="msg-read-all" @click="onReadAll">全部已读</text>
      </view>
    </view>

    <!-- 滚动内容: 仅列表区可滚动 -->
    <scroll-view
      class="msg-scroll"
      scroll-y
      :refresher-enabled="loggedIn"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
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
            <view
              v-if="t.badge"
              class="msg-type-dot"
              :style="{ minWidth: t.badge.length > 1 ? '32rpx' : '24rpx' }"
            >
              <text class="msg-type-dot-text">{{ t.badge }}</text>
            </view>
          </view>
          <text class="msg-type-label">{{ t.label }}</text>
        </view>
      </view>

      <!-- 最近互动标题 -->
      <view class="msg-section-title">
        <text>{{ currentGroup ? GROUP_LABEL[currentGroup] : '最近互动' }}</text>
        <text v-if="currentGroup" class="msg-section-clear" @click="clearGroup">看全部</text>
      </view>

      <!-- 未登录提示 -->
      <view v-if="!loggedIn" class="msg-empty">
        <text class="msg-empty-text">登录后查看你的消息</text>
        <view class="msg-empty-btn" @click="goLogin">
          <text class="msg-empty-btn-text">去登录</text>
        </view>
      </view>

      <!-- 加载态 / 空态 -->
      <view v-else-if="loading && rows.length === 0" class="msg-empty">
        <text class="msg-empty-text">加载中…</text>
      </view>
      <view v-else-if="rows.length === 0" class="msg-empty">
        <text class="msg-empty-text">{{ currentGroup ? '该分组下还没有消息' : '还没有互动消息' }}</text>
      </view>

      <!-- 互动列表 -->
      <view v-else class="msg-list-card">
        <view
          v-for="(row, idx) in rows"
          :key="row.id"
          class="msg-row"
          @click="onRowTap(row)"
        >
          <view
            v-if="!row.actor?.avatar"
            class="msg-row-av"
            :style="{ background: row.avBg }"
          />
          <image
            v-else
            class="msg-row-av"
            :src="row.actor.avatar"
            mode="aspectFill"
          />

          <view class="msg-row-text">
            <text class="msg-row-main">
              {{ row.actor?.name || '匿名钓友' }} {{ row.actionText }}
              <text v-if="!row.readAt" class="msg-row-dot">●</text>
            </text>
            <text class="msg-row-sub" :class="{ accent: !row.readAt }">
              {{ row.timeText }}<template v-if="row.excerpt"> · {{ row.excerpt }}</template>
            </text>
          </view>

          <image
            v-if="row.thumb"
            class="msg-row-thumb"
            :src="row.thumb"
            mode="aspectFill"
          />

          <view v-if="idx !== rows.length - 1" class="msg-row-divider" />
        </view>

        <view v-if="loadingMore" class="msg-foot">
          <text class="msg-foot-text">加载中…</text>
        </view>
        <view v-else-if="!hasMore && rows.length > 0" class="msg-foot">
          <text class="msg-foot-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <CustomTabBar current="message" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import { isLoggedIn } from '@/utils/auth';
import {
  getUnreadCount,
  listNotifications,
  markNotificationsRead,
  notificationActionText,
  notificationCover,
  notificationExcerpt,
  notificationTargetPath,
  NOTIFICATION_GROUP_LABEL,
  type NotificationGroup,
  type NotificationItem,
  type UnreadCount,
} from '@/api/notifications';
import CustomTabBar from '@/components/CustomTabBar.vue';

interface EntryType {
  key: NotificationGroup;
  label: string;
  icon: string;
  color: string;
  bg: string;
  badge?: string;
}

interface MsgRow {
  id: string;
  group: NotificationGroup;
  actor: { name: string | null; avatar: string | null } | null;
  actionText: string;
  excerpt: string;
  timeText: string;
  readAt: string | null;
  thumb?: string;
  avBg: string;
  target: string | null;
  raw: NotificationItem;
}

const { statusBarHeight, capsuleRightWidth } = useSystemInfo();
const GROUP_LABEL = NOTIFICATION_GROUP_LABEL;

const loggedIn = ref(isLoggedIn());
const loading = ref(false);
const loadingMore = ref(false);
const refreshing = ref(false);
const rows = ref<MsgRow[]>([]);
const nextCursor = ref<string | null>(null);
const hasMore = ref(false);
const currentGroup = ref<NotificationGroup | null>(null);
const unread = ref<UnreadCount>({
  total: 0,
  byGroup: { comment: 0, like: 0, team: 0, system: 0 },
});

const ENTRY_BG: Record<NotificationGroup, { bg: string; color: string; icon: string; label: string }> = {
  comment: { bg: '#FFF4E1', color: '#F5A623', icon: 'alternate_email', label: '评论' },
  like:    { bg: '#FFF0F0', color: '#FF6B6B', icon: 'favorite',        label: '赞和收藏' },
  team:    { bg: '#EAF6FA', color: '#5BA9C4', icon: 'groups',          label: '组队' },
  system:  { bg: '#EAF5F4', color: '#2D8F87', icon: 'campaign',        label: '系统' },
};

const entryTypes = computed<EntryType[]>(() => {
  return (Object.keys(ENTRY_BG) as NotificationGroup[]).map((key) => {
    const n = unread.value.byGroup[key] ?? 0;
    return {
      key,
      label: ENTRY_BG[key].label,
      icon: ENTRY_BG[key].icon,
      color: ENTRY_BG[key].color,
      bg: ENTRY_BG[key].bg,
      badge: n > 0 ? (n > 99 ? '99+' : String(n)) : undefined,
    };
  });
});

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return Math.floor(diff / 60_000) + ' 分钟前';
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + ' 小时前';
  if (diff < 7 * 86_400_000) return Math.floor(diff / 86_400_000) + ' 天前';
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function toRow(n: NotificationItem): MsgRow {
  const cover = notificationCover(n);
  return {
    id: n.id,
    group: n.group,
    actor: n.actor ? { name: n.actor.name, avatar: n.actor.avatar } : null,
    actionText: notificationActionText(n),
    excerpt: notificationExcerpt(n),
    timeText: timeAgo(n.createdAt),
    readAt: n.readAt,
    thumb: cover ?? undefined,
    avBg: ENTRY_BG[n.group]?.bg ?? '#EAF5F4',
    target: notificationTargetPath(n),
    raw: n,
  };
}

async function refreshUnread() {
  if (!loggedIn.value) return;
  try {
    unread.value = await getUnreadCount();
  } catch {
    // 容错:UI 不阻塞
  }
}

async function loadFirstPage(group: NotificationGroup | null = currentGroup.value) {
  if (!loggedIn.value) {
    rows.value = [];
    hasMore.value = false;
    nextCursor.value = null;
    return;
  }
  loading.value = true;
  try {
    const r = await listNotifications({ group: group ?? undefined, limit: 20 });
    rows.value = r.list.map(toRow);
    nextCursor.value = r.nextCursor;
    hasMore.value = r.hasMore;
  } catch (e) {
    console.warn('[message] list failed', e);
  } finally {
    loading.value = false;
  }
}

async function onLoadMore() {
  if (!loggedIn.value || loadingMore.value || !hasMore.value || !nextCursor.value) return;
  loadingMore.value = true;
  try {
    const r = await listNotifications({
      group: currentGroup.value ?? undefined,
      cursor: nextCursor.value,
      limit: 20,
    });
    rows.value = rows.value.concat(r.list.map(toRow));
    nextCursor.value = r.nextCursor;
    hasMore.value = r.hasMore;
  } catch (e) {
    console.warn('[message] load more failed', e);
  } finally {
    loadingMore.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  try {
    await Promise.all([refreshUnread(), loadFirstPage()]);
  } finally {
    refreshing.value = false;
  }
}

async function onReadAll() {
  if (!loggedIn.value) {
    goLogin();
    return;
  }
  try {
    const payload = currentGroup.value
      ? { all: true, group: currentGroup.value }
      : { all: true };
    const r = await markNotificationsRead(payload);
    uni.showToast({
      title: r.updated > 0 ? `已标记 ${r.updated} 条` : '已全部已读',
      icon: 'success',
    });
    rows.value = rows.value.map((row) =>
      currentGroup.value && row.group !== currentGroup.value
        ? row
        : { ...row, readAt: row.readAt ?? new Date().toISOString() },
    );
    await refreshUnread();
  } catch (e) {
    console.warn('[message] read all failed', e);
  }
}

function onTypeTap(t: EntryType) {
  currentGroup.value = t.key;
  loadFirstPage(t.key);
}

function clearGroup() {
  currentGroup.value = null;
  loadFirstPage(null);
}

async function onRowTap(row: MsgRow) {
  // 单条标记已读(本地立即变灰 + 后端 fire-and-forget)
  if (!row.readAt) {
    row.readAt = new Date().toISOString();
    markNotificationsRead({ ids: [row.id] })
      .then(() => refreshUnread())
      .catch(() => undefined);
  }
  if (row.target) {
    uni.navigateTo({ url: row.target });
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' }).catch(() => {
    uni.showToast({ title: '请先登录', icon: 'none' });
  });
}

onMounted(() => {
  loggedIn.value = isLoggedIn();
  void onRefresh();
});

onShow(() => {
  loggedIn.value = isLoggedIn();
  if (loggedIn.value) {
    void refreshUnread();
  }
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
