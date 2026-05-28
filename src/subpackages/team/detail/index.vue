<template>
  <view class="team-detail">
    <!-- 顶部悬浮（脱离滚动流） -->
    <view
      class="hero-top"
      :style="heroTopStyle"
    >
      <view class="icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="status-badge">
        <text class="status-badge-text">{{ team.statusText }}</text>
      </view>
    </view>

    <!-- 内容 -->
    <scroll-view class="content" scroll-y>
      <!-- Hero（随内容滚动） -->
      <view class="hero">
        <image class="hero-img" :src="team.cover" mode="aspectFill" />
        <view class="hero-shade" />
        <view class="hero-bottom">
          <text class="hero-title">{{ team.title }}</text>
          <text class="hero-sub">{{ team.subtitle }}</text>
          <view class="countdown">
            <text class="countdown-text">距离出发 {{ countdown }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <!-- 汇总 -->
        <view class="summary-card">
          <view class="summary-cell">
            <text class="summary-num">{{ team.joined }}/{{ team.max }}</text>
            <text class="summary-label">已报名</text>
          </view>
          <view class="summary-div" />
          <view class="summary-cell">
            <text class="summary-num accent">{{ team.cost }}</text>
            <text class="summary-label">费用</text>
          </view>
          <view class="summary-div" />
          <view class="summary-cell">
            <text class="summary-num secondary">{{ team.carpool }}</text>
            <text class="summary-label">{{ team.carpoolSub }}</text>
          </view>
        </view>

        <!-- 发起人 -->
        <view class="owner-card">
          <mxy-avatar :src="owner.avatar" :size="100" />
          <view class="owner-info">
            <text class="owner-name">{{ owner.name }}</text>
            <text class="owner-meta">{{ owner.meta }}</text>
          </view>
          <view class="owner-btn" @click="onOwner">
            <text class="owner-btn-text">主页</text>
          </view>
        </view>

        <!-- 已报名钓友 -->
        <view class="members-card">
          <text class="members-title">已报名钓友</text>
          <view class="members-row">
            <view
              v-for="(m, idx) in members"
              :key="idx"
              class="member-avatar"
              :class="`tone-${m.tone}`"
            />
            <view v-if="extraCount > 0" class="member-extra">
              <text class="member-extra-text">+{{ extraCount }}</text>
            </view>
            <text class="members-state">{{ team.joinHint }}</text>
          </view>
        </view>

        <!-- 备注 -->
        <view class="desc-card">
          <text class="desc-title">备注</text>
          <text class="desc-text">{{ team.desc }}</text>
        </view>

      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="ghost-btn" @click="onContact">
        <text class="ghost-btn-text">联系发起人</text>
      </view>
      <view class="join-btn" :class="{ disabled: !canApply }" @click="onJoin">
        <text class="join-btn-text">{{ joinBtnLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import {
  applyTeam,
  COST_MODE_LABEL,
  teamDetail,
  type TeamDetail,
  type TeamMemberStatus,
} from '@/api/teams';

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

const team = ref({
  cover: 'https://images.unsplash.com/photo-1665355259602-6d57b0639ab0?w=900',
  title: '组队详情',
  subtitle: '加载中…',
  statusText: '加载中',
  joined: 0,
  max: 0,
  cost: 'AA',
  carpool: '拼车',
  carpoolSub: '需要',
  joinHint: '报名后由发起人审核',
  desc: '发起人暂未填写备注',
  startAt: Date.now(),
  status: 'recruiting',
  memberStatus: null as TeamMemberStatus | null,
});

const owner = ref({
  id: '',
  name: '钓友',
  avatar: '',
  meta: '发起人',
});

type Tone = 'primary' | 'blue' | 'orange';
const members = ref<{ tone: Tone }[]>([]);
const teamId = ref('');
const loading = ref(false);
const applying = ref(false);
const extraCount = computed(() => Math.max(0, team.value.joined - members.value.length));

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDateTime(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  return `${pad(start.getMonth() + 1)}月${pad(start.getDate())}日 ${pad(start.getHours())}:${pad(start.getMinutes())}-${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

function statusText(item: TeamDetail): string {
  if (item.status === 'full') return '已满员';
  if (item.status !== 'recruiting') return item.status;
  const left = item.maxPeople - item.joinedCount;
  return left <= 1 ? '剩1位' : '招募中';
}

function joinHint(status: TeamMemberStatus | null): string {
  if (status === 'approved') return '你已在队伍中';
  if (status === 'pending') return '已报名，等待发起人审核';
  if (status === 'rejected') return '申请未通过，可重新提交';
  if (status === 'cancelled') return '已取消，可重新报名';
  return '报名后由发起人审核';
}

function memberTones(count: number): { tone: Tone }[] {
  const tones: Tone[] = ['primary', 'blue', 'orange'];
  return Array.from({ length: Math.min(count, 3) }, (_, i) => ({ tone: tones[i % tones.length] }));
}

const countdown = computed(() => {
  const diff = team.value.startAt - Date.now();
  if (diff <= 0) return '已开始';
  const totalH = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalH / 24);
  const hours = totalH % 24;
  if (days > 0) return `${days}天${hours}小时`;
  return `${hours}小时`;
});

const canApply = computed(() => {
  if (applying.value) return false;
  if (team.value.status !== 'recruiting') return false;
  if (team.value.joined >= team.value.max) return false;
  return !['approved', 'pending'].includes(team.value.memberStatus || '');
});

const joinBtnLabel = computed(() => {
  if (applying.value) return '提交中…';
  if (team.value.status === 'full' || team.value.joined >= team.value.max) return '已满员';
  if (team.value.memberStatus === 'approved') return '已加入';
  if (team.value.memberStatus === 'pending') return '待审核';
  if (team.value.memberStatus === 'rejected') return '重新报名';
  return '报名参加';
});

function applyDetail(d: TeamDetail) {
  team.value = {
    cover: 'https://images.unsplash.com/photo-1665355259602-6d57b0639ab0?w=900',
    title: d.title || d.spotName || '组队约钓',
    subtitle: [d.spotName, formatDateTime(d.startTime, d.endTime)].filter(Boolean).join(' · '),
    statusText: statusText(d),
    joined: d.joinedCount,
    max: d.maxPeople,
    cost: COST_MODE_LABEL[d.costMode],
    carpool: d.needCarpool ? '拼车' : '不拼车',
    carpoolSub: d.needCarpool ? '需要' : '自理',
    joinHint: joinHint(d.yourMemberStatus),
    desc: d.note || '发起人暂未填写备注',
    startAt: new Date(d.startTime).getTime(),
    status: d.status,
    memberStatus: d.yourMemberStatus,
  };
  owner.value = {
    id: d.owner.id,
    name: d.owner.name || `钓友${d.owner.id.slice(-4)}`,
    avatar: d.owner.avatar || '',
    meta: ['发起人', d.spotCity || d.spotName].filter(Boolean).join(' · '),
  };
  const approvedCount = d.members.filter((m) => m.status === 'approved').length || d.joinedCount;
  members.value = memberTones(approvedCount);
}

async function loadDetail() {
  if (!teamId.value || loading.value) return;
  loading.value = true;
  try {
    const d = await teamDetail(teamId.value);
    applyDetail(d);
  } catch (e: any) {
    console.warn('[team-detail] load failed', e);
    uni.showToast({ title: e?.msg || '加载组队失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

onLoad((options) => {
  teamId.value = String((options as { id?: string })?.id ?? '');
  void loadDetail();
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onOwner = () => {
  if (!owner.value.id) return;
  uni.navigateTo({ url: `/subpackages/social/user-detail/index?id=${owner.value.id}` });
};
const onContact = () => uni.navigateTo({ url: `/subpackages/team/contact/index?id=${teamId.value}` });
const onJoin = async () => {
  if (!canApply.value) {
    uni.showToast({ title: joinBtnLabel.value, icon: 'none' });
    return;
  }
  applying.value = true;
  try {
    await applyTeam(teamId.value);
    uni.showToast({ title: '已提交报名，等待审核', icon: 'success' });
    await loadDetail();
  } catch (e) {
    console.warn('[team-detail] apply failed', e);
  } finally {
    applying.value = false;
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
