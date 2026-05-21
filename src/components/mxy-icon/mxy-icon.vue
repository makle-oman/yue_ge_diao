<template>
  <text
    class="mxy-icon"
    :class="[`weight-${weight}`, { filled }]"
    :style="iconStyle"
  >{{ name }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * 通用图标组件 - 基于 Material Symbols Outlined 字体
 *
 * 字体在 App.vue 通过 @import 'styles/icon-font.scss' 全局以 base64 内联注入,
 * 启动即可用,无需运行时加载,小程序/H5/App 三端一致。
 *
 * 用法:
 *   <mxy-icon name="map" />               // 默认 36rpx,继承色
 *   <mxy-icon name="favorite" filled />   // 实心填充
 *   <mxy-icon name="add" :size="48" color="#fff" weight="700" />
 *
 * 新增图标: 在 scripts/build-icon-font.mjs 的 ICON_NAMES 增加 ligature 名,重跑脚本。
 */
const props = withDefaults(defineProps<{
  /** Material Symbols 图标名(ligature),例如 'map'、'chat'、'chevron_right' */
  name: string;
  /** 图标尺寸 (rpx) */
  size?: number;
  /** 颜色,默认继承父元素 color */
  color?: string;
  /** 字重 100-700 */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** 是否实心填充 */
  filled?: boolean;
}>(), {
  size: 36,
  color: 'inherit',
  weight: 400,
  filled: false,
});

const iconStyle = computed(() => ({
  fontSize: props.size + 'rpx',
  width: props.size + 'rpx',
  height: props.size + 'rpx',
  lineHeight: props.size + 'rpx',
  color: props.color,
  fontVariationSettings: `'FILL' ${props.filled ? 1 : 0}, 'wght' ${props.weight}, 'GRAD' 0, 'opsz' 24`,
}));
</script>

<style lang="scss" scoped>
.mxy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: normal;
  font-feature-settings: 'liga';
  -webkit-font-feature-settings: 'liga';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  user-select: none;
  white-space: nowrap;
  letter-spacing: 0;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  direction: ltr;
}
</style>
