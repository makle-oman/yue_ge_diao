<template>
  <view class="conv-page">
    <!-- 顶部聊天导航 -->
    <view class="conv-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="chat-nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back_ios_new" :size="40" color="#1A2B33" />
        </view>
        <view class="nav-avatar" :style="{ background: peer.avBg }">
          <text class="nav-avatar-text">{{ peer.avText }}</text>
        </view>
        <view class="nav-info">
          <text class="nav-title">{{ peer.name }}</text>
          <text class="nav-sub">{{ peer.statusLine }}</text>
        </view>
        <view class="nav-more" @click="onMore">
          <mxy-icon name="more_horiz" :size="48" color="#1A2B33" />
        </view>
      </view>
    </view>

    <!-- 消息流(可滚动) -->
    <scroll-view class="conv-scroll" scroll-y :scroll-into-view="lastMsgId">
      <!-- 安全提示 -->
      <view class="safety-tip">
        <mxy-icon name="verified_user" :size="36" color="#F5A623" />
        <text class="safety-text">私聊仅用于约钓沟通,勿提前转账或离开平台交易</text>
      </view>

      <!-- 日期分隔 -->
      <view class="date-chip">
        <text>今天 09:18</text>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(m, idx) in messages"
        :id="`msg-${idx}`"
        :key="m.id"
        class="msg-row"
        :class="m.from === 'me' ? 'is-mine' : 'is-other'"
      >
        <!-- 引用卡片(组队信息) -->
        <view v-if="m.quote" class="team-quote">
          <view class="quote-bar" />
          <view class="quote-info">
            <text class="quote-title">{{ m.quote.title }}</text>
            <text class="quote-meta">{{ m.quote.meta }}</text>
          </view>
        </view>

        <!-- 文字气泡 -->
        <view v-if="m.text" class="bubble" :class="m.from === 'me' ? 'bubble-mine' : 'bubble-other'">
          <text class="bubble-text">{{ m.text }}</text>
        </view>
      </view>

      <view class="scroll-pad" />
    </scroll-view>

    <!-- 快速回复 + 输入栏 -->
    <view class="conv-foot" :style="{ paddingBottom: safeBottom + 'px' }">
      <scroll-view class="quick-replies" scroll-x :show-scrollbar="false">
        <view
          v-for="q in quickReplies"
          :key="q"
          class="quick-chip"
          @click="onQuickReply(q)"
        >
          <text>{{ q }}</text>
        </view>
      </scroll-view>

      <view class="input-bar">
        <view class="input-plus" @click="onPlus">
          <mxy-icon name="add_circle" :size="52" color="#6B7B85" />
        </view>
        <view class="input-field">
          <input
            v-model="draft"
            class="input-el"
            placeholder="回复消息..."
            placeholder-class="input-placeholder"
            confirm-type="send"
            @confirm="onSend"
          />
        </view>
        <view class="input-send" :class="{ disabled: !draft.trim() }" @click="onSend">
          <mxy-icon name="send" :size="40" color="#fff" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight, safeBottom } = useSystemInfo();

const peer = ref({
  name: '阿峰路亚',
  avText: '阿',
  avBg: '#EAF5F4',
  statusLine: '刚刚在线 · 来自组队约钓',
});

interface Message {
  id: string;
  from: 'me' | 'other';
  text?: string;
  quote?: { title: string; meta: string };
}

const messages = ref<Message[]>([
  {
    id: 'm1',
    from: 'other',
    text: '周六那场还有 1 个名额,你如果能 5 点半到,我给你留位。',
  },
  {
    id: 'm2',
    from: 'other',
    quote: {
      title: '周六清晨一起出钓',
      meta: '燕子矶江边 · 05月25日 05:30 · 还差1人',
    },
  },
  {
    id: 'm3',
    from: 'me',
    text: '可以,我带路亚竿和抄网,到了给你发定位。',
  },
  {
    id: 'm4',
    from: 'other',
    text: '好,报名后我把集合点和停车位置发你。',
  },
]);

const lastMsgId = computed(() => `msg-${messages.value.length - 1}`);

const quickReplies = ref(['发定位', '确认时间', '我已报名']);
const draft = ref('');

const onBack = () => {
  uni.navigateBack({ delta: 1 }).catch(() => {});
};

const onMore = () => {
  uni.showActionSheet({
    itemList: ['查看个人主页', '消息免打扰', '举报', '拉黑'],
    success: () => {},
    fail: () => {},
  });
};

const onQuickReply = (q: string) => {
  draft.value = q;
};

const onPlus = () => {
  uni.showActionSheet({
    itemList: ['发送图片', '发送定位', '相册'],
    success: () => {},
    fail: () => {},
  });
};

const onSend = () => {
  const text = draft.value.trim();
  if (!text) return;
  messages.value.push({
    id: `m${messages.value.length + 1}`,
    from: 'me',
    text,
  });
  draft.value = '';
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
