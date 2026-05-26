/**
 * HTTP 请求封装
 *
 * 对 uni.request 做一层 Promise 化 + 业务约定处理：
 *   1. 自动拼接 baseUrl
 *   2. 自动注入 Authorization: Bearer <token>
 *   3. 自动注入 X-Trace-Id（前端生成短 ID，方便和后端日志对齐）
 *   4. 自动解包后端响应信封 { code, msg, data, traceId }：
 *        - code === 200     → resolve(data)（业务成功，与 HTTP 200 同义）
 *        - HTTP 401 + 有 refresh token → 走静默刷新 + 重发(单实例 + 排队)
 *        - HTTP 401 + 无 refresh / 刷新失败 → 清 token + 跳登录页 + reject
 *        - 其他业务码        → reject(new BizError(code, msg))
 *   5. HTTP 网络层错误（断网、超时）→ reject(new BizError(-1, errMsg))
 *
 * 为什么不用 axios：
 *   小程序端没有 XMLHttpRequest，axios 跑不起来；uni.request 是跨端唯一通用方案。
 */

import { env } from '@/config/env';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  logout as authLogout,
} from '@/utils/auth';

/** 业务成功码（与 HTTP 200 同义，所有非 200 一律视为失败） */
export const SUCCESS_CODE = 200;

/** 后端统一响应信封 */
export interface ApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
  traceId?: string;
}

/** 业务错误：code !== 0 时抛出 */
export class BizError extends Error {
  constructor(public code: number, public msg: string, public traceId?: string) {
    super(msg);
    this.name = 'BizError';
  }
}

export interface RequestOptions {
  /** 接口路径，以 / 开头，例如 /auth/dev-login */
  url: string;
  /** HTTP 方法；后端走 RPC 风格 POST，因此默认 POST */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 请求体 / Query；POST 走 body，GET 走 query。
   * 用 `object` 而非 `Record<string, unknown>` 才能接住 interface 类型
   * （interface 默认没有 string index signature） */
  data?: object | unknown[];
  /** 额外请求头 */
  header?: Record<string, string>;
  /** 是否跳过自动注入 token（登录/refresh 接口可设 true） */
  skipAuth?: boolean;
  /** 是否在出错时自动 Toast（默认 true） */
  showErrorToast?: boolean;
  /** 内部:本次请求是否已经过 401 重试,防止死循环 */
  _retried?: boolean;
}

let redirectingToLogin = false;
// 单实例 refresh promise:并发 401 共享同一次刷新
let refreshingPromise: Promise<string> | null = null;

function genTraceId(): string {
  // 短 trace：8 位时间戳 + 4 位随机；后端会优先用 header 里的值
  const t = Date.now().toString(36).slice(-6);
  const r = Math.random().toString(36).slice(2, 6);
  return `c_${t}${r}`;
}

function redirectToLogin() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  setTimeout(() => {
    uni.redirectTo({
      url: '/pages/login/index',
      complete: () => {
        redirectingToLogin = false;
      },
    });
  }, 50);
}

/**
 * 启动一次 refresh(全局单飞)。成功 resolve 新 access token,失败 reject。
 * 不论成功失败,都把 refreshingPromise 在 finally 里清空,允许下一次重试。
 *
 * 用 dynamic import 加载 api/auth 避免 request.ts ↔ api/auth.ts 顶层循环。
 */
function doRefresh(): Promise<string> {
  if (refreshingPromise) return refreshingPromise;

  const rt = getRefreshToken();
  if (!rt) {
    return Promise.reject(new BizError(401, 'refresh token missing'));
  }

  refreshingPromise = (async () => {
    const { refreshTokens } = await import('@/api/auth');
    const pair = await refreshTokens(rt);
    setToken(pair.token);
    setRefreshToken(pair.refreshToken);
    return pair.token;
  })().finally(() => {
    refreshingPromise = null;
  });

  return refreshingPromise;
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'POST',
    data,
    header = {},
    skipAuth = false,
    showErrorToast = true,
    _retried = false,
  } = options;

  const token = skipAuth ? '' : getToken();
  const traceId = genTraceId();

  const fullHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Trace-Id': traceId,
    ...header,
  };
  if (token) {
    fullHeader.Authorization = `Bearer ${token}`;
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: env.apiBaseUrl + url,
      method,
      data: data as never,
      header: fullHeader,
      timeout: env.requestTimeout,
      success: (res) => {
        // res.data 是后端 JSON 包装体
        const body = res.data as ApiEnvelope<T> | undefined;

        // 1) HTTP 401:尝试 refresh + 重发(单次重试,skipAuth/已重试过 直接走 logout)
        if (res.statusCode === 401) {
          const canRefresh = !skipAuth && !_retried && !!getRefreshToken();
          if (canRefresh) {
            doRefresh()
              .then(() => {
                // 用新 token 重发原请求(标记 _retried 防死循环)
                request<T>({ ...options, _retried: true }).then(resolve, reject);
              })
              .catch(() => {
                // refresh 失败:清登录态,跳登录页
                authLogout();
                redirectToLogin();
                const msg = (body && body.msg) || '登录已过期，请重新登录';
                const err = new BizError(401, msg, body?.traceId);
                if (showErrorToast) uni.showToast({ title: msg, icon: 'none' });
                reject(err);
              });
            return;
          }

          // skipAuth(登录/refresh 自身) 或 已重试过:不再 refresh,直接登出
          authLogout();
          redirectToLogin();
          const msg = (body && body.msg) || '登录已过期，请重新登录';
          const err = new BizError(401, msg, body?.traceId);
          if (showErrorToast) uni.showToast({ title: msg, icon: 'none' });
          reject(err);
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const msg = (body && body.msg) || `请求失败 (${res.statusCode})`;
          const err = new BizError(res.statusCode, msg, body?.traceId);
          if (showErrorToast) uni.showToast({ title: msg, icon: 'none' });
          reject(err);
          return;
        }

        // 2) HTTP 2xx 但业务层失败
        if (!body || typeof body !== 'object') {
          const err = new BizError(-1, '响应格式异常');
          if (showErrorToast) uni.showToast({ title: err.msg, icon: 'none' });
          reject(err);
          return;
        }
        if (body.code !== SUCCESS_CODE) {
          const err = new BizError(body.code, body.msg || '业务异常', body.traceId);
          if (showErrorToast) uni.showToast({ title: err.msg, icon: 'none' });
          reject(err);
          return;
        }

        // 3) 成功
        resolve(body.data);
      },
      fail: (err) => {
        const msg = (err && (err as { errMsg?: string }).errMsg) || '网络异常';
        const bizErr = new BizError(-1, msg);
        if (showErrorToast) uni.showToast({ title: msg, icon: 'none' });
        reject(bizErr);
      },
    });
  });
}

/** 语义化快捷方法（约定都是 POST，但保留扩展位） */
export const http = {
  post: <T = unknown>(url: string, data?: RequestOptions['data'], opts?: Partial<RequestOptions>) =>
    request<T>({ ...opts, url, method: 'POST', data }),
  get: <T = unknown>(url: string, data?: RequestOptions['data'], opts?: Partial<RequestOptions>) =>
    request<T>({ ...opts, url, method: 'GET', data }),
};
