<template>
  <view class="comments-page">
    <!-- 顶部状态栏+导航 -->
    <view class="comments-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="comments-nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">评论 {{ totalCount }}</text>
        <view class="nav-sort" @click="onSortMenu">
          <text>{{ sortLabel }}</text>
          <mxy-icon name="expand_more" :size="32" color="#2D8F87" />
        </view>
      </view>
    </view>

    <scroll-view
      class="comments-scroll"
      scroll-y
      @scrolltolower="onReachBottom"
    >
      <!-- 排序 tabs (作为快速切换入口) -->
      <view class="sort-tabs">
        <view
          v-for="t in tabs"
          :key="t.value"
          class="sort-tab"
          :class="{ active: sort === t.value }"
          @click="onPickSort(t.value)"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>

      <!-- 空态 -->
      <view v-if="!loading && parents.length === 0" class="empty">
        <text class="empty-text">暂无评论,来抢个沙发吧 🐟</text>
      </view>

      <!-- 评论列表卡 -->
      <view v-else class="comment-card">
        <view
          v-for="(c, idx) in parents"
          :key="c.id"
          class="comment-item"
        >
          <view class="comment-row" @longpress="onLongPress(c)">
            <view class="comment-avatar" :style="{ background: avatarBg(c) }">
              <image
                v-if="c.userAvatar"
                class="comment-avatar-img"
                :src="c.userAvatar"
                mode="aspectFill"
              />
              <text v-else class="comment-avatar-text">{{ avatarChar(c) }}</text>
            </view>
            <view class="comment-body">
              <view class="comment-head">
                <text class="comment-name">{{ displayName(c) }}</text>
                <text
                  class="comment-like"
                  :class="{ active: c.likedByMe }"
                  @click.stop="toggleLike(c)"
                >👍 {{ c.likeCount }}</text>
              </view>
              <text class="comment-text">{{ c.content }}</text>

              <!-- 二级回复（最多展示前 N 条 + "查看全部"占位） -->
              <view v-if="c.replies && c.replies.length" class="comment-reply">
                <view
                  v-for="r in c.replies"
                  :key="r.id"
                  class="comment-reply-item"
                  @longpress="onLongPress(r)"
                >
                  <text class="comment-reply-name">{{ displayName(r) }}{{ r.isAuthor ? ' (作者)' : '' }}:</text>
                  <text class="comment-reply-text">{{ r.content }}</text>
                </view>
              </view>

              <view class="comment-foot">
                <text @click="openReply(c)">{{ relTime(c.createdAt) }} · 回复</text>
                <text
                  v-if="canDelete(c)"
                  class="comment-del"
                  @click="onDelete(c)"
                >删除</text>
              </view>
            </view>
          </view>
          <view v-if="idx !== parents.length - 1" class="comment-divider" />
        </view>
      </view>

      <view v-if="loadingMore" class="load-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="!nextCursor && parents.length > 0" class="load-more">
        <text>—— 没有更多了 ——</text>
      </view>

      <view class="scroll-pad" />
    </scroll-view>

    <!-- 底部评论输入栏 -->
    <view
      v-if="allowComments"
      class="comment-input"
      :style="{ paddingBottom: 'calc(20rpx + ' + safeBottom + 'px)' }"
    >
      <view class="input-field" @click="openReply()">
        <text class="input-placeholder">写评论...</text>
      </view>
      <view class="input-send" @click="onQuickSend">
        <text>发</text>
      </view>
    </view>
    <view
      v-else
      class="comment-input disabled"
      :style="{ paddingBottom: 'calc(20rpx + ' + safeBottom + 'px)' }"
    >
      <text class="input-placeholder">作者已关闭评论</text>
    </view>

    <!-- 回复浮层 -->
    <view v-if="replyOpen" class="reply-modal" @click.self="closeReply">
      <view class="reply-scrim" />
      <view class="reply-sheet" @click.stop>
        <view class="sheet-handle" />

        <view class="sheet-header">
          <view class="sheet-cancel" @click="closeReply"><text>取消</text></view>
          <text class="sheet-title">{{ replyTitle }}</text>
          <view
            class="sheet-send"
            :class="{ disabled: !canSend || sending }"
            @click="onSend"
          >
            <text>{{ sending ? '发送中' : '发送' }}</text>
          </view>
        </view>

        <view v-if="replyTarget" class="quoted-comment">
          <view class="quoted-bar" />
          <text class="quoted-text">{{ replyTarget.content }}</text>
        </view>

        <view class="text-area-wrap">
          <textarea
            v-model="draft"
            class="text-area"
            placeholder="说点什么..."
            placeholder-class="text-placeholder"
            :maxlength="500"
            :auto-focus="true"
            auto-height
          />
        </view>

        <view class="sheet-tools">
          <view class="tools-left">
            <mxy-icon name="sentiment_satisfied" :size="44" color="#6B7B85" />
          </view>
          <text class="tools-count">{{ draft.length }}/500</text>
        </view>
      </view>
    </view>

    <!-- 评论排序 Sheet -->
    <mxy-bottom-sheet
      v-model:visible="sortOpen"
      title="评论排序"
      @done="onSortDone"
    >
      <view class="sort-current">
        <text class="sort-current-text">当前排序：{{ sortLabel }}</text>
        <mxy-icon name="check_circle" :size="40" color="#2D8F87" />
      </view>

      <view class="sort-options-card">
        <view
          v-for="(opt, i) in sortOptions"
          :key="opt.value"
        >
          <view class="sort-option" @click="onPickDraftSort(opt.value)">
            <view class="sort-option-left">
              <mxy-icon
                :name="opt.icon"
                :size="40"
                :color="opt.value === draftSort ? '#2D8F87' : '#6B7B85'"
              />
              <text
                class="sort-option-text"
                :class="{ active: opt.value === draftSort }"
              >{{ opt.label }}</text>
            </view>
            <mxy-icon
              :name="opt.value === draftSort ? 'check_circle' : 'radio_button_unchecked'"
              :size="40"
              :color="opt.value === draftSort ? '#2D8F87' : '#99A5AD'"
            />
          </view>
          <view v-if="i !== sortOptions.length - 1" class="sort-divider" />
        </view>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  type CommentItem,
  type CommentSort,
  createComment,
  formatRelativeTime,
  likeComment,
  listComments,
  removeComment,
} from '@/api/comments';
import { catchDetail } from '@/api/catches';
import { useAuthStore } from '@/stores/auth';
import { BizError } from '@/utils/request';

