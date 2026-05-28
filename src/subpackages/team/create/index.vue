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
            <text class="spot-sub">{{ form.spot || '请选择钓点' }} · 可从地图选择</text>
          </view>
          <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
        </view>

        <!-- 字段卡 -->
        <view class="card">
          <view class="row" @click="onPickTime">
            <text class="row-label">时间</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ timeLabel }}</text>
              <mxy-icon name="chevron_right" :size="26" color="#2D8F87" />
            </view>
          </view>
          <view class="divider" />

          <view class="row" @click="onPickFish">
            <text class="row-label">目标鱼种</text>
            <view class="row-value">
              <text class="row-value-text accent">{{ form.fish.length ? form.fish.join(' / ') : '请选择' }}</text>
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
        <text class="submit-btn-text">{{ submitting ? '发布中...' : '发布组队' }}</text>
      </view>
    </view>

    <!-- 时间选择 Sheet -->
    <mxy-bottom-sheet
      v-model:visible="timeOpen"
      title="出钓时间"
      @done="onTimeDone"
    >
      <view class="time-options-card">
        <picker mode="date" :value="draftDate" :start="todayDate" @change="onDraftDateChange">
          <view class="time-option">
            <view class="time-option-left">
              <mxy-icon name="event" :size="40" color="#2D8F87" />
              <text class="time-option-text">日期</text>
            </view>
            <text class="time-option-value">{{ draftDate }}</text>
          </view>
        </picker>
        <view class="time-divider" />
        <picker mode="time" :value="draftStartClock" @change="onDraftStartChange">
          <view class="time-option">
            <view class="time-option-left">
              <mxy-icon name="schedule" :size="40" color="#5BA9C4" />
              <text class="time-option-text">开始</text>
            </view>
            <text class="time-option-value">{{ draftStartClock }}</text>
          </view>
        </picker>
        <view class="time-divider" />
        <picker mode="time" :value="draftEndClock" @change="onDraftEndChange">
          <view class="time-option">
            <view class="time-option-left">
              <mxy-icon name="timer" :size="40" color="#F5A623" />
              <text class="time-option-text">结束</text>
            </view>
            <text class="time-option-value">{{ draftEndClock }}</text>
          </view>
        </picker>
      </view>

      <view class="time-tip">
        <mxy-icon name="lightbulb" :size="36" color="#5BA9C4" />
        <text class="time-tip-text">结束时间需要晚于开始时间；跨天行程先按当天创建，后续再补跨天选择。</text>
      </view>
    </mxy-bottom-sheet>

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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';
import MxyFormNav from '@/components/mxy-form-nav/mxy-form-nav.vue';
import { createTeam, type CostMode } from '@/api/teams';

const { safeBottom } = useSystemInfo();

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function combineLocal(date: string, clock: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = clock.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const todayDate = toDateInput(new Date());
const defaultDate = toDateInput(tomorrow);

const form = ref({
  spot: '',
  spotId: '',
  startDate: defaultDate,
  startClock: '05:30',
  endClock: '11:00',
  fish: [] as string[],
  max: 6,
  cost: 'AA',
  carpool: true,
  note: '',
});

const submitting = ref(false);
const timeOpen = ref(false);
const draftDate = ref(form.value.startDate);
const draftStartClock = ref(form.value.startClock);
const draftEndClock = ref(form.value.endClock);

const timeLabel = computed(() => {
  const d = combineLocal(form.value.startDate, form.value.startClock);
  return `${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${form.value.startClock}-${form.value.endClock}`;
});

function onFishSelected(payload: unknown) {
  const data = payload as { name?: string; names?: string[] };
  const names = Array.isArray(data.names) && data.names.length
    ? data.names
    : data.name
      ? [data.name]
      : [];
  if (names.length) form.value.fish = names;
}

function onSpotSelected(payload: unknown) {
  const data = payload as { id?: string; name?: string };
  if (!data.id || !data.name) return;
  form.value.spotId = data.id;
  form.value.spot = data.name;
}

const onPickSpot = () => {
  const selected = encodeURIComponent(form.value.spotId || '');
  const target = encodeURIComponent('team:create');
  uni.navigateTo({ url: `/subpackages/catch/spot-picker/index?selected=${selected}&target=${target}` });
};
const onPickTime = () => {
  draftDate.value = form.value.startDate;
  draftStartClock.value = form.value.startClock;
  draftEndClock.value = form.value.endClock;
  timeOpen.value = true;
};
const onPickFish = () => {
  const selected = encodeURIComponent(form.value.fish[0] || '');
  const target = encodeURIComponent('team:create');
  uni.navigateTo({ url: `/subpackages/catch/fish-picker/index?selected=${selected}&target=${target}` });
};

const onDraftDateChange = (e: { detail: { value: string } }) => {
  draftDate.value = e.detail.value;
};
const onDraftStartChange = (e: { detail: { value: string } }) => {
  draftStartClock.value = e.detail.value;
};
const onDraftEndChange = (e: { detail: { value: string } }) => {
  draftEndClock.value = e.detail.value;
};
const onTimeDone = () => {
  const start = combineLocal(draftDate.value, draftStartClock.value);
  const end = combineLocal(draftDate.value, draftEndClock.value);
  if (end.getTime() <= start.getTime()) {
    uni.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
    return;
  }
  form.value.startDate = draftDate.value;
  form.value.startClock = draftStartClock.value;
  form.value.endClock = draftEndClock.value;
};

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
function costToMode(cost: string): CostMode {
  if (cost === 'AA') return 'aa';
  if (cost === '发起人请客') return 'host';
  return 'self';
}

const onSubmit = async () => {
  if (submitting.value) return;
  if (!form.value.spotId) {
    uni.showToast({ title: '请选择钓点', icon: 'none' });
    return;
  }
  if (form.value.fish.length === 0) {
    uni.showToast({ title: '请选择目标鱼种', icon: 'none' });
    return;
  }
  const start = combineLocal(form.value.startDate, form.value.startClock);
  const end = combineLocal(form.value.startDate, form.value.endClock);
  if (end.getTime() <= start.getTime()) {
    uni.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    await createTeam({
      spotId: form.value.spotId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      targetFish: form.value.fish,
      maxPeople: form.value.max,
      costMode: costToMode(form.value.cost),
      needCarpool: form.value.carpool,
      note: form.value.note || undefined,
    });
    uni.showToast({ title: '已发布组队', icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: 1 }).catch(() => {}), 800);
  } catch (e) {
    console.warn('[team-create] submit failed', e);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  uni.$on('team:create:fish-selected', onFishSelected);
  uni.$on('team:create:spot-selected', onSpotSelected);
});

onUnmounted(() => {
  uni.$off('team:create:fish-selected', onFishSelected);
  uni.$off('team:create:spot-selected', onSpotSelected);
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
