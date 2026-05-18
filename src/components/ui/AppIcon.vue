<template>
  <text
    class="app-icon"
    :class="['ic-' + name]"
    :style="{ fontSize: size + 'rpx', color: color, width: size + 'rpx', height: size + 'rpx', lineHeight: size + 'rpx' }"
  >{{ glyph }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  size?: number;
  color?: string;
}>(), {
  size: 36,
  color: 'inherit',
});

// 临时方案：用 Unicode/Emoji 占位。后期可换成 iconfont/SVG sprite。
const glyphMap: Record<string, string> = {
  back: '‹',
  close: '✕',
  search: '\u{1F50D}',
  bell: '\u{1F514}',
  bell_dot: '\u{1F514}',
  location: '\u{1F4CD}',
  pin: '\u{1F4CD}',
  plus: '+',
  edit: '✎',
  share: '↪',
  more: '…',
  arrow_down: '▾',
  arrow_right: '›',
  arrow_up: '▴',
  star: '★',
  star_o: '☆',
  heart: '♥',
  heart_o: '♡',
  comment: '\u{1F4AC}',
  message: '\u{1F4AC}',
  fish: '\u{1F41F}',
  team: '\u{1F465}',
  user: '\u{1F464}',
  map: '\u{1F5FA}',
  weather: '☀',
  wind: '\u{1F32C}',
  thermo: '\u{1F321}',
  camera: '\u{1F4F7}',
  image: '\u{1F5BC}',
  check: '✓',
  cross: '✕',
  trophy: '\u{1F3C6}',
  settings: '⚙',
  navigate: '➜',
  parking: 'P',
  toilet: 'WC',
  shop: '\u{1F6D2}',
  privacy: '\u{1F512}',
  filter: '≡',
  notice: '\u{1F4E2}',
  wechat: '\u{1F4AC}',
  phone: '\u{1F4F1}',
  refresh: '↻',
};

const glyph = computed(() => glyphMap[props.name] ?? props.name);
</script>

<style lang="scss" scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-style: normal;
  user-select: none;
}
</style>
