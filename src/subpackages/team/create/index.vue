<template>
  <view class="team-create">
    <mxy-form-nav title="发起组队" action-text="发布" @action="onSubmit" />

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 钓点 -->
        <view class="spot-card" @click="onPickSpot">
          <view class="spot-icon">
            <mxy-icon name="location_on" :size="40" color="#2D8F87" />
          </view>
          <view class="spot-text">
            <text class="spot-main">钓点</text>
            <text class="spot-sub">{{ form.spot }} · 可从地图选择</text>
          </view>
          <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
        </view>

        <!-- 字段卡 -->
        <view class="card">
          <view class="row" @click="onPickTime">
            <text class="row-label">时间</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.time }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickFish">
            <text class="row-label">目标鱼种</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.fish.join(' / ') }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row">
            <text class="row-label">人数限制</text>
            <view class="stepper">
              <view class="step-btn" @click="onStep(-1)">
                <text class="step-btn-text muted">−</text>
              </view>
              <text class="step-num">{{ form.max }}</text>
              <view class="step-btn" @click="onStep(1)">
                <text class="step-btn-text primary">+</text>
              </view>
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickCost">
            <text class="row-label">费用方式</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.cost }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row">
            <text class="row-label">需要拼车</text>
            <view class="switch" :class="{ on: form.carpool }" @click="form.carpool = !form.carpool">
              <view class="switch-dot" />
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="note-card">
          <text class="note-title">备注</text>
          <textarea
            class="note-input"
            v-model="form.note"
            placeholder="补充说明（早到时间 / 装备 / 拉群方式 等）"
            placeholder-style="color:#99A5AD"
            maxlength="200"
            auto-height
          />
        </view>

        <!-- 政策提醒 -->
        <view class="policy-card">
          <mxy-icon name="warning" :size="32" color="#F5A623" />
          <text class="policy-text">发布后公开到附近列表；爽约可被发起人标记并影响排序。</text>
        </view>

      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" @click="onSubmit">
        <text class="submit-btn-text">发布组队</text>
      </view>
    </view>

    <!-- 费用方式 Sheet (Design 39) -->
    <mxy-bottom-sheet
      v-model:visible="costOpen"
      title="费用方式"
      @done="onCostDone"
    >
      <view class="cost-current">
        <text class="cost-current-text">当前选择：{{ form.cost }}</text>
        <mxy-icon name="check_circle" :size="40" color="#2D8F87" />
      </view>

      <view class="cost-options-card">
        <view
          v-for="(opt, i) in costOptions"
          :key="opt.value"
        >
          <view class="cost-option" @click="draftCost = opt.value">
            <view class="cost-option-left">
              <mxy-icon :name="opt.icon" :size="40" :color="opt.value === draftCost ? '#2D8F87' : '#6B7B85'" />
              <text class="cost-option-text" :class="{ active: opt.value === draftCost }">{{ opt.label }}</text>
            </view>
            <mxy-icon
              :name="opt.value === draftCost ? 'check_circle' : 'radio_button_unchecked'"
              :size="40"
              :color="opt.value === draftCost ? '#2D8F87' : '#99A5AD'"
            />
          </view>
          <view v-if="i !== costOptions.length - 1" class="cost-divider" />
        </view>
      </view>

      <view class="cost-tip">
        <mxy-icon name="lightbulb" :size="36" color="#5BA9C4" />
        <text class="cost-tip-text">费用说明会展示在组队详情页，报名前所有钓友都能看到。</text>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';

const { safeBottom } = useSystemInfo();

const form = ref({
  spot: '燕子矶江边',
  time: '05月25日 05:30-11:00',
  fish: ['鲫鱼', '鲤鱼'],
  max: 6,
  cost: 'AA',
  carpool: true,
  note: '早口窗口短，建议 5 点前到。带抄网，岸边湿滑。',
});

const onPickSpot = () => uni.showToast({ title: '选择钓点 (待开发)', icon: 'none' });
const onPickTime = () => uni.showToast({ title: '选择时间 (待开发)', icon: 'none' });
const onPickFish = () => uni.showToast({ title: '选择鱼种 (待开发)', icon: 'none' });

type CostKey = 'AA' | '发起人请客' | '各自承担';
const costOptions: { value: CostKey; label: CostKey; icon: string }[] = [
  { value: 'AA',         label: 'AA',         icon: 'group' },
  { value: '发起人请客', label: '发起人请客', icon: 'volunteer_activism' },
  { value: '各自承担',   label: '各自承担',   icon: 'account_balance_wallet' },
];
const costOpen = ref(false);
const draftCost = ref<CostKey>('AA');

const onPickCost = () => {
  draftCost.value = form.value.cost as CostKey;
  costOpen.value = true;
};
const onCostDone = () => {
  form.value.cost = draftCost.value;
  costOpen.value = false;
};
const onStep = (delta: number) => {
  const next = form.value.max + delta;
  if (next < 2) {
    uni.showToast({ title: '至少 2 人', icon: 'none' });
    return;
  }
  if (next > 20) {
    uni.showToast({ title: '最多 20 人', icon: 'none' });
    return;
  }
  form.value.max = next;
};
const onSubmit = () => {
  if (!form.value.spot.trim()) {
    uni.showToast({ title: '请选择钓点', icon: 'none' });
    return;
  }
  if (form.value.fish.length === 0) {
    uni.showToast({ title: '请选择目标鱼种', icon: 'none' });
    return;
  }
  uni.showToast({ title: '已发布组队', icon: 'success' });
  setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
