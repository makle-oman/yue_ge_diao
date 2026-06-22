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
    <scroll-view
      class="conv-scroll"
      scroll-y
      scroll-with-animation
      :scroll-into-view="scrollAnchor"
      :scroll-top="scrollTop"
    >
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
        <view
          v-if="m.location"
          class="location-card"
          :class="m.from === 'me' ? 'location-mine' : 'location-other'"
          @click="onOpenLocation(m.location)"
        >
          <view class="location-map">
            <mxy-icon name="location_on" :size="44" color="#2D8F87" />
          </view>
          <view class="location-info">
            <text class="location-title">{{ m.location.name || '我的位置' }}</text>
            <text class="location-sub">{{ m.location.address || m.locationText }}</text>
          </view>
        </view>

        <view
          v-else-if="m.media"
          class="media-card"
          :class="m.from === 'me' ? 'media-mine' : 'media-other'"
        >
          <image
            v-if="m.media.type === 'image'"
            class="media-image"
            :src="m.media.url"
            mode="widthFix"
            @load="scrollToBottom"
            @click="onPreviewImage(m.media.url)"
          />
          <video
            v-else
            class="media-video"
            :src="m.media.url"
            controls
            :show-center-play-btn="true"
            :show-fullscreen-btn="true"
            @loadedmetadata="scrollToBottom"
          />
        </view>

        <view v-else-if="m.text" class="bubble" :class="m.from === 'me' ? 'bubble-mine' : 'bubble-other'">
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

    <!-- 聊天更多操作 (Design 36) -->
    <mxy-bottom-sheet
      v-model:visible="timeOpen"
      title="确认时间"
      done-text="发送"
      @done="onSendPickedTime"
    >
      <view class="time-sheet">
        <view class="time-current">
          <text class="time-current-label">已选时间</text>
          <text class="time-current-value">{{ pickedDateLabel }} {{ pickedTime }}</text>
        </view>
        <picker-view
          class="time-picker"
          indicator-style="height: 88rpx;"
          :value="timePickerValue"
          @change="onTimePickerChange"
        >
          <picker-view-column>
            <view
              v-for="item in dateOptions"
              :key="item.value"
              class="time-picker-item"
            >
              <text>{{ item.label }} {{ item.text }}</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view
              v-for="item in hourOptions"
              :key="item"
              class="time-picker-item"
            >
              <text>{{ item }} 时</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view
              v-for="item in minuteOptions"
              :key="item"
              class="time-picker-item"
            >
              <text>{{ item }} 分</text>
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </mxy-bottom-sheet>

    <mxy-bottom-sheet
      v-model:visible="joinedOpen"
      title="选择已报名组队"
      done-text="关闭"
      @done="joinedOpen = false"
    >
      <view class="joined-sheet">
        <view v-if="joinedLoading" class="joined-empty">
          <text>加载中...</text>
        </view>
        <view v-else-if="joinedTeams.length === 0" class="joined-empty">
          <text>暂无已报名组队</text>
        </view>
        <view v-else class="joined-list">
          <view
            v-for="team in joinedTeams"
            :key="team.id"
            class="joined-item"
            @click="onSendJoinedTeam(team)"
          >
            <view class="joined-item-main">
              <text class="joined-title">{{ team.title }}</text>
              <text class="joined-meta">{{ joinedTeamMeta(team) }}</text>
            </view>
            <view class="joined-badge" :class="{ pending: team.yourMemberStatus === 'pending' }">
              <text>{{ team.yourMemberStatus === 'pending' ? '待审核' : '已报名' }}</text>
            </view>
          </view>
        </view>
      </view>
    </mxy-bottom-sheet>

    <mxy-bottom-sheet
      v-model:visible="moreOpen"
      title="聊天设置"
      @done="moreOpen = false"
    >
      <view class="more-banner">
        <text class="more-banner-text">{{ peer.name }} · 组队私聊</text>
        <mxy-icon name="verified_user" :size="40" color="#2D8F87" />
      </view>

      <view class="more-actions-card">
        <view class="more-row" @click="onChatViewProfile">
          <view class="more-row-left">
            <mxy-icon name="person" :size="40" color="#1A2B33" />
            <text class="more-row-text">查看个人主页</text>
          </view>
          <mxy-icon name="chevron_right" :size="36" color="#99A5AD" />
        </view>
        <view class="more-divider" />

        <view class="more-row" @click="muted = !muted">
          <view class="more-row-left">
            <mxy-icon name="notifications_off" :size="40" color="#1A2B33" />
            <text class="more-row-text">消息免打扰</text>
          </view>
          <view class="more-switch" :class="{ on: muted }">
            <view class="more-switch-dot" />
          </view>
        </view>
        <view class="more-divider" />

        <view class="more-row" @click="onChatReport">
          <view class="more-row-left">
            <mxy-icon name="report" :size="40" color="#FF6B6B" />
            <text class="more-row-text danger">举报</text>
          </view>
          <mxy-icon name="chevron_right" :size="36" color="#99A5AD" />
        </view>
        <view class="more-divider" />

        <view class="more-row" @click="onChatBlock">
          <view class="more-row-left">
            <mxy-icon name="block" :size="40" color="#FF6B6B" />
            <text class="more-row-text danger">拉黑</text>
          </view>
          <mxy-icon name="chevron_right" :size="36" color="#99A5AD" />
        </view>
      </view>

      <view class="more-tip">
        <mxy-icon name="shield" :size="36" color="#5BA9C4" />
        <text class="more-tip-text">私聊安全设置只影响当前会话，举报和拉黑提交后可在设置中管理。</text>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app';
