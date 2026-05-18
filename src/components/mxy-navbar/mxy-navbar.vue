<template>
  <view class="mxy-navbar" :class="{ transparent }" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-inner">
      <view class="left-slot" @click="onBack">
        <slot name="left">
          <mxy-icon v-if="showBack" name="arrow_back_ios_new" :size="40" :color="iconColor" />
        </slot>
      </view>

      <view class="title-slot">
        <slot name="title">
          <text class="title-text" :style="{ color: textColor }">{{ title }}</text>
        </slot>
      </view>

      <view class="right-slot">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MxyIcon from '@/components/mxy-icon/mxy-icon.vue';

const props = withDefaults(defineProps<{
  title?: string;
  showBack?: boolean;
  /** 透明背景 (用于 Hero 图上方的导航栏) */
  transparent?: boolean;
  /** 透明态下的图标/文字颜色 */
  inverseColor?: string;
}>(), {
  title: '',
  showBack: true,
  transparent: false,
  inverseColor: '#FFFFFF',
});

const emit = defineEmits<{ (e: 'back'): void }>();

const statusBarHeight = ref(0);
try {
  // uni 同步 API,可能在 SSR 阶段报错,做容错
  const sys = uni.getSystemInfoSync();
  statusBarHeight.value = sys.statusBarHeight || 20;
} catch (_e) {
  statusBarHeight.value = 20;
}

const iconColor = computed(() => (props.transparent ? props.inverseColor : '#1A2B33'));
const textColor = computed(() => (props.transparent ? props.inverseColor : '#1A2B33'));

const onBack = () => {
  emit('back');
  uni.navigateBack({ delta: 1 }).catch(() => {
    uni.switchTab({ url: '/pages/index/index' }).catch(() => {});
  });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.mxy-navbar {
  position: relative;
  background: $bg-card;
  border-bottom: 1rpx solid $border-light;
  z-index: 10;

  &.transparent {
    background: transparent;
    border-bottom: none;
  }
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $space-sm;
}

.left-slot, .right-slot {
  min-width: 88rpx;
  display: flex;
  align-items: center;
}
.right-slot { justify-content: flex-end; }

.title-slot {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-text {
  font-size: $font-lg;
  font-weight: 800;
  line-height: 1;
}
</style>
