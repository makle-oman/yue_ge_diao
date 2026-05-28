<template>
  <view class="comments-page">
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

    <scroll-view class="comments-scroll" scroll-y @scrolltolower="loadMore">
      <view class="post-summary">
        <view class="post-thumb">
          <image v-if="post.cover" class="post-thumb-img" :src="post.cover" mode="aspectFill" />
          <mxy-icon v-else name="image" :size="48" color="#5BA9C4" />
        </view>
        <view class="post-info">
          <text class="post-title">{{ post.title }}</text>
          <text class="post-meta">{{ post.meta }}</text>
        </view>
      </view>

      <view class="sort-tabs">
        <view
          v-for="t in tabs"
          :key="t.key"
          class="sort-tab"
          :class="{ active: tab === t.key }"
          @click="onTab(t.key)"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>

      <view class="comment-card">
        <view
          v-for="(c, idx) in comments"
          :key="c.id"
          class="comment-item"
        >
          <view class="comment-row">
            <view class="comment-avatar" :style="{ background: c.avBg }">
              <image v-if="c.avatar" class="comment-avatar-img" :src="c.avatar" mode="aspectFill" />
              <text v-else class="comment-avatar-text">{{ c.author.charAt(0) }}</text>
            </view>
            <view class="comment-body">
              <view class="comment-head">
                <text class="comment-name">{{ c.author }}</text>
                <text class="comment-like" :class="{ active: c.likedByMe }" @click.stop="onLike(c)">赞 {{ c.likes }}</text>
              </view>
              <text class="comment-text">{{ c.text }}</text>
              <view v-if="c.authorReply" class="comment-reply">
                <text>{{ c.authorReply }}</text>
              </view>
              <view class="comment-foot" @click="openReply(c)">
                <text>{{ c.time }} · 回复</text>
              </view>
            </view>
          </view>
          <view v-if="idx !== comments.length - 1" class="comment-divider" />
        </view>
        <view v-if="!loading && comments.length === 0" class="comment-empty">
          <text>{{ catchId ? '还没有评论，来坐第一排' : '缺少鱼获 id，无法加载评论' }}</text>
        </view>
        <view v-if="loading" class="comment-empty">
          <text>加载中...</text>
        </view>
        <view v-else-if="hasMore" class="comment-empty" @click="loadMore">
          <text>加载更多</text>
        </view>
      </view>

      <view class="scroll-pad" />
    </scroll-view>

    <view class="comment-input" :style="{ paddingBottom: 'calc(20rpx + ' + safeBottom + 'px)' }">
      <view class="input-field" @click="openReply()">
        <text class="input-placeholder">{{ allowComments ? '写评论...' : '该鱼获已关闭评论' }}</text>
      </view>
      <view class="input-emoji">
        <mxy-icon name="sentiment_satisfied" :size="44" color="#6B7B85" />
      </view>
      <view class="input-send" @click="onQuickSend">
        <text>发</text>
      </view>
    </view>

    <view v-if="replyOpen" class="reply-modal" @click.self="closeReply">
      <view class="reply-scrim" />
      <view class="reply-sheet" @click.stop>
        <view class="sheet-handle" />

        <view class="sheet-header">
          <view class="sheet-cancel" @click="closeReply"><text>取消</text></view>
          <text class="sheet-title">{{ replyTitle }}</text>
          <view class="sheet-send" :class="{ disabled: !canSend }" @click="onSend">
            <text>发送</text>
          </view>
        </view>

        <view v-if="replyTarget" class="quoted-comment">
          <view class="quoted-bar" />
          <text class="quoted-text">{{ replyTarget.text }}</text>
        </view>

        <view class="text-area-wrap">
          <textarea
            v-model="draft"
            class="text-area"
            placeholder="说点什么..."
            placeholder-class="text-placeholder"
            :maxlength="200"
            :auto-focus="true"
            auto-height
          />
        </view>

        <view class="sheet-tools">
          <view class="tools-left">
            <mxy-icon name="sentiment_satisfied" :size="44" color="#6B7B85" />
            <mxy-icon name="add_photo_alternate" :size="44" color="#6B7B85" />
            <mxy-icon name="alternate_email" :size="44" color="#6B7B85" />
          </view>
          <text class="tools-count">{{ draft.length }}/200</text>
        </view>

        <view v-if="replyTarget" class="more-actions" @click="onReport">
          <mxy-icon name="report" :size="44" color="#F5A623" />
          <view class="action-info">
            <text class="action-title">举报不友善评论</text>
            <text class="action-sub">骚扰、广告、辱骂等内容可提交审核</text>
          </view>
        </view>
      </view>
    </view>

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
          <view class="sort-option" @click="onPickSort(opt.value)">
            <view class="sort-option-left">
              <mxy-icon :name="opt.icon" :size="40" :color="opt.value === draftSort ? '#2D8F87' : '#6B7B85'" />
              <text class="sort-option-text" :class="{ active: opt.value === draftSort }">{{ opt.label }}</text>
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

      <view class="sort-tip">
        <mxy-icon name="tune" :size="36" color="#5BA9C4" />
        <text class="sort-tip-text">排序只作用于当前鱼获的评论列表。</text>
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
  createComment,
  likeComment,
  listComments,
  type CommentItem,
  type CommentSort,
} from '@/api/comments';
import { catchDetail, formatTime, type CatchDetail } from '@/api/catches';