import { fetchMessageHistory, sendMessage, type MessageItem, type MessageType } from '@/api/messages';
import { teamDetail, listUserTeams, formatTeamWhen, type TeamListItem } from '@/api/teams';
import { fetchUserDetail } from '@/api/users';
import { env } from '@/config/env';
import { getToken } from '@/utils/auth';
import { useSystemInfo } from '@/utils/useSystemInfo';
import { uploadFile, uploadImages } from '@/utils/upload';

const { statusBarHeight, safeBottom } = useSystemInfo();

const peerId = ref('');
const teamId = ref('');
const peer = ref({
  name: '钓友',
  avText: '钓',
  avBg: '#EAF5F4',
  statusLine: '私信会话',
});

interface Message {
  id: string;
  from: 'me' | 'other';
  text?: string;
  location?: LocationPayload;
  locationText?: string;
  media?: MediaPayload;
  quote?: { title: string; meta: string };
}

interface LocationPayload {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

interface MediaPayload {
  type: 'image' | 'video';
  url: string;
  mime?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface UniLocationAddress {
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNum?: string;
  poiName?: string;
}

interface UniLocationResult {
  latitude: number;
  longitude: number;
  address?: UniLocationAddress;
}

interface NominatimAddress {
  amenity?: string;
  park?: string;
  tourism?: string;
  road?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  county?: string;
  state?: string;
}

interface NominatimReverseResp {
  display_name?: string;
  name?: string;
  address?: NominatimAddress;
}

const messages = ref<Message[]>([]);

const scrollAnchor = ref('');
const scrollTop = ref(0);

function scrollToBottom() {
  void nextTick(() => {
    const lastIndex = messages.value.length - 1;
    if (lastIndex < 0) return;
    scrollAnchor.value = '';
    scrollTop.value += 100000;
    setTimeout(() => {
      scrollAnchor.value = `msg-${lastIndex}`;
      scrollTop.value += 100000;
    }, 50);
  });
}

const quickReplies = ref(['发定位', '确认时间', '我已报名']);
const draft = ref('');
const timeOpen = ref(false);
const dateOptions = computed(() => Array.from({ length: 30 }, (_, offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return {
    label: offset === 0 ? '今天' : offset === 1 ? '明天' : offset === 2 ? '后天' : `${date.getMonth() + 1}月${date.getDate()}日`,
    text: `${date.getMonth() + 1}/${date.getDate()}`,
    value: formatDateInput(date),
  };
}));
const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const initialPickedAt = nextFishingDateTime(new Date());
const pickedDate = ref(formatDateInput(initialPickedAt));
const pickedTime = ref(formatTimeInput(initialPickedAt));
const timePickerValue = ref([optionIndexForDate(pickedDate.value), initialPickedAt.getHours(), initialPickedAt.getMinutes()]);
const pickedDateLabel = computed(() => dateOptions.value.find((item) => item.value === pickedDate.value)?.label || pickedDate.value);
const joinedOpen = ref(false);
const joinedLoading = ref(false);
const joinedTeams = ref<TeamListItem[]>([]);
const loading = ref(false);
const sending = ref(false);
let syncTimer: ReturnType<typeof setInterval> | null = null;
let syncing = false;
let socketTask: MessageSocketTask | null = null;
let socketOpen = false;
let socketConnecting = false;
let pageActive = false;

interface MessageSocketTask {
  onOpen(fn: () => void): void;
  onMessage(fn: (res: { data: string | ArrayBuffer }) => void): void;
  onClose(fn: () => void): void;
  onError(fn: () => void): void;
  send(options: { data: string; success?: () => void; fail?: (err: unknown) => void }): void;
  close(options?: { code?: number; reason?: string }): void;
}

interface SocketEnvelope<T = unknown> {
  event?: string;
  data?: T;
}

function peerName(id: string, nickname: string | null): string {
  return nickname || `钓友${id.slice(-4)}`;
}

function toUiMessage(m: MessageItem): Message {
  const location = m.type === 'location' ? parseLocation(m.content) : null;
  const media = m.type === 'image' || m.type === 'video' ? parseMedia(m.type, m.content) : null;
  return {
    id: m.id,
    from: m.fromId === peerId.value ? 'other' : 'me',
    text: location || media ? undefined : m.content,
    location: location ?? undefined,
    locationText: location ? (location.address || '点击查看地图位置') : undefined,
    media: media ?? undefined,
  };
}

function mergeMessages(list: MessageItem[]) {
  const oldIds = new Set(messages.value.map((m) => m.id));
  const next = list.map(toUiMessage).filter((m) => !oldIds.has(m.id));
  if (next.length) {
    messages.value = messages.value.concat(next);
    scrollToBottom();
  }
}

async function loadConversation() {
  if (!peerId.value || loading.value) return;
  loading.value = true;
  try {
    const [profile, history] = await Promise.all([
      fetchUserDetail(peerId.value),
      fetchMessageHistory({ peerId: peerId.value, limit: 50 }),
    ]);
    const name = peerName(profile.id, profile.nickname);
    peer.value = {
      name,
      avText: name.slice(0, 1) || '钓',
      avBg: '#EAF5F4',
      statusLine: profile.city ? `${profile.city} · 私信会话` : '私信会话',
    };
    messages.value = history.list.map(toUiMessage);
    scrollToBottom();
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '会话加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function syncConversation() {
  if (!peerId.value || loading.value || syncing) return;
  syncing = true;
  try {
    const history = await fetchMessageHistory({ peerId: peerId.value, limit: 50 });
    mergeMessages(history.list);
  } catch (_) {
  } finally {
    syncing = false;
  }
}

function startSync() {
  if (syncTimer || socketOpen) return;
  syncTimer = setInterval(() => {
    void syncConversation();
  }, 2500);
}

function stopSync() {
  if (!syncTimer) return;
  clearInterval(syncTimer);
  syncTimer = null;
}

function socketUrl(): string {
  const base = env.apiBaseUrl.replace(/\/api\/?$/, '').replace(/^http/, 'ws');
  return `${base}/ws/messages?token=${encodeURIComponent(getToken())}`;
}

function createBrowserSocketTask(url: string): MessageSocketTask | null {
  if (typeof WebSocket === 'undefined') return null;
  let socket: WebSocket;
  try {
    socket = new WebSocket(url);
  } catch (_) {
    return null;
  }
  return {
    onOpen(fn) {
      socket.addEventListener('open', () => fn());
    },
    onMessage(fn) {
      socket.addEventListener('message', (event) => fn({ data: event.data }));
    },
    onClose(fn) {
      socket.addEventListener('close', () => fn());
    },
    onError(fn) {
      socket.addEventListener('error', () => fn());
    },
    send(options) {
      if (socket.readyState !== WebSocket.OPEN) {
        options.fail?.(new Error('WebSocket is not open'));
        return;
      }
      socket.send(options.data);
      options.success?.();
    },
    close(options) {
      socket.close(options?.code, options?.reason);
    },
  };
}

function createUniSocketTask(url: string): MessageSocketTask | null {
  let task: Partial<MessageSocketTask>;
  try {
    task = uni.connectSocket({ url }) as unknown as Partial<MessageSocketTask>;
  } catch (_) {
    return null;
  }
  if (
    typeof task?.onOpen !== 'function' ||
    typeof task.onMessage !== 'function' ||
    typeof task.onClose !== 'function' ||
    typeof task.onError !== 'function' ||
    typeof task.send !== 'function' ||
    typeof task.close !== 'function'
  ) {
    return null;
  }
  return task as MessageSocketTask;
}

function isMessageItem(value: unknown): value is MessageItem {
  const item = value as Partial<MessageItem> | null;
  return !!item
    && typeof item === 'object'
    && typeof item.id === 'string'
    && typeof item.fromId === 'string'
    && typeof item.toId === 'string'
    && typeof item.content === 'string';
}

function handleSocketMessage(raw: string | ArrayBuffer) {
  try {
    const text = typeof raw === 'string' ? raw : String.fromCharCode(...new Uint8Array(raw));
    const msg = JSON.parse(text) as SocketEnvelope;
    if (msg.event === 'message:new' && isMessageItem(msg.data)) {
      if (msg.data.fromId === peerId.value || msg.data.toId === peerId.value) {
        mergeMessages([msg.data]);
      }
      return;
    }
    if (msg.event === 'message:error') {
      const data = msg.data as { msg?: string } | undefined;
      uni.showToast({ title: data?.msg || '发送失败', icon: 'none' });
    }
  } catch (_) {
  }
}

function connectSocket() {
  if (!peerId.value || !getToken() || socketTask || socketOpen || socketConnecting) return;
  socketConnecting = true;
  const url = socketUrl();
  const task = createBrowserSocketTask(url) ?? createUniSocketTask(url);
  if (!task) {
    socketConnecting = false;
    startSync();
    return;
  }
  socketTask = task;
  task.onOpen(() => {
    socketOpen = true;
    socketConnecting = false;
    stopSync();
  });
  task.onMessage((res) => handleSocketMessage(res.data));
  task.onClose(() => {
    socketOpen = false;
    socketConnecting = false;
    socketTask = null;
    if (pageActive) startSync();
  });
  task.onError(() => {
    socketOpen = false;
    socketConnecting = false;
    socketTask = null;
    if (pageActive) startSync();
  });
}

function closeSocket() {
  const task = socketTask;
  socketTask = null;
  socketOpen = false;
  socketConnecting = false;
  if (!task) return;
  try {
    task.close({ code: 1000, reason: 'page leave' });
  } catch (_) {
  }
}

function sendBySocket(payload: { content: string; type?: MessageType }): Promise<boolean> {
  if (!socketTask || !socketOpen) return Promise.resolve(false);
  return new Promise((resolve) => {
    socketTask?.send({
      data: JSON.stringify({
        event: 'message:send',
        data: { toUserId: peerId.value, content: payload.content, type: payload.type },
      }),
      success: () => resolve(true),
      fail: () => resolve(false),
    });
  });
}

onLoad((options) => {
  pageActive = true;
  const o = options as { id?: string; peer?: string; peerId?: string; teamId?: string };
  peerId.value = String(o.id || o.peer || o.peerId || '');
  teamId.value = String(o.teamId || '');
  if (!peerId.value) {
    uni.showToast({ title: '缺少会话用户', icon: 'none' });
    setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 600);
    return;
  }
  void loadConversation().then(() => {
    connectSocket();
    startSync();
  });
});

onShow(() => {
  pageActive = true;
  if (peerId.value) {
    void syncConversation();
    connectSocket();
    startSync();
  }
});

onHide(() => {
  pageActive = false;
  closeSocket();
  stopSync();
});
onUnload(() => {
  pageActive = false;
  closeSocket();
  stopSync();
});

const onBack = () => {
  uni.navigateBack({ delta: 1 }).catch(() => {});
};

const onMore = () => {
  moreOpen.value = true;
};

const moreOpen = ref(false);
const muted = ref(false);

const onChatViewProfile = () => {
  moreOpen.value = false;
  if (!peerId.value) return;
  uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${peerId.value}` })
    .catch(() => {});
};
const onChatReport = () => {
  moreOpen.value = false;
  uni.showActionSheet({
    itemList: ['辱骂攻击', '广告引流', '诈骗信息', '其他'],
    success: () => uni.showToast({ title: '已提交审核', icon: 'success' }),
    fail: () => {},
  });
};
const onChatBlock = () => {
  uni.showModal({
    title: '拉黑该用户',
    content: '拉黑后将不再收到对方消息，可在设置中解除',
    confirmColor: '#FF6B6B',
    success: (r) => {
      if (!r.confirm) return;
      moreOpen.value = false;
      uni.showToast({ title: '已拉黑', icon: 'success' });
      setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
    },
  });
};

function parseLocation(content: string): LocationPayload | null {
  try {
    const value = JSON.parse(content) as Partial<LocationPayload>;
    const latitude = Number(value.latitude);
    const longitude = Number(value.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return {
        latitude,
        longitude,
        name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : undefined,
        address: typeof value.address === 'string' && value.address.trim() ? value.address.trim() : undefined,
      };
    }
  } catch (_) {
  }
  return null;
}

function parseMedia(type: 'image' | 'video', content: string): MediaPayload | null {
  try {
    const value = JSON.parse(content) as Partial<MediaPayload>;
    if (typeof value.url === 'string' && value.url.trim()) {
      return {
        type,
        url: value.url.trim(),
        mime: typeof value.mime === 'string' ? value.mime : undefined,
        sizeBytes: typeof value.sizeBytes === 'number' ? value.sizeBytes : undefined,
        width: typeof value.width === 'number' ? value.width : undefined,
        height: typeof value.height === 'number' ? value.height : undefined,
        duration: typeof value.duration === 'number' ? value.duration : undefined,
      };
    }
  } catch (_) {
    if (/^https?:\/\//.test(content)) return { type, url: content };
  }
  return null;
}

function onOpenLocation(location: LocationPayload) {
  uni.openLocation({
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.name || '我的位置',
    address: location.address || '',
    scale: 16,
  });
}

function onPreviewImage(url: string) {
  uni.previewImage({ urls: [url], current: url });
}

function nameFromAddress(address?: NominatimAddress): string {
  return address?.amenity
    || address?.park
    || address?.tourism
    || address?.road
    || address?.suburb
    || address?.city_district
    || address?.city
    || address?.town
    || address?.county
    || address?.state
    || '';
}

function placeFromUniAddress(address?: UniLocationAddress): { name: string; address: string } | null {
  if (!address) return null;
  const text = [
    address.province,
    address.city,
    address.district,
    address.street,
    address.streetNum,
  ].filter(Boolean).join('');
  const name = address.poiName || address.street || address.district || text;
  if (!text && !name) return null;
  return { name, address: text || name };
}

async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<{ name: string; address: string } | null> {
  // #ifdef H5
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&accept-language=zh-CN`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimReverseResp;
    const address = data.display_name || '';
    const name = data.name || nameFromAddress(data.address) || address.split(',')[0] || '';
    if (!address && !name) return null;
    return { name: name || '我的位置', address: address || name };
  } catch (e) {
    console.warn('[conversation] reverse geocode failed', e);
  }
  // #endif
  return null;
}

async function sendPayload(payload: { content: string; type?: MessageType }) {
  if (sending.value || !peerId.value) return;
  sending.value = true;
  try {
    const sentBySocket = await sendBySocket(payload);
    if (!sentBySocket) {
      const sent = await sendMessage({
        toUserId: peerId.value,
        content: payload.content,
        type: payload.type,
      });
      mergeMessages([sent]);
      void syncConversation();
    }
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '发送失败', icon: 'none' });
  } finally {
    sending.value = false;
  }
}

