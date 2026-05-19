<template>
  <view class="team-detail">
    <!-- Hero -->
    <view class="hero">
      <image class="hero-img" :src="team.cover" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="hero-top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="icon-btn" @click="onBack">
          <mxy-icon name="arrow_back" :size="40" color="#fff" />
        </view>
        <view class="status-badge">
          <text class="status-badge-text">{{ team.statusText }}</text>
        </view>
      </view>
      <view class="hero-bottom">
        <text class="hero-title">{{ team.title }}</text>
        <text class="hero-sub">{{ team.subtitle }}</text>
        <view class="countdown">
          <text class="countdown-text">距离出发 {{ countdown }}</text>
        </view>
      </view>
    </view>

    <!-- 内容 -->
    <scroll-view class="content" scroll-y>
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
            <text class="owner-meta">发起人 · {{ owner.years }}年钓龄 · 爽约 {{ owner.absence }} 次</text>
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

        <view class="end-pad" />
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="ghost-btn" @click="onContact">
        <text class="ghost-btn-text">联系发起人</text>
      </view>
      <view class="join-btn" :class="{ disabled: team.joined >= team.max }" @click="onJoin">
        <text class="join-btn-text">{{ team.joined >= team.max ? '已满员' : '报名参加' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight, safeBottom } = useSystemInfo();

const team = ref({
  cover: 'https://images.unsplash.com/photo-1665355259602-6d57b0639ab0?w=900',
  title: '周六清晨一起出钓',
  subtitle: '燕子矶江边 · 05月25日 05:30',
  statusText: '招募中',
  joined: 3,
  max: 6,
  cost: 'AA',
  carpool: '拼车',
  carpoolSub: '需要',
  joinHint: '报名后由发起人审核',
  desc: '早口窗口短，建议 5 点前到。带抄网，岸边湿滑，车停在路边白线内。报名通过后拉微信群。',
  startAt: Date.now() + 1000 * 60 * 60 * 60, // 模拟 2天12小时后
});

const owner = ref({
  name: '老周野钓',
  avatar: '',
  years: 5,
  absence: 0,
});

type Tone = 'primary' | 'blue' | 'orange';
const members = ref<{ tone: Tone }[]>([
  { tone: 'primary' },
  { tone: 'blue' },
  { tone: 'orange' },
]);
const extraCount = computed(() => Math.max(0, team.value.joined - members.value.length));

const countdown = computed(() => {
  const diff = team.value.startAt - Date.now();
  if (diff <= 0) return '已开始';
  const totalH = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalH / 24);
  const hours = totalH % 24;
  if (days > 0) return `${days}天${hours}小时`;
  return `${hours}小时`;
});

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onOwner = () => uni.navigateTo({ url: '/subpackages/social/user-detail?id=owner' });
const onContact = () => uni.showToast({ title: '联系发起人 (待开发)', icon: 'none' });
const onJoin = () => {
  if (team.value.joined >= team.value.max) {
    uni.showToast({ title: '已满员', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已提交报名，等待审核', icon: 'success' });
};
</script>

<style lang="scss" scoped src="./detail.scss"></style>
