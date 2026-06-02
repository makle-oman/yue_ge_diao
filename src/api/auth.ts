/**
 * 鉴权相关接口
 *
 * 对应后端 modules/auth
 *   - POST /auth/password-register 手机号 + 密码注册
 *   - POST /auth/password-login    手机号 + 密码登录
 *   - POST /auth/wx-login   微信小程序真实登录
 *   - POST /auth/refresh    refresh token 换新一对 (access, refresh)
 *   - 后续：/auth/logout
 */

import { http } from '@/utils/request';
import type { AuthUser } from '@/utils/auth';

export interface LoginResult {
  token: string;
  /** refresh token (30d);跟 token 一起返回,前端单独持久化 */
  refreshToken: string;
  user: AuthUser;
}

export interface PasswordAuthParams {
  phone: string;
  password: string;
}

export interface PasswordRegisterParams extends PasswordAuthParams {
  nickname?: string;
}

export function passwordRegister(params: PasswordRegisterParams): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/password-register', params, { skipAuth: true });
}

export function passwordLogin(params: PasswordAuthParams): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/password-login', params, { skipAuth: true });
}

export interface WxLoginParams {
  /** uni.login({ provider: 'weixin' }) 返回的临时 code */
  code: string;
  /** 可选昵称 */
  nickname?: string;
  /** 可选头像 URL */
  avatar?: string;
}

export function wxLogin(params: WxLoginParams): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/wx-login', params, { skipAuth: true });
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