async function onSendLocation() {
  if (sending.value) return;
  try {
    uni.showLoading({ title: '定位中' });
    const loc = await new Promise<UniLocationResult>((resolve, reject) =>
      uni.getLocation({
        type: 'gcj02',
        geocode: true,
        isHighAccuracy: true,
        success: resolve,
        fail: reject,
      }),
    );
    const latitude = Number(loc.latitude);
    const longitude = Number(loc.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('invalid location');
    const nativePlace = placeFromUniAddress(loc.address);
    const reversePlace = nativePlace?.address ? null : await reverseGeocodeLocation(latitude, longitude);
    const place = nativePlace ?? reversePlace ?? { name: '我的位置', address: '点击查看地图位置' };
    await sendPayload({
      type: 'location',
      content: JSON.stringify({
        latitude,
        longitude,
        name: place.name || '我的位置',
        address: place.address || '点击查看地图位置',
      }),
    });
    uni.hideLoading();
  } catch (_) {
    uni.hideLoading();
    uni.showToast({ title: '定位失败', icon: 'none' });
  }
}

async function onSendImages() {
  if (sending.value) return;
  uni.chooseImage({
    count: 9,
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const paths = Array.isArray(res.tempFilePaths)
        ? res.tempFilePaths
        : res.tempFilePaths
          ? [res.tempFilePaths]
          : [];
      if (!paths.length) return;
      uni.showLoading({ title: '上传中' });
      try {
        const urls = await uploadImages(paths);
        for (const url of urls) {
          await sendPayload({
            type: 'image',
            content: JSON.stringify({ type: 'image', url }),
          });
        }
      } finally {
        uni.hideLoading();
      }
    },
  });
}