const { statusBarHeight, safeBottom } = useSystemInfo();
const authStore = useAuthStore();

const catchId = ref('');
const catchAuthorId = ref<string | null>(null);
const totalCount = ref(0);
const allowComments = ref(true);
const sort = ref<CommentSort>('new');
const sortLabel = computed(() => (sort.value === 'hot' ? '最热' : '最新'));

const tabs: { label: string; value: CommentSort }[] = [
  { label: '最新', value: 'new' },
  { label: '最热', value: 'hot' },
];

const parents = ref<CommentItem[]>([]);
const nextCursor = ref<string | null>(null);
const loading = ref(false);
const loadingMore = ref(false);

const replyOpen = ref(false);
const replyTarget = ref<CommentItem | null>(null);
const draft = ref('');
const sending = ref(false);

const sortOpen = ref(false);
const draftSort = ref<CommentSort>('new');
const sortOptions: { value: CommentSort; label: string; icon: string }[] = [
  { value: 'new', label: '最新', icon: 'schedule' },
  { value: 'hot', label: '最热', icon: 'local_fire_department' },
];

const replyTitle = computed(() => {
  if (replyTarget.value) {
    return `回复 ${displayName(replyTarget.value)}`;
  }
  return '写评论';
});
const canSend = computed(() => draft.value.trim().length > 0);

