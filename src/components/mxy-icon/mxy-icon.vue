<template>
  <text
    class="mxy-icon"
    :class="[`weight-${weight}`, { filled }]"
    :style="iconStyle"
  >{{ glyph }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * 通用图标组件 - 基于 Material Symbols Outlined 字体
 *
 * 用法:
 *   <mxy-icon name="map" />               // 默认 36rpx,继承色
 *   <mxy-icon name="favorite" filled />   // 实心填充
 *   <mxy-icon name="add" :size="48" color="#fff" weight="700" />
 *
 * name 直接对应 Material Symbols 图标的 ligature 名称,
 * 例如设计稿里的 'map' / 'chat' / 'person' / 'chevron_right' 等。
 * 完整图标库见 https://fonts.google.com/icons
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

/**
 * 兜底字符映射 - 仅在字体加载失败时显示,确保不会出现连字未生效的乱码。
 * Key 是 Material Symbols 的 ligature 名,Value 是降级 Unicode 字符。
 */
const FALLBACK_GLYPH: Record<string, string> = {
  arrow_back_ios_new: '‹',
  chevron_right: '›',
  chevron_left: '‹',
  close: '✕',
  add: '+',
  check: '✓',
  search: '🔍',
  map: '🗺',
  chat: '💬',
  person: '👤',
  notifications: '🔔',
  favorite: '♥',
  share: '↪',
  more_horiz: '⋯',
  edit: '✎',
  settings: '⚙',
  my_location: '📍',
  location_on: '📍',
};

const glyph = computed(() => props.name);

const iconStyle = computed(() => ({
  fontSize: props.size + 'rpx',
  width: props.size + 'rpx',
  height: props.size + 'rpx',
  lineHeight: props.size + 'rpx',
  color: props.color,
  fontVariationSettings: `'FILL' ${props.filled ? 1 : 0}, 'wght' ${props.weight}, 'GRAD' 0, 'opsz' 24`,
}));

// 用于在 console 中查询兜底字符(暂时未启用,但保留)
const _fallback = FALLBACK_GLYPH;
void _fallback;
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