async function onSendVideo() {
  if (sending.value) return;
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    compressed: true,
    success: async (res) => {
      const path = String(res.tempFilePath || '');
      if (!path) return;
      uni.showLoading({ title: '上传中' });
      try {
        const uploaded = await uploadFile(path);
        await sendPayload({
          type: 'video',
          content: JSON.stringify({
            type: 'video',
            url: uploaded.url,
            mime: uploaded.mime,
            sizeBytes: uploaded.sizeBytes,
            width: Number(res.width) || uploaded.width,
            height: Number(res.height) || uploaded.height,
            duration: Number(res.duration) || undefined,
          }),
        });
      } finally {
        uni.hideLoading();
      }
    },
  });
}

function onConfirmTime() {
  const nextHour = nextFishingDateTime(new Date());
  syncTimePicker(nextHour);
  timeOpen.value = true;
}

function optionIndexForDate(value: string): number {
  const index = dateOptions.value.findIndex((item) => item.value === value);
  return index >= 0 ? index : 0;
}

function syncTimePicker(date: Date) {
  pickedDate.value = formatDateInput(date);
  pickedTime.value = formatTimeInput(date);
  timePickerValue.value = [optionIndexForDate(pickedDate.value), date.getHours(), date.getMinutes()];
}

function onTimePickerChange(e: { detail?: { value?: number[] } }) {
  const value = e.detail?.value || timePickerValue.value;
  const dateIndex = Math.min(Math.max(Number(value[0]) || 0, 0), dateOptions.value.length - 1);
  const hourIndex = Math.min(Math.max(Number(value[1]) || 0, 0), hourOptions.length - 1);
  const minuteIndex = Math.min(Math.max(Number(value[2]) || 0, 0), minuteOptions.length - 1);
  pickedDate.value = dateOptions.value[dateIndex]?.value || pickedDate.value;
  pickedTime.value = `${hourOptions[hourIndex]}:${minuteOptions[minuteIndex]}`;
  timePickerValue.value = [dateIndex, hourIndex, minuteIndex];
}