const { statusBarHeight, safeBottom } = useSystemInfo();

type TabKey = 'all' | 'author' | 'new';
type SortKey = 'hot' | 'new';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  avBg: string;
  text: string;
  likes: number;
  likedByMe: boolean;
  authorReply: string;
  time: string;
  isAuthor: boolean;
  source: CommentItem;
}

const catchId = ref('');
const totalCount = ref(0);
const allowComments = ref(true);
const loading = ref(false);
const hasMore = ref(false);
const cursor = ref<string | null>(null);
const rawComments = ref<CommentItem[]>([]);

const tab = ref<TabKey>('all');
const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'author', label: '只看楼主' },
  { key: 'new', label: '最新' },
];

const sort = ref<CommentSort>('hot');
const sortLabel = computed(() => (sort.value === 'hot' ? '最热' : '最新'));

const post = ref({
  cover: '',
  title: '鱼获评论',
  meta: '',
});

const comments = computed<Comment[]>(() => {
  const list = tab.value === 'author'
    ? rawComments.value.filter((item) => item.isAuthor || (item.replies || []).some((reply) => reply.isAuthor))
    : rawComments.value;
  return list.map(adaptComment);
});

function adaptComment(item: CommentItem): Comment {
  const authorReply = (item.replies || [])
    .map((reply) => `${reply.isAuthor ? '作者' : reply.userName || '钓友'}：${reply.content}`)
    .join('\n');
  return {
    id: item.id,
    author: item.userName || `钓友${item.userId.slice(-4)}`,
    avatar: item.userAvatar || '',
    avBg: item.isAuthor ? '#EAF5F4' : '#EAF6FA',
    text: item.content,
    likes: item.likeCount,
    likedByMe: item.likedByMe,
    authorReply,
    time: formatTime(item.createdAt),
    isAuthor: item.isAuthor,
    source: item,
  };
}

function applyPostDetail(detail: CatchDetail) {
  post.value = {
    cover: detail.cover || detail.photos[0] || '',
    title: detail.content || detail.fishSpecies.join(' / ') || '鱼获详情',
    meta: [
      detail.user.nickname || `钓友${detail.user.id.slice(-4)}`,
      formatTime(detail.createdAt),
      `${detail.likeCount} 赞`,
    ].join(' · '),
  };
  totalCount.value = detail.commentCount;
  allowComments.value = detail.allowComments;
}

async function loadPostDetail() {
  if (!catchId.value) return;
  try {
    applyPostDetail(await catchDetail(catchId.value));
  } catch (e) {
    console.warn('[comments] load post detail failed', e);
  }
}

