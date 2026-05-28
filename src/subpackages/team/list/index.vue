<template>
  <view class="team-list">
    <!-- 顶栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav">
        <view class="nav-back" @click="onBack">
          <mxy-icon name="arrow_back" :size="44" color="#1A2B33" />
        </view>
        <text class="nav-title">组队约钓</text>
        <view class="create-btn" @click="onCreate">
          <mxy-icon name="add" :size="32" color="#fff" />
          <text class="create-btn-text">发起组队</text>
        </view>
      </view>
      <view class="chips">
        <view
          v-for="c in filters"
          :key="c.key"
          class="chip"
          :class="{ active: activeFilter === c.key }"
          @click="onPickFilter(c.key)"
        >
          <text>{{ c.label }}</text>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view class="content" scroll-y @scrolltolower="onReachBottom">
      <view v-if="!loading && teams.length === 0" class="empty">
        <text class="empty-text">{{ emptyHint }}</text>
      </view>

      <view v-else class="cards">
        <view
          v-for="t in teams"
          :key="t.id"
          class="card"
          @click="onOpen(t)"
        >
          <view class="card-head">
            <text class="card-title">{{ t.title }}</text>
            <view class="status-tag" :class="`tag--${statusTone(t)}`">
              <text>{{ statusText(t) }}</text>
            </view>
          </view>
          <text class="card-meta">{{ metaLine(t) }}</text>
          <view class="card-people">
            <view
              v-for="(tone, idx) in avatarsFor(t)"
              :key="idx"
              class="avatar-dot"
              :class="`tone-${tone}`"
            />
            <text class="card-people-text">{{ peopleSummary(t) }}</text>
          </view>
          <view class="card-foot">
            <text class="owner-text">发起人:{{ t.owner.name || ('钓友' + t.owner.id.slice(-4)) }}</text>
            <view
              class="join-btn"
              :class="btnTone(t)"
              @click.stop="onJoin(t)"
            >
              <text>{{ btnText(t) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="loadingMore" class="load-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="!nextCursor && teams.length > 0" class="load-more">
        <text>—— 没有更多了 ——</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  applyTeam,
  COST_MODE_LABEL,
  formatTeamWhen,
  listTeams,
  TEAM_STATUS_LABEL,
  type TeamFilter,
  type TeamListItem,
} from '@/api/teams';
import { BizError } from '@/utils/request';

const { statusBarHeight } = useSystemInfo();

const filters: { key: TeamFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'nearby', label: '附近' },
  { key: 'weekend', label: '本周末' },
  { key: 'carpool', label: '可拼车' },
];
const activeFilter = ref<TeamFilter>('all');

const teams = ref<TeamListItem[]>([]);
const nextCursor = ref<string | null>(null);
const loading = ref(false);
const loadingMore = ref(false);
const myLocation = ref<{ lat: number; lng: number } | null>(null);

const emptyHint = computed(() => {
  switch (activeFilter.value) {
    case 'nearby':
      return '附近暂无组队,试试切换"全部"看看';
    case 'weekend':
      return '本周末还没有组队 🐟';
    case 'carpool':
      return '当前没有需要拼车的组队';
    default:
      return '暂无组队,来发起一个吧';
  }
});

