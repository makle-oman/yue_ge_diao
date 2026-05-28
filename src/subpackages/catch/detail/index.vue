<template>
  <view class="catch-detail">
    <!-- 固定在顶部的返回/分享按钮（不随内容滚动） -->
    <view
      class="hero-top"
      :style="heroTopStyle"
    >
      <view class="hero-icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="hero-icon-btn" @click="onShare">
        <mxy-icon name="ios_share" :size="40" color="#fff" />
      </view>
    </view>

    <!-- 滚动主体（包含 hero 图 + 内容面板，一起滚动） -->
    <scroll-view class="content" scroll-y>
      <!-- 顶部图 -->
      <view class="hero">
        <image
          v-if="catchData.cover"
          class="hero-img"
          :src="catchData.cover"
          mode="aspectFill"
        />
        <view v-else class="hero-img hero-img--placeholder" />
        <view class="hero-shade" />
        <view class="hero-card-badge">
          <text class="hero-card-badge-text">朋友圈卡片</text>
        </view>
      </view>

      <view class="panel">
        <!-- 作者 -->
        <view class="user-row">
          <mxy-avatar :src="author.avatar" :size="88" />
          <view class="user-text">
            <text class="user-name">{{ author.name }}</text>
            <text class="user-meta">{{ formatTime(catchData.createdAt) }}{{ catchData.city ? ' · ' + catchData.city : '' }}</text>
          </view>
          <view
            class="follow-btn"
            :class="{ following: author.following }"
            @click="onFollow"
          >
            <text class="follow-btn-text">{{ author.following ? '已关注' : '关注' }}</text>
          </view>
        </view>

        <!-- 数据卡 -->
        <view class="data-card">
          <view class="data-item">
            <text class="data-num">{{ catchData.species }}</text>
            <text class="data-label">鱼种</text>
          </view>
          <view class="data-div" />
          <view class="data-item">
            <text class="data-num accent">{{ formatWeight(catchData.weight) }}</text>
            <text class="data-label">重量</text>
          </view>
          <view class="data-div" />
          <view class="data-item">
            <text class="data-num primary">{{ formatLength(catchData.length) }}</text>
            <text class="data-label">长度</text>
          </view>
        </view>

        <!-- 钓点 + 天气 -->
        <view class="info-card">
          <view class="info-row" @click="onSpotTap">
            <mxy-icon name="location_on" :size="36" color="#2D8F87" />
            <text class="info-text strong">{{ spotLine }}</text>
            <mxy-icon v-if="catchData.spotId" name="chevron_right" :size="32" color="#99A5AD" />
          </view>
          <view class="info-divider" />
          <view class="info-row">
            <mxy-icon name="cloud" :size="36" color="#5BA9C4" />
            <text class="info-text">{{ catchData.weatherText }}</text>
          </view>
        </view>

        <!-- 描述 -->
        <view class="desc-card">
          <text class="desc-title">钓获记录</text>
          <text class="desc-text">{{ catchData.content || '—' }}</text>
        </view>

        <!-- 评论 -->
        <view class="comments-card">
          <view class="comments-card-head" @click="onMoreComments">
            <text class="comments-title">评论 {{ catchData.commentCount }}</text>
            <text class="comments-text">{{ catchData.commentCount > previewComments.length ? '查看全部 ›' : '' }}</text>
          </view>
          <view
            v-for="c in previewComments"
            :key="c.id"
            class="comments-preview-item"
            @click="onMoreComments"
          >
            <text class="comments-preview-name">{{ c.userName || ('钓友' + c.userId.slice(-4)) }}:</text>
            <text class="comments-preview-text">{{ c.content }}</text>
          </view>
          <view
            v-if="previewComments.length === 0 && catchData.commentCount === 0"
            class="comments-preview-empty"
            @click="onMoreComments"
          >
            <text>暂无评论,点击参与讨论 ›</text>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 底部交互栏 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <!-- 赞:仅图标 + 数字（数字为角标,不影响图标垂直居中） -->
      <view class="bottom-icon" :class="{ liked: catchData.liked }" @click="onLike">
        <mxy-icon
          name="favorite"
          :size="56"
          :filled="catchData.liked"
          :color="catchData.liked ? '#FF6B6B' : '#6B7B85'"
        />
        <text class="bottom-icon-count" :class="{ liked: catchData.liked }">{{ catchData.likes }}</text>
      </view>

      <!-- 收藏:星星图标 -->
      <view class="bottom-icon" :class="{ collected: catchData.collected }" @click="onCollect">
        <mxy-icon
          name="star"
          :size="56"
          :filled="catchData.collected"
          :color="catchData.collected ? '#F5A623' : '#6B7B85'"
        />
      </view>

      <!-- 评论 -->
      <view class="bottom-btn bottom-btn--ghost" @click="onMoreComments">
        <text class="bottom-btn-text">评论</text>
      </view>

      <!-- 生成分享卡片 -->
      <view class="bottom-btn bottom-btn--primary" @click="onShareCard">
        <text class="bottom-btn-text primary">生成分享卡片</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  catchDetail,
  likeCatch,
  collectCatch,
  formatWeight,
  formatLength,
  formatTime,
  type CatchDetail,
} from '@/api/catches';
import { previewLatestComments, type CommentItem } from '@/api/comments';
import { fetchUserDetail, followUser } from '@/api/users';

