<template>
  <view class="contact-page">
    <!-- 标准导航 -->
    <mxy-form-nav title="联系队长" @back="onBack" />

    <scroll-view class="contact-scroll" scroll-y>
      <!-- 队长卡 -->
      <view class="owner-card">
        <view class="owner-avatar" :style="{ background: '#EAF5F4' }">
          <image
            v-if="owner.avatar"
            :src="owner.avatar"
            mode="aspectFill"
            style="width:100%;height:100%;border-radius:50%"
          />
          <text v-else class="owner-avatar-text">{{ avatarChar }}</text>
        </view>
        <view class="owner-info">
          <text class="owner-name">{{ ownerName }}</text>
          <text class="owner-meta">发起人 · 钓点 {{ teamSummary.spotName || '—' }}</text>
          <view class="owner-tags">
            <view class="owner-tag tag-primary"><text>{{ statusText }}</text></view>
            <view v-if="teamSummary.needCarpool" class="owner-tag tag-blue"><text>可拼车</text></view>
          </view>
        </view>
      </view>

      <!-- 组队预览 -->
      <view class="team-preview">
        <text class="team-title">{{ teamSummary.title || '加载中…' }}</text>
        <text class="team-meta">{{ teamSummary.metaLine }}</text>
        <view class="team-badges">
          <view class="badge badge-primary"><text>{{ costLabel }}</text></view>
          <view class="badge badge-orange"><text>{{ teamSummary.joinedCount }}/{{ teamSummary.maxPeople }} 人</text></view>
        </view>
      </view>

      <!-- 章节标题 -->
      <view class="section-title-wrap">
        <text class="section-title">联系前确认</text>
      </view>

      <!-- 确认清单 -->
      <view class="checklist">
        <view
          v-for="(item, idx) in checklist"
          :key="item.id"
          class="check-row"
          @click="toggle(idx)"
        >
          <mxy-icon
            :name="item.checked ? 'check_circle' : 'radio_button_unchecked'"
            :size="44"
            :color="item.checked ? '#4CAF50' : '#99A5AD'"
          />
          <text class="check-text">{{ item.label }}</text>
          <view v-if="idx !== checklist.length - 1" class="check-divider" />
        </view>
      </view>

      <!-- 给队长留言 -->
      <view class="msg-draft">
        <text class="draft-title">给队长留言</text>
        <textarea
          v-model="leaveMsg"
          class="draft-area"
          placeholder="可以告诉队长你的钓龄、装备、是否能拼车..."
          placeholder-class="draft-placeholder"
          :maxlength="200"
          auto-height
        />
      </view>

      <view class="scroll-pad" />
    </scroll-view>

    <!-- 底部 CTA -->
    <view class="contact-foot" :style="{ paddingBottom: 'calc(20rpx + ' + safeBottom + 'px)' }">
      <view class="btn-ghost" @click="onChat">
        <text>先私聊</text>
      </view>
      <view
        class="btn-primary"
        :class="{ disabled: !canApply || submitting }"
        @click="onApply"
      >
        <text>{{ submitting ? '提交中...' : '联系并申请加入' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';
import {
  applyTeam,
  COST_MODE_LABEL,
  formatTeamWhen,
  TEAM_STATUS_LABEL,
  teamDetail,
  type TeamDetail,
} from '@/api/teams';
import { BizError } from '@/utils/request';

const { safeBottom } = useSystemInfo();

const teamId = ref<string>('');
const team = ref<TeamDetail | null>(null);
const submitting = ref(false);

const owner = computed(() => team.value?.owner ?? { id: '', name: '', avatar: '' });
const ownerName = computed(
  () => owner.value.name || (owner.value.id ? '钓友' + owner.value.id.slice(-4) : '加载中'),
);
const avatarChar = computed(() => ownerName.value.charAt(0));
const statusText = computed(() =>
  team.value ? TEAM_STATUS_LABEL[team.value.status] : '',
);
const costLabel = computed(() =>
  team.value ? COST_MODE_LABEL[team.value.costMode] : '',
);
const teamSummary = computed(() => {
  if (!team.value) {
    return {
      title: '',
      spotName: '',
      metaLine: '',
      joinedCount: 0,
      maxPeople: 0,
      needCarpool: false,
    };
  }
  return {
    title: team.value.title,
    spotName: team.value.spotName,
    metaLine:
      team.value.spotName +
      ' · ' +
      formatTeamWhen(team.value.startTime, team.value.endTime),
    joinedCount: team.value.joinedCount,
    maxPeople: team.value.maxPeople,
    needCarpool: team.value.needCarpool,
  };
});

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

const checklist = ref<CheckItem[]>([
  { id: 'time', label: '我能按集合时间到达', checked: false },
  { id: 'park', label: '需要队长确认停车点', checked: false },
  { id: 'cost', label: '已阅读安全与费用说明', checked: false },
]);

const leaveMsg = ref('');

const canApply = computed(() => {
  if (!team.value) return false;
  if (team.value.status !== 'recruiting') return false;
  if (team.value.yourMemberStatus === 'pending' || team.value.yourMemberStatus === 'approved') return false;
  return checklist.value.every((i) => i.checked);
});

onLoad((options) => {
  teamId.value = String((options as { teamId?: string })?.teamId ?? '');
  if (!teamId.value) {
    uni.showToast({ title: '缺少 teamId', icon: 'none' });
    return;
  }
  void reload();
});

async function reload() {
  try {
    team.value = await teamDetail(teamId.value);
    if (team.value.yourMemberStatus === 'pending') {
      uni.showToast({ title: '你已申请,等待审核', icon: 'none' });
    }
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '加载失败';
    uni.showToast({ title: msg, icon: 'none' });
  }
}

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const toggle = (idx: number) => {
  checklist.value[idx].checked = !checklist.value[idx].checked;
};
const onChat = () => {
  if (!owner.value.id) return;
  uni.navigateTo({
    url:
      '/subpackages/message/conversation/index?peer=' +
      encodeURIComponent(owner.value.id),
  });
};
const onApply = async () => {
  if (submitting.value) return;
  if (!canApply.value) {
    if (!team.value) return;
    if (team.value.yourMemberStatus === 'pending') {
      uni.showToast({ title: '已申请,等待审核', icon: 'none' });
    } else if (team.value.yourMemberStatus === 'approved') {
      uni.showToast({ title: '你已是队员', icon: 'none' });
    } else if (team.value.status !== 'recruiting') {
      uni.showToast({ title: '当前不接受报名', icon: 'none' });
    } else {
      uni.showToast({ title: '请先勾选确认项', icon: 'none' });
    }
    return;
  }
  submitting.value = true;
  try {
    await applyTeam(teamId.value, leaveMsg.value.trim() || undefined);
    uni.showToast({ title: '已提交申请', icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: 1 }), 800);
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '提交失败';
    uni.showToast({ title: msg, icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
