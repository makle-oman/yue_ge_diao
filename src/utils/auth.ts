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

/** 退出登录：清 token + 用户快照 */
export function logout(): void {
  clearToken();
  clearUser();
}

/** 是否已登录（仅看 token 是否存在，不做合法性校验） */
export function isLoggedIn(): boolean {
  return !!getToken();
}