function displayName(c: CommentItem): string {
  return c.userName || `钓友${c.userId.slice(-4)}`;
}
function avatarChar(c: CommentItem): string {
  return (c.userName || '钓').charAt(0);
}
function avatarBg(c: CommentItem): string {
  const palette = ['#EAF5F4', '#EAF6FA', '#FFF4E1', '#FFF0F0'];
  let h = 0;
  for (const ch of c.userId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
function relTime(iso: string): string {
  return formatRelativeTime(iso);
}
function canDelete(c: CommentItem): boolean {
  const me = authStore.user?.id;
  if (!me) return false;
  if (c.userId === me) return true;
  if (catchAuthorId.value && catchAuthorId.value === me) return true;
  return false;
}

onLoad((options) => {
  catchId.value = String((options as { catchId?: string })?.catchId ?? '');
  if (!catchId.value) {
    uni.showToast({ title: '缺少鱼获 id', icon: 'none' });
    return;
  }
  void loadAuthor();
  void reload();
});

async function loadAuthor() {
  try {
    const d = await catchDetail(catchId.value);
    catchAuthorId.value = d.user.id;
  } catch (e) {
    // 拿不到只影响"鱼获主删别人评论"的权限，不阻塞列表
    console.warn('[comments] load author failed', e);
  }
}

async function reload() {
  loading.value = true;
  parents.value = [];
  nextCursor.value = null;
  try {
    const resp = await listComments({
      catchId: catchId.value,
      sort: sort.value,
      limit: 20,
    });
    parents.value = resp.list;
    nextCursor.value = resp.nextCursor;
    totalCount.value = resp.total;
    allowComments.value = resp.allowComments ?? true;
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '加载失败';
    uni.showToast({ title: msg, icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loadingMore.value || !nextCursor.value) return;
  loadingMore.value = true;
  try {
    const resp = await listComments({
      catchId: catchId.value,
      sort: sort.value,
      cursor: nextCursor.value,
      limit: 20,
    });
    parents.value.push(...resp.list);
    nextCursor.value = resp.nextCursor;
    totalCount.value = resp.total;
  } catch (e) {
    console.warn('[comments] loadMore failed', e);
  } finally {
    loadingMore.value = false;
  }
}

const onReachBottom = () => {
  void loadMore();
};

function onPickSort(v: CommentSort) {
  if (sort.value === v) return;
  sort.value = v;
  void reload();
}

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onSortMenu = () => {
  draftSort.value = sort.value;
  sortOpen.value = true;
};
const onPickDraftSort = (v: CommentSort) => {
  draftSort.value = v;
};
const onSortDone = () => {
  sortOpen.value = false;
  if (draftSort.value !== sort.value) {
    sort.value = draftSort.value;
    void reload();
  }
};

const openReply = (target?: CommentItem) => {
  replyTarget.value = target ?? null;
  draft.value = '';
  replyOpen.value = true;
};
const closeReply = () => {
  replyOpen.value = false;
  draft.value = '';
};
const onQuickSend = () => openReply();

async function onSend() {
  if (!canSend.value || sending.value) return;
  sending.value = true;
  try {
    const created = await createComment({
      catchId: catchId.value,
      content: draft.value.trim(),
      parentId: replyTarget.value?.id,
    });
    // 局部更新：一级直接 unshift；二级追加到父评论 replies 末尾
    if (created.parentId) {
      const parent = parents.value.find((p) => p.id === created.parentId);
      if (parent) {
        parent.replies = parent.replies ? [...parent.replies, created] : [created];
      } else {
        // 父评论不在当前页（hot 排序时可能），整页刷新
        void reload();
      }
    } else {
      parents.value.unshift(created);
    }
    totalCount.value += 1;
    closeReply();
    uni.showToast({ title: '已发送', icon: 'success' });
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '发送失败';
    uni.showToast({ title: msg, icon: 'none' });
  } finally {
    sending.value = false;
  }
}

async function toggleLike(c: CommentItem) {
  const next = c.likedByMe ? 'unlike' : 'like';
  const before = { liked: c.likedByMe, count: c.likeCount };
  c.likedByMe = !c.likedByMe;
  c.likeCount += next === 'like' ? 1 : -1;
  try {
    const resp = await likeComment({ commentId: c.id, action: next });
    c.likeCount = resp.likeCount;
  } catch (e) {
    c.likedByMe = before.liked;
    c.likeCount = before.count;
    console.warn('[comments] like failed', e);
  }
}

function onLongPress(c: CommentItem) {
  if (!canDelete(c)) return;
  uni.showActionSheet({
    itemList: ['删除评论'],
    success: () => void onDelete(c),
    fail: () => {},
  });
}

async function onDelete(c: CommentItem) {
  uni.showModal({
    title: '删除评论',
    content: c.parentId
      ? '确定要删除这条回复吗?'
      : '确定要删除这条评论吗?(其下回复会一同删除)',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        const resp = await removeComment(c.id);
        // 从本地列表移除
        if (c.parentId) {
          const parent = parents.value.find((p) => p.id === c.parentId);
          if (parent && parent.replies) {
            parent.replies = parent.replies.filter((r) => r.id !== c.id);
          }
        } else {
          parents.value = parents.value.filter((p) => p.id !== c.id);
        }
        totalCount.value = resp.commentCount;
        uni.showToast({ title: '已删除', icon: 'success' });
      } catch (e) {
        const msg = e instanceof BizError ? e.msg : '删除失败';
        uni.showToast({ title: msg, icon: 'none' });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
