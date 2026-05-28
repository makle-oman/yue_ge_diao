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
            <text class="spot-main">{{ form.spotName || '选择钓点' }}</text>
            <text class="spot-sub">{{ form.spotName ? '点击重新选择' : '从已收录的钓点中挑选' }}</text>
          </view>
          <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
        </view>

        <!-- 字段卡 -->
        <view class="card">
          <view class="row">
            <text class="row-label">开始日期</text>
            <picker
              mode="date"
              :value="form.date"
              :start="todayStr"
              @change="onPickDate"
            >
              <view class="row-value">
                <text class="row-value-text accent">{{ form.date || '请选择' }}</text>
                <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
              </view>
            </picker>
          </view>
          <view class="divider" />

          <view class="row">
            <text class="row-label">开始时间</text>
            <picker mode="time" :value="form.startHm" @change="onPickStart">
              <view class="row-value">
                <text class="row-value-text accent">{{ form.startHm || '请选择' }}</text>
                <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
              </view>
            </picker>
          </view>
          <view class="divider" />

          <view class="row">
            <text class="row-label">结束时间</text>
            <picker mode="time" :value="form.endHm" @change="onPickEnd">
              <view class="row-value">
                <text class="row-value-text accent">{{ form.endHm || '请选择' }}</text>
                <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
              </view>
            </picker>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickFish">
            <text class="row-label">目标鱼种</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.fish.length ? form.fish.join(' / ') : '选填' }}</text>
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
              <text class="row-value-text accent">{{ COST_LABEL[form.costMode] }}</text>
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
            placeholder="补充说明(早到时间 / 装备 / 拉群方式 等)"
            placeholder-style="color:#99A5AD"
            maxlength="200"
            auto-height
          />
        </view>

        <!-- 政策提醒 -->
        <view class="policy-card">
          <mxy-icon name="warning" :size="32" color="#F5A623" />
          <text class="policy-text">发布后公开到附近列表;爽约可被发起人标记并影响排序。</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="bottom-bar" :style="{ paddingBottom: 20 + safeBottom + 'px' }">
      <view class="submit-btn" :class="{ disabled: submitting }" @click="onSubmit">
        <text class="submit-btn-text">{{ submitting ? '发布中...' : '发布组队' }}</text>
      </view>
    </view>

    <!-- 费用方式 Sheet -->
    <mxy-bottom-sheet
      v-model:visible="costOpen"
      title="费用方式"
      @done="onCostDone"
    >
      <view class="cost-current">
        <text class="cost-current-text">当前选择:{{ COST_LABEL[draftCost] }}</text>
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
        <text class="cost-tip-text">费用说明会展示在组队详情页,报名前所有钓友都能看到。</text>
      </view>
    </mxy-bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import { createTeam, type CostMode } from '@/api/teams';
import { BizError } from '@/utils/request';

const { safeBottom } = useSystemInfo();

const COST_LABEL: Record<CostMode, string> = {
  aa: 'AA',
  host: '发起人请客',
  self: '各自承担',
};

interface FormState {
  spotId: string;
  spotName: string;
  date: string; // YYYY-MM-DD
  startHm: string; // HH:mm
  endHm: string;
  fish: string[];
  max: number;
  costMode: CostMode;
  carpool: boolean;
  note: string;
}

function todayDateStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function defaultStartHm(): string {
  // 默认明天早上 5:30
  const d = new Date();
  d.setHours(5, 30, 0, 0);
  return '05:30';
}

const todayStr = todayDateStr();

const form = ref<FormState>({
  spotId: '',
  spotName: '',
  date: todayStr,
  startHm: defaultStartHm(),
  endHm: '11:00',
  fish: [],
  max: 6,
  costMode: 'aa',
  carpool: false,
  note: '',
});

const submitting = ref(false);
const costOpen = ref(false);
const draftCost = ref<CostMode>('aa');
const costOptions: { value: CostMode; label: string; icon: string }[] = [
  { value: 'aa', label: 'AA', icon: 'group' },
  { value: 'host', label: '发起人请客', icon: 'volunteer_activism' },
  { value: 'self', label: '各自承担', icon: 'account_balance_wallet' },
];

const onPickSpot = () =>
  uni.navigateTo({
    url: '/subpackages/catch/spot-picker/index',
    events: {
      spotSelected: (data: { id: string; name: string }) => {
        form.value.spotId = data.id;
        form.value.spotName = data.name;
      },
    },
    success: (res) => {
      if (form.value.spotId) {
        res.eventChannel?.emit?.('initSpot', { id: form.value.spotId });
      }
    },
  });

const onPickFish = () =>
  uni.navigateTo({
    url: '/subpackages/catch/fish-picker/index',
    events: {
      fishSelected: (data: string[]) => {
        form.value.fish = Array.isArray(data) ? data : [];
      },
    },
    success: (res) => {
      res.eventChannel?.emit?.('initFish', [...form.value.fish]);
    },
  });

const onPickDate = (e: { detail: { value: string } }) => {
  form.value.date = e.detail.value;
};
const onPickStart = (e: { detail: { value: string } }) => {
  form.value.startHm = e.detail.value;
};
const onPickEnd = (e: { detail: { value: string } }) => {
  form.value.endHm = e.detail.value;
};

const onPickCost = () => {
  draftCost.value = form.value.costMode;
  costOpen.value = true;
};
const onCostDone = () => {
  form.value.costMode = draftCost.value;
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

function buildIso(date: string, hm: string): string {
  // date=YYYY-MM-DD, hm=HH:mm → 本地时间 ISO
  const d = new Date(`${date}T${hm}:00`);
  return d.toISOString();
}

const onSubmit = async () => {
  if (submitting.value) return;
  if (!form.value.spotId) {
    uni.showToast({ title: '请选择钓点', icon: 'none' });
    return;
  }
  if (!form.value.date || !form.value.startHm || !form.value.endHm) {
    uni.showToast({ title: '请完善时间', icon: 'none' });
    return;
  }
  const startIso = buildIso(form.value.date, form.value.startHm);
  const endIso = buildIso(form.value.date, form.value.endHm);
  if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
    uni.showToast({ title: '结束时间需晚于开始', icon: 'none' });
    return;
  }
  submitting.value = true;
  try {
    await createTeam({
      spotId: form.value.spotId,
      startTime: startIso,
      endTime: endIso,
      targetFish: form.value.fish.length ? form.value.fish : undefined,
      maxPeople: form.value.max,
      costMode: form.value.costMode,
      needCarpool: form.value.carpool,
      note: form.value.note.trim() || undefined,
    });
    uni.showToast({ title: '已发布组队', icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
  } catch (e) {
    const msg = e instanceof BizError ? e.msg : '发布失败';
    uni.showToast({ title: msg, icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