const { statusBarHeight, safeBottom, capsuleRightWidth } = useSystemInfo();

const heroTopStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {
    paddingTop: statusBarHeight.value + 'px',
  };
  // #ifdef MP-WEIXIN
  s.paddingRight = capsuleRightWidth.value + 'px';
  // #endif
  return s;
});

const catchId = ref<string>('');
const liking = ref(false);
const collecting = ref(false);
const followPending = ref(false);

const author = ref({
  id: '',
  name: '钓友',
  avatar: '',
  following: false,
});

const catchData = ref({
  cover: '' as string | null,
  city: '' as string | null,
  createdAt: '',
  species: '—',
  weight: null as number | null,
  length: null as number | null,
  spotId: null as string | null,
  spotName: null as string | null,
  weatherText: '天气数据待接入',
  content: '' as string | null,
  commentCount: 0,
  liked: false,
  likes: 0,
  collected: false,
});

const previewComments = ref<CommentItem[]>([]);

function formatWeatherSnapshot(raw: Record<string, unknown> | null): string {
  const current = raw?.current;
  if (!current || typeof current !== 'object') return '未记录天气';
  const c = current as {
    weather?: unknown;
    temperature?: unknown;
    pressure?: unknown;
    windScale?: unknown;
  };
  const score = typeof raw?.score === 'number' ? ` · 宜钓 ${raw.score}` : '';
  const weather = typeof c.weather === 'string' ? c.weather : '天气';
  const temp = typeof c.temperature === 'number' ? `${c.temperature}°C` : '';
  const pressure = typeof c.pressure === 'number' ? `气压 ${c.pressure}hPa` : '';
  const wind = typeof c.windScale === 'number' ? `${c.windScale}级风` : '';
  return [weather, temp, pressure, wind].filter(Boolean).join(' · ') + score;
}

const spotLine = computed(() => {
  const c = catchData.value;
  if (c.spotName) return c.spotName + (c.spotId ? ' · 详情 ›' : '');
  if (c.city) return c.city;
  return '未关联钓点';
});

