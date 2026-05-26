/**
 * 鉴权相关接口
 *
 * 对应后端 modules/auth
 *   - POST /auth/dev-login  开发环境兜底登录（生产禁用）
 *   - POST /auth/refresh    refresh token 换新一对 (access, refresh)
 *   - 后续：/auth/wx-login、/auth/logout
 */

import { http } from '@/utils/request';
import type { AuthUser } from '@/utils/auth';

export interface DevLoginParams {
  /** 任意字符串，作为 openid 占位；后端会以此 upsert 用户 */
  openid: string;
  /** 可选昵称 */
  nickname?: string;
}

export interface LoginResult {
  token: string;
  /** refresh token (30d);跟 token 一起返回,前端单独持久化 */
  refreshToken: string;
  user: AuthUser;
}

export function devLogin(params: DevLoginParams): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/dev-login', params, { skipAuth: true });
}

export interface RefreshResult {
  token: string;
  refreshToken: string;
}

/**
 * 用 refresh token 换一对新的 (access, refresh)。
 *
 * 关键约定:
 *   - skipAuth: 不带 Authorization 头(refresh 自身放 body)
 *   - showErrorToast: false,失败由调用方决定要不要弹 Toast(403/401 通常是静默 → logout)
 *   - 不走 401 自动 retry 队列(避免死循环),由 request.ts 内部直接绕开
 */
export function refreshTokens(refreshToken: string): Promise<RefreshResult> {
  return http.post<RefreshResult>(
    '/auth/refresh',
    { refreshToken },
    { skipAuth: true, showErrorToast: false },
  );
}
