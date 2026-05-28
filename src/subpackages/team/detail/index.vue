<template>
  <view class="team-detail">
    <!-- 顶部悬浮 -->
    <view
      class="hero-top"
      :style="{ paddingTop: statusBarHeight + 'px', paddingRight: capsuleRightWidth + 'px' }"
    >
      <view class="icon-btn" @click="onBack">
        <mxy-icon name="arrow_back" :size="40" color="#fff" />
      </view>
      <view class="status-badge">
        <text class="status-badge-text">{{ statusText }}</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- Hero -->
      <view class="hero">
        <view class="hero-img" :style="{ background: heroBg }" />
        <view class="hero-shade" />
        <view class="hero-bottom">
          <text class="hero-title">{{ team?.title || '加载中…' }}</text>
          <text class="hero-sub">{{ heroSub }}</text>
          <view class="countdown">
            <text class="countdown-text">{{ countdown ? '距离出发 ' + countdown : '' }}</text>
          </view>
        </view>
      </view>

      <view v-if="team" class="panel">
        <!-- 汇总 -->
        <view class="summary-card">
          <view class="summary-cell">
            <text class="summary-num">{{ team.joinedCount }}/{{ team.maxPeople }}</text>
            <text class="summary-label">已报名</text>
          </view>
          <view class="summary-div" />
          <view class="summary-cell">
            <text class="summary-num accent">{{ costLabel }}</text>
            <text class="summary-label">费用</text>
          </view>
          <view class="summary-div" />
          <view class="summary-cell">
            <text class="summary-num secondary">{{ team.needCarpool ? '需要' : '不需' }}</text>
            <text class="summary-label">拼车</text>
          </view>
        </view>

        <!-- 发起人 -->
        <view class="owner-card">
          <mxy-avatar :src="team.owner.avatar" :size="100" />
          <view class="owner-info">
            <text class="owner-name">{{ team.owner.name || ('钓友' + team.owner.id.slice(-4)) }}</text>
            <text class="owner-meta">发起人 · 钓点 {{ team.spotName }}{{ team.spotCity ? ' · ' + team.spotCity : '' }}</text>
          </view>
          <view class="owner-btn" @click="onOwner">
            <text class="owner-btn-text">主页</text>
          </view>
        </view>

        <!-- 已报名钓友 -->
        <view class="members-card">
          <text class="members-title">已报名钓友 {{ approvedMembers.length }}/{{ team.maxPeople }}</text>
          <view class="members-row">
            <view
              v-for="(m, idx) in approvedMembers.slice(0, 4)"
              :key="m.userId"
              class="member-avatar"
              :class="`tone-${memberTone(idx)}`"
            />
            <view v-if="extraCount > 0" class="member-extra">
              <text class="member-extra-text">+{{ extraCount }}</text>
            </view>
            <text class="members-state">{{ joinHint }}</text>
          </view>
        </view>

        <!-- 待审核（仅队长可见） -->
        <view v-if="isOwner && pendingMembers.length > 0" class="members-card">
          <text class="members-title">待审核 {{ pendingMembers.length }} 人</text>
          <view
            v-for="m in pendingMembers"
            :key="m.userId"
            class="pending-row"
          >
            <view class="pending-info">
              <text class="pending-name">{{ m.name || ('钓友' + m.userId.slice(-4)) }}</text>
              <text v-if="m.message" class="pending-msg">{{ m.message }}</text>
            </view>
            <view class="pending-actions">
              <view class="pending-btn ghost" @click="onReview(m.userId, 'reject')">
                <text>拒绝</text>
              </view>
              <view class="pending-btn primary" @click="onReview(m.userId, 'approve')">
                <text>通过</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="desc-card">
          <text class="desc-title">备注</text>
          <text class="desc-text">{{ team.note || '—' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view v-if="team" class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="ghost-btn" @click="onContact">
        <text class="ghost-btn-text">联系发起人</text>
      </view>
      <view
        class="join-btn"
        :class="{ disabled: !canJoin }"
        @click="onJoin"
      >
        <text class="join-btn-text">{{ joinBtnText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  applyTeam,
  cancelApplyTeam,
  countdownLabel,
  COST_MODE_LABEL,
  formatTeamWhen,
  reviewMember,
  TEAM_STATUS_LABEL,
  teamDetail,
  type TeamDetail,
} from '@/api/teams';
import { useAuthStore } from '@/stores/auth';
import { BizError } from '@/utils/request';

const { statusBarHeight, safeBottom, capsuleRightWidth } = useSystemInfo();
const authStore = useAuthStore();

const teamId = ref<string>('');
const team = ref<TeamDetail | null>(null);
const submitting = ref(false);

const isOwner = computed(
  () => !!team.value && authStore.user?.id === team.value.owner.id,
);
const approvedMembers = computed(
  () => team.value?.members.filter((m) => m.status === 'approved') ?? [],
);
const pendingMembers = computed(
  () => team.value?.members.filter((m) => m.status === 'pending') ?? [],
);
const extraCount = computed(() =>
  Math.max(0, approvedMembers.value.length - 4),
);

const statusText = computed(() => {
  if (!team.value) return '加载中';
  if (
    team.value.status === 'recruiting' &&
    team.value.maxPeople - team.value.joinedCount === 1
  )
    return '剩1位';
  return TEAM_STATUS_LABEL[team.value.status] || team.value.status;
});
const costLabel = computed(() =>
  team.value ? COST_MODE_LABEL[team.value.costMode] || team.value.costMode : '',
);
const heroSub = computed(() => {
  if (!team.value) return '';
  return team.value.spotName + ' · ' + formatTeamWhen(team.value.startTime, team.value.endTime);
});
const heroBg = computed(() => {
  if (!team.value) return 'linear-gradient(135deg, #2d8f87 0%, #1f6d66 100%)';
  // 用 spotId hash 选色板，无需依赖外部图片
  const palette = [
    'linear-gradient(135deg, #2d8f87 0%, #1f6d66 100%)',
    'linear-gradient(135deg, #5BA9C4 0%, #3a7d96 100%)',
    'linear-gradient(135deg, #F5A623 0%, #c4810f 100%)',
    'linear-gradient(135deg, #6B7B85 0%, #3a4a55 100%)',
  ];
  let h = 0;
  for (const ch of team.value.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
});
const countdown = computed(() =>
  team.value ? countdownLabel(team.value.startTime) : '',
);
const joinHint = computed(() => {
  if (!team.value) return '';
  if (team.value.status !== 'recruiting') {
    return TEAM_STATUS_LABEL[team.value.status];
  }
  const remain = team.value.maxPeople - team.value.joinedCount;
  return remain > 0 ? `还差 ${remain} 人,报名后等待审核` : '人已满';
});
const canJoin = computed(() => {
  if (!team.value || submitting.value) return false;
  if (isOwner.value) return false;
  if (team.value.status !== 'recruiting') return false;
  const my = team.value.yourMemberStatus;
  if (my === 'pending' || my === 'approved') return true; // 可取消
  return team.value.joinedCount < team.value.maxPeople;
});
const joinBtnText = computed(() => {
  if (!team.value) return '加载中';
  if (isOwner.value) return '我发起的';
  if (team.value.status !== 'recruiting')
    return TEAM_STATUS_LABEL[team.value.status];
  const my = team.value.yourMemberStatus;
  if (my === 'pending') return '撤销报名';
  if (my === 'approved') return '退出组队';
  if (team.value.joinedCount >= team.value.maxPeople) return '已满员';
  return '报名参加';
});

function memberTone(idx: number): 'primary' | 'blue' | 'orange' {
  return (['primary', 'blue', 'orange'] as const)[idx % 3];
}

onLoad((options) => {
  teamId.value = String((options as { id?: string })?.id ?? '');
  if (!teamId.value) {
    uni.showToast({ title: '缺少 teamId', icon: 'none' });
    return;
  }
  void reload();
});

onShow(() => {
  if (teamId.value && team.value) {
    void reload();
  }
});

async function reload() {
  try {
    const d = await teamDetail(teamId.value);
    team.value = d;
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '加载失败';
    uni.showToast({ title: msg, icon: 'none' });
  }
}

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onOwner = () => {
  if (!team.value) return;
  uni.navigateTo({
    url: `/subpackages/social/user-detail/index?id=${team.value.owner.id}`,
  });
};
const onContact = () => {
  if (!team.value) return;
  uni.navigateTo({
    url: `/subpackages/team/contact/index?teamId=${team.value.id}`,
  });
};

async function onJoin() {
  if (!team.value || submitting.value) return;
  if (isOwner.value) {
    uni.showToast({ title: '你是发起人', icon: 'none' });
    return;
  }
  if (team.value.status !== 'recruiting') return;
  const my = team.value.yourMemberStatus;
  submitting.value = true;
  try {
    if (my === 'pending' || my === 'approved') {
      const confirmed = await new Promise<boolean>((resolve) =>
        uni.showModal({
          title: my === 'approved' ? '退出组队' : '撤销报名',
          content: my === 'approved' ? '确定要退出该组队吗?' : '确定撤销这次报名吗?',
          success: (r) => resolve(r.confirm),
          fail: () => resolve(false),
        }),
      );
      if (!confirmed) return;
      await cancelApplyTeam(team.value.id);
      uni.showToast({ title: '已撤销', icon: 'success' });
    } else {
      await applyTeam(team.value.id);
      uni.showToast({ title: '已提交报名', icon: 'success' });
    }
    await reload();
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '操作失败';
    uni.showToast({ title: msg, icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

async function onReview(userId: string, action: 'approve' | 'reject') {
  if (!team.value) return;
  try {
    await reviewMember({ teamId: team.value.id, userId, action });
    uni.showToast({
      title: action === 'approve' ? '已通过' : '已拒绝',
      icon: 'success',
    });
    await reload();
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '审核失败';
    uni.showToast({ title: msg, icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';

.pending-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-light;

  &:first-of-type { border-top: none; padding-top: 0; }
}
.pending-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;

  .pending-name {
    font-size: 28rpx;
    font-weight: 800;
    color: $text-primary;
  }
  .pending-msg {
    font-size: 22rpx;
    color: $text-secondary;
    line-height: 1.4;
  }
}
.pending-actions {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}
.pending-btn {
  height: 56rpx;
  padding: 0 22rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text { font-size: 22rpx; font-weight: 800; }
  &.primary { background: $primary; text { color: #fff; } }
  &.ghost   { background: $bg-page; text { color: $text-secondary; } }
}
</style>