async function loadList(reset = false) {
  if (!catchId.value || loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      rawComments.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
    const resp = await listComments({
      catchId: catchId.value,
      sort: sort.value,
      limit: 20,
      cursor: cursor.value,
    });
    rawComments.value = reset ? resp.list : rawComments.value.concat(resp.list);
    totalCount.value = resp.total;
    allowComments.value = resp.allowComments ?? allowComments.value;
    cursor.value = resp.nextCursor;
    hasMore.value = !!resp.nextCursor;
  } catch (e: any) {
    console.warn('[comments] load failed', e);
    uni.showToast({ title: e?.msg || '加载评论失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  void loadList(false);
}

function onTab(next: TabKey) {
  if (tab.value === next) return;
  tab.value = next;
  const nextSort: CommentSort = next === 'new' ? 'new' : 'hot';
  if (sort.value !== nextSort) {
    sort.value = nextSort;
    void loadList(true);
  }
}

onLoad((options) => {
  catchId.value = String((options as { id?: string; catchId?: string })?.id || (options as { catchId?: string })?.catchId || '');
  if (!catchId.value) {
    uni.showToast({ title: '缺少鱼获 id', icon: 'none' });
    return;
  }
  void loadPostDetail();
  void loadList(true);
});

const replyOpen = ref(false);
const replyTarget = ref<Comment | null>(null);
const draft = ref('');

const replyTitle = computed(() => (replyTarget.value ? `回复${replyTarget.value.author}` : '写评论'));
const canSend = computed(() => allowComments.value && draft.value.trim().length > 0);

const openReply = (target?: Comment) => {
  if (!allowComments.value) {
    uni.showToast({ title: '该鱼获已关闭评论', icon: 'none' });
    return;
  }
  replyTarget.value = target ?? null;
  draft.value = '';
  replyOpen.value = true;
};

const closeReply = () => {
  replyOpen.value = false;
  draft.value = '';
};

const onSend = async () => {
  if (!canSend.value || !catchId.value) return;
  try {
    await createComment({
      catchId: catchId.value,
      content: draft.value.trim(),
      parentId: replyTarget.value?.id,
    });
    uni.showToast({ title: '已发送', icon: 'success' });
    closeReply();
    await loadList(true);
    void loadPostDetail();
  } catch (e) {
    console.warn('[comments] create failed', e);
  }
};

async function onLike(comment: Comment) {
  const beforeLiked = comment.source.likedByMe;
  const beforeCount = comment.source.likeCount;
  const action = beforeLiked ? 'unlike' : 'like';
  comment.source.likedByMe = !beforeLiked;
  comment.source.likeCount = Math.max(0, beforeCount + (action === 'like' ? 1 : -1));
  try {
    const resp = await likeComment(comment.id, action);
    comment.source.likeCount = resp.likeCount;
  } catch (e) {
    comment.source.likedByMe = beforeLiked;
    comment.source.likeCount = beforeCount;
    console.warn('[comments] like failed', e);
  }
}

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});

const sortOptions: { value: SortKey; label: string; icon: string }[] = [
  { value: 'hot', label: '最热', icon: 'local_fire_department' },
  { value: 'new', label: '最新', icon: 'schedule' },
];
const sortOpen = ref(false);
const draftSort = ref<SortKey>('hot');

const onSortMenu = () => {
  draftSort.value = sort.value as SortKey;
  sortOpen.value = true;
};
const onPickSort = (v: SortKey) => {
  draftSort.value = v;
};
const onSortDone = () => {
  sort.value = draftSort.value;
  tab.value = sort.value === 'new' ? 'new' : 'all';
  sortOpen.value = false;
  void loadList(true);
};
const onQuickSend = () => openReply();
const onReport = () => {
  uni.showActionSheet({
    itemList: ['辱骂攻击', '广告引流', '诈骗信息', '其他'],
    success: () => {
      uni.showToast({ title: '已提交审核', icon: 'success' });
      closeReply();
    },
    fail: () => {},
  });
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
