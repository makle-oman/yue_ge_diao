/**
 * 加载 Material Symbols Outlined 图标字体
 *
 * 设计稿（约个钓.pen）所有图标均使用 Material Symbols Outlined 字体集，
 * 此处通过 uni.loadFontFace 跨端加载该字体，加载后整个 App 可用 ligature 名
 * 渲染图标（例如 `<text class="ms">map</text>` 会渲染成地图图标）。
 *
 * 生产环境建议把字体文件托管到自家 CDN 或随小程序包发布（local font）。
 */

const FONT_FAMILY = 'Material Symbols Outlined';

const FONT_SOURCES: Record<'woff2' | 'woff', string> = {
  woff2:
    "url('https://cdn.jsdelivr.net/npm/material-symbols@0.14.5/material-symbols-outlined.woff2') format('woff2')",
  woff:
    "url('https://cdn.jsdelivr.net/npm/material-symbols@0.14.5/material-symbols-outlined.woff') format('woff')",
};

let loaded = false;
let loadingPromise: Promise<void> | null = null;

export function loadIconFont(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve) => {
    // #ifdef H5
    // H5 端通过 CSS @font-face 注入更稳，避开 loadFontFace 在某些浏览器对 woff2 检测异常
    const id = '__mxy_material_symbols_font__';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @font-face {
          font-family: '${FONT_FAMILY}';
          font-style: normal;
          font-weight: 100 700;
          font-display: block;
          src: ${FONT_SOURCES.woff2}, ${FONT_SOURCES.woff};
        }
      `;
      document.head.appendChild(style);
    }
    loaded = true;
    resolve();
    return;
    // #endif

    // #ifndef H5
    uni.loadFontFace({
      family: FONT_FAMILY,
      source: FONT_SOURCES.woff2,
      desc: { style: 'normal', weight: 'normal', variant: 'normal' },
      // @ts-ignore - global 仅在部分小程序端可用,但 uni 类型未声明
      global: true,
      success: () => {
        loaded = true;
        resolve();
      },
      fail: (err) => {
        // 字体加载失败不应阻塞 App 启动,降级使用兜底符号
        console.warn('[loadIconFont] 字体加载失败,将使用兜底字符', err);
        resolve();
      },
    });
    // #endif
  });

  return loadingPromise;
}

export const ICON_FONT_FAMILY = FONT_FAMILY;
