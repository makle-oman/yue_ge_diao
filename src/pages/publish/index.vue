<template>
  <view class="publish-sheet" @click="onClose">
    <!-- 底部弹层（阻止冒泡，避免点击面板内部触发关闭） -->
    <view class="sheet" @click.stop>
      <view class="handle" />
      <text class="title">发布内容</text>

      <view
        v-for="(it, idx) in items"
        :key="it.key"
        class="row"
        @click="onPick(it)"
      >
        <view class="row-icon" :class="`tone-${it.tone}`">
          <mxy-icon :name="it.icon" :size="40" color="#fff" />
        </view>
        <view class="row-text">
          <text class="row-main">{{ it.main }}</text>
          <text class="row-sub">{{ it.sub }}</text>
        </view>
        <mxy-icon name="chevron_right" :size="32" color="#99A5AD" />
        <view v-if="idx < items.length - 1" class="row-divider" />
      </view>

      <view class="spacer" />

      <view class="cancel-btn" @click="onClose">
        <text class="cancel-text">取消</text>
      </view>

      <view class="safe-pad" :style="{ height: safeBottom + 'px' }" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '@/utils/useSystemInfo';

const { safeBottom } = useSystemInfo();

type Tone = 'primary' | 'secondary' | 'accent';

interface PickItem {
  key: 'catch' | 'spot' | 'team';
  main: string;
  sub: string;
  icon: string;
  tone: Tone;
  path: string;
}

const items: PickItem[] = [
  { key: 'catch', main: '发布鱼获',     sub: '晒出今日战绩',     icon: 'phishing',     tone: 'primary',   path: '/subpackages/catch/create/index' },
  { key: 'spot',  main: '上报新钓点',   sub: '分享你发现的好地方', icon: 'add_location', tone: 'secondary', path: '/subpackages/spot/create/index' },
  { key: 'team',  main: '发起组队约钓', sub: '找搭子一起出钓',   icon: 'groups',       tone: 'accent',    path: '/subpackages/team/create/index' },
];

const onPick = (it: PickItem) => {
  // redirectTo 让发布面板不堆积在导航栈里
  uni.redirectTo({ url: it.path }).catch(() => {
    uni.navigateTo({ url: it.path });
  });
};

const onClose = () => uni.navigateBack({ delta: 1 }).catch(() => {});
</script>

<style lang="scss" scoped src="./index.scss"></style>
