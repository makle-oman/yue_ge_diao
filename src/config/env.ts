/**
 * 运行时配置
 *
 * 用 Vite 注入的 `import.meta.env.MODE`（uni-app 也基于 Vite）区分开发/生产 baseUrl：
 *   - 开发：MODE === 'development'
 *   - 生产：MODE === 'production'
 *
 * 不用 `process.env`：H5 端没有 Node process 对象，浏览器会报 ReferenceError。
 * 后端 main.ts 已 `app.enableCors({ origin: true, credentials: true })`，
 * 因此本地 localhost:3000 可直接联调，不需 Vite dev-server 代理。
 */

const isDev = import.meta.env.MODE !== 'production';

export const env = {
  /** 后端 API 根地址（含 /api 前缀，与后端 setGlobalPrefix 对齐） */
  apiBaseUrl: isDev
    ? 'http://localhost:3000/api'
    : 'https://api.yuegediao.example.com/api',

  /** 请求超时（ms） */
  requestTimeout: 15_000,

  /** 是否启用 dev-login 兜底入口（生产环境隐藏） */
  enableDevLogin: isDev,
};
