<template>
  <view class="contact-page">
    <!-- 标准导航 -->
    <mxy-form-nav title="联系队长" @back="onBack" />

    <scroll-view class="contact-scroll" scroll-y>
      <!-- 队长卡 -->
      <view class="owner-card">
        <view class="owner-avatar" :style="{ background: owner.avBg }">
          <text class="owner-avatar-text">{{ owner.avText }}</text>
        </view>
        <view class="owner-info">
          <text class="owner-name">{{ owner.name }}</text>
          <text class="owner-meta">{{ owner.meta }}</text>
          <view class="owner-tags">
            <view class="owner-tag tag-primary"><text>实名</text></view>
            <view class="owner-tag tag-blue"><text>常去江边</text></view>
          </view>
        </view>
      </view>

      <!-- 组队预览 -->
      <view class="team-preview">
        <text class="team-title">{{ team.title }}</text>
        <text class="team-meta">{{ team.meta }}</text>
        <view class="team-badges">
          <view class="badge badge-orange"><text>需确认装备</text></view>
          <view class="badge badge-primary"><text>可拼车</text></view>
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
      <view class="btn-primary" :class="{ disabled: !canApply }" @click="onApply">
        <text>联系并申请加入</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const { safeBottom } = useSystemInfo();

const owner = ref({
  name: '队长 · 阿峰路亚',
  meta: '信用 96 · 已发起 18 次 · 回复快',
  avText: '阿',
  avBg: '#EAF5F4',
});

const team = ref({
  title: '周六清晨一起出钓',
  meta: '燕子矶江边 · 05月25日 05:30 · 3/4人',
});

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

const checklist = ref<CheckItem[]>([
  { id: 'time', label: '我能按集合时间到达', checked: true },
  { id: 'park', label: '需要队长确认停车点', checked: false },
  { id: 'cost', label: '已阅读安全与费用说明', checked: false },
]);

const leaveMsg = ref('我可以准时到,想确认一下集合点和是否需要带饵料。');

const canApply = computed(() => checklist.value.every(i => i.checked));

const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const toggle = (idx: number) => {
  checklist.value[idx].checked = !checklist.value[idx].checked;
};
const onChat = () => {
  uni.navigateTo({
    url: '/subpackages/message/conversation/index?peer=' + encodeURIComponent(owner.value.name),
  });
};
const onApply = () => {
  if (!canApply.value) {
    uni.showToast({ title: '请先勾选确认项', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已提交申请', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }), 800);
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
