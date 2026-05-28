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
          @click="onFilter(c.key)"
        >
          <text>{{ c.label }}</text>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="cards">
        <view
          v-for="t in teams"
          :key="t.id"
          class="card"
          @click="onOpen(t)"
        >
          <view class="card-head">
            <text class="card-title">{{ t.title }}</text>
            <view class="status-tag" :class="`tag--${t.statusTone}`">
              <text>{{ t.statusText }}</text>
            </view>
          </view>
          <text class="card-meta">{{ t.meta }}</text>
          <view class="card-people">
            <view
              v-for="(tone, idx) in t.avatars"
              :key="idx"
              class="avatar-dot"
              :class="`tone-${tone}`"
            />
            <text class="card-people-text">{{ t.peopleSummary }}</text>
          </view>
          <view class="card-foot">
            <text class="owner-text">发起人：{{ t.owner }}</text>
            <view
              class="join-btn"
              :class="t.btnTone === 'ghost' ? 'ghost' : 'primary'"
              @click.stop="onJoin(t)"
            >
              <text>{{ t.btnText }}</text>
            </view>
          </view>
        </view>

        <view v-if="!loading && teams.length === 0" class="list-state">
          <text class="list-state-text">暂无组队，发起一个试试</text>
        </view>
        <view v-if="loading" class="list-state">
          <text class="list-state-text">加载中…</text>
        </view>
        <view v-else-if="!hasMore && teams.length > 0" class="list-state">
          <text class="list-state-text">没有更多了</text>
        </view>
      </view>

    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  applyTeam,
  COST_MODE_LABEL,
  formatTeamDistance,
  listTeams,
  type TeamFilter,
  type TeamListItem,
} from '@/api/teams';

const { statusBarHeight } = useSystemInfo();

const filters: { key: TeamFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'nearby', label: '附近' },
  { key: 'weekend', label: '本周末' },
  { key: 'carpool', label: '可拼车' },
];
const activeFilter = ref<TeamFilter>('all');

type Tone = 'primary' | 'blue' | 'orange';
type StatusTone = 'primary' | 'accent' | 'muted';

interface Team {
  id: string;
  title: string;
  meta: string;
  statusText: string;
  statusTone: StatusTone;
  avatars: Tone[];
  peopleSummary: string;
  owner: string;
  btnText: string;
  btnTone: 'primary' | 'ghost';
  source: TeamListItem;
}

const DEFAULT_CENTER = { latitude: 32.0603, longitude: 118.7969 };
const PAGE_LIMIT = 20;

const teams = ref<Team[]>([]);
const loading = ref(false);
const hasMore = ref(false);
const cursor = ref<string | null>(null);
const center = ref({ ...DEFAULT_CENTER });
const located = ref(false);

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDateTime(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  return `${pad(start.getMonth() + 1)}月${pad(start.getDate())}日 ${pad(start.getHours())}:${pad(start.getMinutes())}-${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

function statusText(item: TeamListItem): string {
  if (item.status === 'full') return '已满员';
  if (item.status !== 'recruiting') return item.status;
  const left = item.maxPeople - item.joinedCount;
  return left <= 1 ? '剩1位' : '招募中';
}

function statusTone(item: TeamListItem): StatusTone {
  if (item.status === 'full') return 'muted';
  if (item.maxPeople - item.joinedCount <= 1) return 'accent';
  return 'primary';
}

function btnState(item: TeamListItem): { text: string; tone: Team['btnTone'] } {
  const member = item.yourMemberStatus;
  if (item.status === 'full') return { text: '查看', tone: 'ghost' };
  if (member === 'approved') return { text: '已加入', tone: 'ghost' };
  if (member === 'pending') return { text: '待审核', tone: 'ghost' };
  return { text: '报名', tone: 'primary' };
}

function avatarTones(count: number): Tone[] {
  const tones: Tone[] = ['primary', 'blue', 'orange'];
  return Array.from({ length: Math.min(Math.max(count, 1), 3) }, (_, i) => tones[i % tones.length]);
}

function adaptTeam(item: TeamListItem): Team {
  const distance = formatTeamDistance(item.distance);
  const fish = item.targetFish.length ? `目标${item.targetFish.join('/')}` : '';
  const meta = [formatDateTime(item.startTime, item.endTime), distance, fish].filter(Boolean).join(' · ');
  const carpool = item.needCarpool ? '需要拼车' : '不拼车';
  const btn = btnState(item);
  return {
    id: item.id,
    title: item.title || item.spotName || '组队约钓',
    meta,
    statusText: statusText(item),
    statusTone: statusTone(item),
    avatars: avatarTones(item.joinedCount),
    peopleSummary: `已报名 ${item.joinedCount}/${item.maxPeople} · ${COST_MODE_LABEL[item.costMode]} · ${carpool}`,
    owner: item.owner.name || `钓友${item.owner.id.slice(-4)}`,
    btnText: btn.text,
    btnTone: btn.tone,
    source: item,
  };
}

async function ensureLocation() {
  if (located.value) return;
  located.value = true;
  try {
    const loc = await new Promise<UniNamespace.GetLocationSuccess>((resolve, reject) =>
      uni.getLocation({ type: 'gcj02', success: resolve, fail: reject }),
    );
    center.value = { latitude: loc.latitude, longitude: loc.longitude };
  } catch (_) {
    center.value = { ...DEFAULT_CENTER };
  }
}

async function loadList(reset = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      teams.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
    const params: Parameters<typeof listTeams>[0] = {
      filter: activeFilter.value,
      limit: PAGE_LIMIT,
      cursor: cursor.value,
    };
    if (activeFilter.value === 'nearby') {
      await ensureLocation();
      params.lat = center.value.latitude;
      params.lng = center.value.longitude;
      params.radius = 50000;
    }
    const resp = await listTeams(params);
    const next = resp.list.map(adaptTeam);
    teams.value = reset ? next : teams.value.concat(next);
    cursor.value = resp.nextCursor;
    hasMore.value = resp.hasMore;
  } catch (e: any) {
    console.warn('[team-list] load failed', e);
    uni.showToast({ title: e?.msg || '加载组队失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onFilter(key: TeamFilter) {
  if (activeFilter.value === key) return;
  activeFilter.value = key;
  void loadList(true);
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  void loadList(false);
}

onShow(() => {
  void loadList(true);
});

const onCreate = () => uni.navigateTo({ url: '/subpackages/team/create/index' });
const onOpen = (t: Team) => uni.navigateTo({ url: `/subpackages/team/detail/index?id=${t.id}` });
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => uni.switchTab({ url: '/pages/profile/index' }));
const onJoin = async (t: Team) => {
  if (t.btnTone === 'ghost') {
    onOpen(t);
    return;
  }
  try {
    await applyTeam(t.id);
    uni.showToast({ title: '已提交报名，等待审核', icon: 'success' });
    void loadList(true);
  } catch (e) {
    console.warn('[team-list] apply failed', e);
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
