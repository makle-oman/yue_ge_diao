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

    <scroll-view class="comments-scroll" scroll-y>
      <!-- 帖子摘要卡 -->
      <view class="post-summary">
        <view class="post-thumb">
          <mxy-icon name="image" :size="48" color="#5BA9C4" />
        </view>
        <view class="post-info">
          <text class="post-title">今天燕子矶口还不错,鲫鱼开口很稳</text>
          <text class="post-meta">阿楠 · 2小时前 · 128赞</text>
        </view>
      </view>

      <!-- 排序 tabs -->
      <view class="sort-tabs">
        <view
          v-for="t in tabs"
          :key="t"
          class="sort-tab"
          :class="{ active: tab === t }"
          @click="tab = t"
        >
          <text>{{ t }}</text>
        </view>
      </view>

      <!-- 评论列表卡 -->
      <view class="comment-card">
        <view
          v-for="(c, idx) in comments"
          :key="c.id"
          class="comment-item"
        >
          <view class="comment-row">
            <view class="comment-avatar" :style="{ background: c.avBg }">
              <text class="comment-avatar-text">{{ c.author.charAt(0) }}</text>
            </view>
            <view class="comment-body">
              <view class="comment-head">
                <text class="comment-name">{{ c.author }}</text>
                <text class="comment-like" :class="{ active: c.likedByMe }">👍 {{ c.likes }}</text>
              </view>
              <text class="comment-text">{{ c.text }}</text>
              <view v-if="c.authorReply" class="comment-reply">
                <text>作者回复:{{ c.authorReply }}</text>
              </view>
              <view class="comment-foot" @click="openReply(c)">
                <text>{{ c.time }} · 回复</text>
              </view>
            </view>
          </view>
          <view v-if="idx !== comments.length - 1" class="comment-divider" />
        </view>
      </view>

      <view class="scroll-pad" />
    </scroll-view>

    <!-- 底部评论输入栏 -->
    <view class="comment-input" :style="{ paddingBottom: 'calc(20rpx + ' + safeBottom + 'px)' }">
      <view class="input-field" @click="openReply()">
        <text class="input-placeholder">写评论...</text>
      </view>
      <view class="input-emoji">
        <mxy-icon name="sentiment_satisfied" :size="44" color="#6B7B85" />
      </view>
      <view class="input-send" @click="onQuickSend">
        <text>发</text>
      </view>
    </view>

    <!-- 回复浮层 (Design 31) -->
    <view v-if="replyOpen" class="reply-modal" @click.self="closeReply">
      <view class="reply-scrim" />
      <view class="reply-sheet" @click.stop>
        <view class="sheet-handle" />

        <!-- 头部 -->
        <view class="sheet-header">
          <view class="sheet-cancel" @click="closeReply"><text>取消</text></view>
          <text class="sheet-title">{{ replyTitle }}</text>
          <view class="sheet-send" :class="{ disabled: !canSend }" @click="onSend">
            <text>发送</text>
          </view>
        </view>

        <!-- 引用评论 -->
        <view v-if="replyTarget" class="quoted-comment">
          <view class="quoted-bar" />
          <text class="quoted-text">{{ replyTarget.text }}</text>
        </view>

        <!-- 文本输入 -->
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

        <!-- 工具行 -->
        <view class="sheet-tools">
          <view class="tools-left">
            <mxy-icon name="sentiment_satisfied" :size="44" color="#6B7B85" />
            <mxy-icon name="add_photo_alternate" :size="44" color="#6B7B85" />
            <mxy-icon name="alternate_email" :size="44" color="#6B7B85" />
          </view>
          <text class="tools-count">{{ draft.length }}/200</text>
        </view>

        <!-- 举报入口 -->
        <view v-if="replyTarget" class="more-actions" @click="onReport">
          <mxy-icon name="report" :size="44" color="#F5A623" />
          <view class="action-info">
            <text class="action-title">举报不友善评论</text>
            <text class="action-sub">骚扰、广告、辱骂等内容可提交审核</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const { statusBarHeight, safeBottom } = useSystemInfo();

const totalCount = ref(32);
const sortLabel = ref('最热');
const tab = ref('全部');
const tabs = ['全部', '只看楼主', '最新'];

interface Comment {
  id: string;
  author: string;
  avBg: string;
  text: string;
  likes: number;
  likedByMe?: boolean;
  authorReply?: string;
  time: string;
}

const comments = ref<Comment[]>([
  {
    id: 'c1',
    author: '小周台钓',
    avBg: '#EAF5F4',
    text: '这个位置今天水流怎么样?上次去有点走水。',
    likes: 18,
    likedByMe: true,
    authorReply: '早上还好,8点以后走水明显。',
    time: '12分钟前',
  },
  {
    id: 'c2',
    author: '阿峰路亚',
    avBg: '#EAF6FA',
    text: '翘嘴有口吗?晚上想去试下。',
    likes: 7,
    time: '32分钟前',
  },
  {
    id: 'c3',
    author: '江边老王',
    avBg: '#FFF4E1',
    text: '停车注意别压线,昨天有人被贴单。',
    likes: 3,
    time: '1小时前',
  },
]);

/* ---------- 回复浮层 (Design 31) ---------- */
const replyOpen = ref(false);
const replyTarget = ref<Comment | null>(null);
const draft = ref('');

const replyTitle = computed(() => {
  return replyTarget.value ? `回复${replyTarget.value.author}` : '写评论';
});
const canSend = computed(() => draft.value.trim().length > 0);

const openReply = (target?: Comment) => {
  replyTarget.value = target ?? null;
  draft.value = '';
  replyOpen.value = true;
};

const closeReply = () => {
  replyOpen.value = false;
  draft.value = '';
};

const onSend = () => {
  if (!canSend.value) return;
  comments.value.push({
    id: `c${comments.value.length + 1}`,
    author: '我',
    avBg: '#EAF5F4',
    text: draft.value.trim(),
    likes: 0,
    time: '刚刚',
  });
  totalCount.value += 1;
  uni.showToast({ title: '已发送', icon: 'success' });
  closeReply();
};

/* ---------- 顶部排序 / 底部快速发 / 举报 ---------- */
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onSortMenu = () => {
  uni.showActionSheet({
    itemList: ['最热', '最新', '只看楼主'],
    success: (res) => {
      sortLabel.value = ['最热', '最新', '只看楼主'][res.tapIndex];
    },
    fail: () => {},
  });
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
