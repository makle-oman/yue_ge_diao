/**
 * 鉴权令牌存储
 *
 * 统一封装 JWT token 的本地持久化，跨端通用：
 *   - H5: localStorage (uni.setStorageSync 内部即 localStorage)
 *   - 微信小程序: wx.setStorageSync
 *   - App: 平台原生 KV 存储
 *
 * 之所以单独抽一层而不是各处直接 uni.getStorageSync，是为了：
 *   1. 统一 KEY，避免 magic string 散落
 *   2. 后续接入 refreshToken / 过期时间 / 用户快照只改一处
 *   3. 给 request.ts 提供单一数据源，避免循环 import
 */

const TOKEN_KEY = 'yg_token';
const REFRESH_TOKEN_KEY = 'yg_refresh_token';
const USER_KEY = 'yg_user';

export interface AuthUser {
  id: string;
  openid?: string | null;
  nickname?: string | null;
  avatar?: string | null;
}

export function getToken(): string {
  try {
    return uni.getStorageSync(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token: string): void {
  try {
    uni.setStorageSync(TOKEN_KEY, token);
  } catch {
    // 容量满或被禁用，忽略
  }
}

export function clearToken(): void {
  try {
    uni.removeStorageSync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ─── refresh token ────────────────────────────────────────────────────────
// refresh token 仅在 /auth/refresh 时随 body 上送,平时不进 Authorization 头。
// 单独 KEY 持久化:即便 access 被清(/api 401),refresh 还在,能静默续期。
export function getRefreshToken(): string {
  try {
    return uni.getStorageSync(REFRESH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setRefreshToken(token: string): void {
  try {
    uni.setStorageSync(REFRESH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearRefreshToken(): void {
  try {
    uni.removeStorageSync(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = uni.getStorageSync(USER_KEY);
    if (!raw) return null;
    return typeof raw === 'string' ? (JSON.parse(raw) as AuthUser) : (raw as AuthUser);
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  try {
    uni.setStorageSync(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearUser(): void {
  try {
    uni.removeStorageSync(USER_KEY);
  } catch {
    // ignore
  }
}

/** 退出登录:清 token + refresh + 用户快照 + 通知所有订阅者 */
export function logout(): void {
  clearToken();
  clearRefreshToken();
  clearUser();
  logoutListeners.slice().forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[auth] logout listener threw', e);
    }
  });
}

/** 是否已登录(仅看 token 是否存在,不做合法性校验) */
export function isLoggedIn(): boolean {
  return !!getToken();
}

// ─── logout 事件订阅(给 Pinia store 用,避免 request.ts ↔ stores/auth 循环依赖) ───
//
// 设计:
//   - request.ts 的 401 处理走 `logout()`,只 import utils/auth(底层 storage 模块,无业务依赖)
//   - Pinia auth store 在 setup 时调 `onAuthLogout(...)` 注册一个回调,把内存 state 也清掉
//   - store 自己的 logout action 直接清 ref + 调 clearToken/clearUser,不走本事件(避免回环)
//
type LogoutListener = () => void;
const logoutListeners: LogoutListener[] = [];

export function onAuthLogout(fn: LogoutListener): () => void {
  logoutListeners.push(fn);
  return () => {
    const idx = logoutListeners.indexOf(fn);
    if (idx >= 0) logoutListeners.splice(idx, 1);
  };
}