function nextFishingDateTime(date: Date): Date {
  const next = new Date(date.getTime());
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  if (next.getHours() < 5) next.setHours(5);
  if (next.getHours() > 22) {
    next.setDate(next.getDate() + 1);
    next.setHours(5);
  }
  return next;
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimeInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function onSendPickedTime() {
  void sendPayload({ content: `确认时间：${pickedDate.value} ${pickedTime.value}` });
}

async function onSendJoinedStatus() {
  joinedOpen.value = true;
  void loadJoinedTeams();
}

function isSelectableJoinedTeam(team: TeamListItem): boolean {
  return team.yourMemberStatus === 'approved' || team.yourMemberStatus === 'pending';
}

function joinedTeamMeta(team: TeamListItem): string {
  return [team.spotName, formatTeamWhen(team.startTime, team.endTime)].filter(Boolean).join(' · ');
}

async function loadJoinedTeams() {
  if (joinedLoading.value) return;
  joinedLoading.value = true;
  try {
    const resp = await listUserTeams({ role: 'all', limit: 30 });
    const list = resp.list.filter(isSelectableJoinedTeam);
    if (teamId.value && !list.some((team) => team.id === teamId.value)) {
      const team = await teamDetail(teamId.value).catch(() => null);
      if (team && isSelectableJoinedTeam(team)) list.unshift(team);
    }
    const seen = new Set<string>();
    joinedTeams.value = list.filter((team) => {
      if (seen.has(team.id)) return false;
      seen.add(team.id);
      return true;
    });
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '组队加载失败', icon: 'none' });
  } finally {
    joinedLoading.value = false;
  }
}