async function loadDetail() {
  if (!catchId.value) return;
  try {
    const d: CatchDetail = await catchDetail(catchId.value);
    catchData.value.cover = d.cover;
    catchData.value.createdAt = d.createdAt;
    catchData.value.species = d.fishSpecies.join(' · ') || '—';
    catchData.value.weight = d.weight;
    catchData.value.length = d.length;
    catchData.value.spotId = d.spot?.id ?? null;
    catchData.value.spotName = d.spot?.name ?? null;
    catchData.value.city = d.spot?.city ?? null;
    catchData.value.content = d.content;
    catchData.value.commentCount = d.commentCount;
    catchData.value.liked = d.yourLikeStatus;
    catchData.value.likes = d.likeCount;
    catchData.value.collected = d.yourCollectStatus;
    // 天气快照后端字段为 weatherSnapshot（结构待定），后续 weather 服务接入后再渲染
    catchData.value.weatherText = formatWeatherSnapshot(d.weatherSnapshot);
    author.value.id = d.user.id;
    author.value.name = d.user.nickname || `钓友${d.user.id.slice(-4)}`;
    author.value.avatar = d.user.avatar || '';
    fetchUserDetail(d.user.id)
      .then((profile) => {
        author.value.following = profile.following;
      })
      .catch(() => {});
  } catch (e) {
    console.warn('[catch-detail] load failed', e);
  }
}

async function loadCommentsPreview() {
  if (!catchId.value) return;
  try {
    const resp = await previewLatestComments(catchId.value);
    previewComments.value = resp.list;
    // commentCount 以最新返回为准（异步成楼用户也能看到最新数）
    catchData.value.commentCount = resp.total;
  } catch (e) {
    console.warn('[catch-detail] preview comments failed', e);
  }
}

onLoad((options) => {
  catchId.value = String((options as { id?: string })?.id ?? '');
  void loadDetail();
  void loadCommentsPreview();
});

// 从评论页 navigateBack 回来时刷新摘要 + 计数
onShow(() => {
  if (catchId.value) {
    void loadCommentsPreview();
  }
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onShare = () => uni.showToast({ title: '分享 (待开发)', icon: 'none' });
const onFollow = async () => {
  if (!author.value.id || followPending.value) return;
  followPending.value = true;
  const next = author.value.following ? 'unfollow' : 'follow';
  try {
    const resp = await followUser(author.value.id, next);
    author.value.following = resp.following;
    uni.showToast({
      title: resp.following ? '已关注' : '已取消关注',
      icon: 'success',
    });
  } catch (e: any) {
    uni.showToast({ title: e?.msg || '操作失败', icon: 'none' });
  } finally {
    followPending.value = false;
  }
};
const onSpotTap = () => {
  if (!catchData.value.spotId) return;
  uni.navigateTo({
    url: `/subpackages/spot/detail/index?id=${catchData.value.spotId}`,
  });
};
const onMoreComments = () => {
  if (!catchId.value) return;
  uni.navigateTo({
    url: `/subpackages/catch/comments/index?catchId=${catchId.value}`,
  });
};

async function onLike() {
  if (!catchId.value || liking.value) return;
  liking.value = true;
  const next = catchData.value.liked ? 'unlike' : 'like';
  // 乐观更新（互动失败时回滚）
  const before = { liked: catchData.value.liked, likes: catchData.value.likes };
  catchData.value.liked = next === 'like';
  catchData.value.likes += next === 'like' ? 1 : -1;
  try {
    const resp = await likeCatch(catchId.value, next);
    catchData.value.likes = resp.likeCount;
  } catch (e) {
    catchData.value.liked = before.liked;
    catchData.value.likes = before.likes;
    console.warn('[catch-detail] like failed', e);
  } finally {
    liking.value = false;
  }
}

async function onCollect() {
  if (!catchId.value || collecting.value) return;
  collecting.value = true;
  const next = catchData.value.collected ? 'uncollect' : 'collect';
  const before = catchData.value.collected;
  catchData.value.collected = next === 'collect';
  try {
    await collectCatch(catchId.value, next);
    uni.showToast({
      title: catchData.value.collected ? '已收藏' : '已取消收藏',
      icon: 'success',
    });
  } catch (e) {
    catchData.value.collected = before;
    console.warn('[catch-detail] collect failed', e);
  } finally {
    collecting.value = false;
  }
}

const onShareCard = () =>
  uni.showToast({ title: '分享卡片 (待开发)', icon: 'none' });
</script>

<style lang="scss" scoped src="./index.scss"></style>