function statusTone(t: TeamListItem): 'primary' | 'accent' | 'muted' {
  if (t.status === 'recruiting') {
    if (t.maxPeople - t.joinedCount <= 1) return 'accent';
    return 'primary';
  }
  return 'muted';
}
function statusText(t: TeamListItem): string {
  if (t.status === 'recruiting' && t.maxPeople - t.joinedCount === 1) return '剩1位';
  return TEAM_STATUS_LABEL[t.status] || t.status;
}
function metaLine(t: TeamListItem): string {
  const parts: string[] = [formatTeamWhen(t.startTime, t.endTime)];
  if (typeof t.distance === 'number') {
    parts.push((t.distance / 1000).toFixed(1) + 'km');
  } else if (t.spotCity) {
    parts.push(t.spotCity);
  }
  if (t.targetFish.length > 0) parts.push('目标 ' + t.targetFish.join('/'));
  return parts.join(' · ');
}
function avatarsFor(t: TeamListItem): ('primary' | 'blue' | 'orange')[] {
  const palette: ('primary' | 'blue' | 'orange')[] = ['primary', 'blue', 'orange'];
  const n = Math.min(3, Math.max(1, t.joinedCount));
  return palette.slice(0, n);
}
function peopleSummary(t: TeamListItem): string {
  const parts: string[] = [
    `已报名 ${t.joinedCount}/${t.maxPeople}`,
    COST_MODE_LABEL[t.costMode] || t.costMode,
    t.needCarpool ? '需要拼车' : '不拼车',
  ];
  return parts.join(' · ');
}
function btnTone(t: TeamListItem): 'primary' | 'ghost' {
  if (t.status === 'recruiting' && !t.yourMemberStatus) return 'primary';
  return 'ghost';
}
function btnText(t: TeamListItem): string {
  if (t.status !== 'recruiting') return '查看';
  if (t.yourMemberStatus === 'pending') return '待审核';
  if (t.yourMemberStatus === 'approved') return '已加入';
  return '报名';
}

onLoad(() => {
  void tryFetchLocation();
  void reload();
});

onShow(() => {
  if (teams.value.length > 0) {
    // 从详情/发布页 navigateBack 时刷新一次（不阻塞首屏）
    void reload();
  }
});

async function tryFetchLocation() {
  try {
    const res = await new Promise<UniApp.GetLocationSuccess>((resolve, reject) => {
      uni.getLocation({
        type: 'wgs84',
        success: resolve,
        fail: reject,
      });
    });
    myLocation.value = { lat: res.latitude, lng: res.longitude };
  } catch {
    // 没授权也无所谓，nearby 时再提示
  }
}

async function reload() {
  loading.value = true;
  teams.value = [];
  nextCursor.value = null;
  try {
    const payload: Parameters<typeof listTeams>[0] = {
      filter: activeFilter.value,
      limit: 20,
    };
    if (activeFilter.value === 'nearby') {
      if (!myLocation.value) {
        await tryFetchLocation();
      }
      if (myLocation.value) {
        payload.lat = myLocation.value.lat;
        payload.lng = myLocation.value.lng;
        payload.radius = 50_000;
      } else {
        uni.showToast({ title: '需要定位权限才能筛选附近', icon: 'none' });
      }
    }
    const resp = await listTeams(payload);
    teams.value = resp.list;
    nextCursor.value = resp.nextCursor;
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
    const payload: Parameters<typeof listTeams>[0] = {
      filter: activeFilter.value,
      limit: 20,
      cursor: nextCursor.value,
    };
    if (activeFilter.value === 'nearby' && myLocation.value) {
      payload.lat = myLocation.value.lat;
      payload.lng = myLocation.value.lng;
      payload.radius = 50_000;
    }
    const resp = await listTeams(payload);
    teams.value.push(...resp.list);
    nextCursor.value = resp.nextCursor;
  } catch (e) {
    console.warn('[team-list] loadMore failed', e);
  } finally {
    loadingMore.value = false;
  }
}

const onReachBottom = () => {
  void loadMore();
};

const onPickFilter = (key: TeamFilter) => {
  if (activeFilter.value === key) return;
  activeFilter.value = key;
  void reload();
};

const onCreate = () =>
  uni.navigateTo({ url: '/subpackages/team/create/index' });
const onOpen = (t: TeamListItem) =>
  uni.navigateTo({ url: `/subpackages/team/detail/index?id=${t.id}` });
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});

async function onJoin(t: TeamListItem) {
  if (t.status !== 'recruiting' || t.yourMemberStatus) {
    onOpen(t);
    return;
  }
  try {
    await applyTeam(t.id);
    t.yourMemberStatus = 'pending';
    uni.showToast({ title: '已提交报名,等待审核', icon: 'success' });
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '报名失败';
    uni.showToast({ title: msg, icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';

.empty {
  padding: 200rpx 32rpx;
  text-align: center;

  .empty-text {
    font-size: 26rpx;
    color: $text-secondary;
  }
}
.load-more {
  padding: 24rpx 0 32rpx;
  text-align: center;

  text {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
</style>