async function onSendJoinedTeam(team: TeamListItem) {
  joinedOpen.value = false;
  const status = team.yourMemberStatus === 'pending' ? '我已报名，等待审核' : '我已报名并通过';
  await sendPayload({
    content: `${status}：${team.title}，${formatTeamWhen(team.startTime, team.endTime)}`,
  });
}

const onQuickReply = (q: string) => {
  if (q === '发定位') {
    void onSendLocation();
    return;
  }
  if (q === '确认时间') {
    onConfirmTime();
    return;
  }
  if (q === '我已报名') {
    void onSendJoinedStatus();
    return;
  }
  draft.value = q;
};

const onPlus = () => {
  uni.showActionSheet({
    itemList: ['选择图片', '发送视频'],
    success: (res) => {
      if (res.tapIndex === 0) void onSendImages();
      if (res.tapIndex === 1) void onSendVideo();
    },
    fail: () => {},
  });
};

const onSend = async () => {
  const text = draft.value.trim();
  if (!text || sending.value || !peerId.value) return;
  sending.value = true;
  try {
    const sentBySocket = await sendBySocket({ content: text });
    if (sentBySocket) {
      draft.value = '';
      return;
    }
    const sent = await sendMessage({ toUserId: peerId.value, content: text });
    mergeMessages([sent]);
    draft.value = '';
    void syncConversation();
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '发送失败', icon: 'none' });
  } finally {
    sending.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
