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
          @click="activeFilter = c.key"
        >
          <text>{{ c.label }}</text>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view class="content" scroll-y>
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
      </view>

      <view class="end-pad" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemInfo } from '@/utils/useSystemInfo';

const { statusBarHeight } = useSystemInfo();

const filters = [
  { key: 'nearby', label: '附近' },
  { key: 'weekend', label: '本周末' },
  { key: 'carpool', label: '可拼车' },
];
const activeFilter = ref('nearby');

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
}

const teams = ref<Team[]>([
  {
    id: 't1',
    title: '周六清晨 · 燕子矶江边',
    meta: '05月25日 05:30-11:00 · 2.3km · 目标鲫鱼/鲤鱼',
    statusText: '招募中',
    statusTone: 'primary',
    avatars: ['primary', 'blue', 'orange'],
    peopleSummary: '已报名 3/6 · AA · 需要拼车',
    owner: '老周野钓',
    btnText: '报名',
    btnTone: 'primary',
  },
  {
    id: 't2',
    title: '今晚夜钓 · 秦淮河外湾',
    meta: '今天 20:00-02:00 · 6.8km · 主攻鲤鱼',
    statusText: '剩1位',
    statusTone: 'accent',
    avatars: ['primary', 'blue', 'orange'],
    peopleSummary: '已报名 5/6 · 各自承担 · 不拼车',
    owner: '钓鱼阿强',
    btnText: '报名',
    btnTone: 'primary',
  },
  {
    id: 't3',
    title: '路亚晨口 · 江心洲北汊',
    meta: '05月26日 05:00-09:00 · 4.5km · 翘嘴/鲈鱼',
    statusText: '已满员',
    statusTone: 'muted',
    avatars: ['blue', 'primary', 'orange'],
    peopleSummary: '已报名 4/4 · AA · 可旁观',
    owner: '阿峰路亚',
    btnText: '查看',
    btnTone: 'ghost',
  },
]);

const onCreate = () => uni.navigateTo({ url: '/subpackages/team/create' });
const onOpen = (t: Team) => uni.navigateTo({ url: `/subpackages/team/detail?id=${t.id}` });
const onBack = () => uni.navigateBack({ delta: 1 }).catch(() => {});
const onJoin = (t: Team) => {
  if (t.btnTone === 'ghost') {
    onOpen(t);
    return;
  }
  uni.showToast({ title: `已申请加入「${t.title}」`, icon: 'success' });
};
</script>

<style lang="scss" scoped src="./list.scss"></style>
