/**
 * build-icon-font.mjs
 *
 * 一次性脚本: 从 Google Fonts CSS API 拉取 Material Symbols Outlined 字体的
 * 「子集 woff2」(只包含我们实际用到的图标 ligature),转 base64,
 * 写入 src/styles/icon-font.scss。前端只要 import 这个 scss,启动即可零网络
 * 请求渲染图标 —— 小程序也支持 @font-face base64。
 *
 * 用法:
 *   node scripts/build-icon-font.mjs
 *
 * 增减图标:
 *   1. 直接在 ICON_NAMES 列表里增删
 *   2. 重跑脚本
 *
 * 工作原理:
 *   Google Fonts API 在 URL 加 `&icon_names=map,chat,...` 即返回服务器端
 *   子集化的 CSS,其中包含一个 https://fonts.gstatic.com/... 的 woff2 URL,
 *   下载该 URL 即得到极小的子集字体。Material Symbols 全字体 ~4MB,80 个
 *   图标的子集通常 < 25KB。
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(PROJECT_ROOT, 'src/styles/icon-font.scss');

const FONT_FAMILY = 'Material Symbols Outlined';

/** 项目中所有用到的 Material Symbols ligature 名,按字母排序便于增减。 */
const ICON_NAMES = [
  'account_balance_wallet',
  'add',
  'add_a_photo',
  'add_circle',
  'add_location',
  'add_location_alt',
  'add_photo_alternate',
  'alternate_email',
  'arrow_back',
  'arrow_back_ios_new',
  'arrow_drop_down',
  'arrow_drop_up',
  'arrow_forward',
  'block',
  'call',
  'campaign',
  'chat',
  'chat_bubble',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'close',
  'cloud',
  'device_thermostat',
  'edit',
  'emoji_events',
  'expand_less',
  'expand_more',
  'favorite',
  'favorite_border',
  'group',
  'groups',
  'image',
  'info',
  'ios_share',
  'keyboard_arrow_down',
  'keyboard_arrow_up',
  'lightbulb',
  'local_fire_department',
  'location_on',
  'lock',
  'map',
  'more_horiz',
  'my_location',
  'nature',
  'navigation',
  'near_me',
  'notifications',
  'notifications_off',
  'park',
  'payments',
  'person',
  'phishing',
  'photo_library',
  'pool',
  'radio_button_checked',
  'radio_button_unchecked',
  'report',
  'sailing',
  'schedule',
  'search',
  'send',
  'sentiment_satisfied',
  'set_meal',
  'settings',
  'share',
  'shield',
  'star',
  'tune',
  'verified',
  'verified_user',
  'visibility_off',
  'volunteer_activism',
  'warning',
  'water',
  'water_drop',
  'waves',
  'wb_sunny',
];

/** 假装成浏览器,否则 Google 会返回不含 woff2 (而是 ttf) 的 CSS。 */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const main = async () => {
  const cssUrl = new URL('https://fonts.googleapis.com/css2');
  // Material Symbols Outlined 变体字体,锁定 fill=0、wght=400、grad=0、opsz=24
  cssUrl.searchParams.set('family', `${FONT_FAMILY}:opsz,wght,FILL,GRAD@24,400,0,0`);
  cssUrl.searchParams.set('icon_names', ICON_NAMES.join(','));
  cssUrl.searchParams.set('display', 'block');

  console.log(`[1/4] 请求 Google Fonts CSS API ...`);
  console.log(`      ${cssUrl.toString()}`);

  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!cssRes.ok) {
    throw new Error(`CSS 请求失败: ${cssRes.status} ${cssRes.statusText}`);
  }
  const css = await cssRes.text();

  const woff2Match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)\s+format\(['"]woff2['"]\)/);
  if (!woff2Match) {
    console.error('--- CSS 内容 ---');
    console.error(css);
    throw new Error('未在 CSS 中找到 woff2 URL,可能 Google 接口变更');
  }
  const woff2Url = woff2Match[1];
  console.log(`[2/4] 下载子集 woff2: ${woff2Url}`);

  const fontRes = await fetch(woff2Url);
  if (!fontRes.ok) {
    throw new Error(`字体下载失败: ${fontRes.status} ${fontRes.statusText}`);
  }
  const fontBuf = Buffer.from(await fontRes.arrayBuffer());
  const kb = (fontBuf.length / 1024).toFixed(1);
  console.log(`      ${fontBuf.length} bytes (${kb} KB)`);

  if (fontBuf.length > 80 * 1024) {
    console.warn(
      `⚠️  子集字体超过 80KB,可能 icon_names 过多或 Google 没做子集化,请检查`,
    );
  }

  const base64 = fontBuf.toString('base64');
  console.log(`[3/4] base64 长度: ${base64.length} chars`);

  const banner =
    `/**\n * 自动生成 - 请勿手动编辑\n` +
    ` * 重新生成: node scripts/build-icon-font.mjs\n` +
    ` * 包含图标: ${ICON_NAMES.length} 个\n` +
    ` * 字体大小: ${kb} KB (base64: ${(base64.length / 1024).toFixed(1)} KB)\n */\n\n`;

  const scss =
    banner +
    `@font-face {\n` +
    `  font-family: '${FONT_FAMILY}';\n` +
    `  font-style: normal;\n` +
    `  font-weight: 100 700;\n` +
    `  font-display: block;\n` +
    `  src: url(data:font/woff2;base64,${base64}) format('woff2');\n` +
    `}\n`;

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, scss, 'utf8');
  console.log(`[4/4] 已写入 ${OUTPUT_PATH}`);
  console.log(`\n✅ 完成。在 App.vue 全局样式里 @import 该文件即可。`);
};

main().catch((err) => {
  console.error('\n❌ 失败:', err.message);
  process.exit(1);
});
