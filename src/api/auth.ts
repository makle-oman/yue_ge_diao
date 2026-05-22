/**
 * 鉴权相关接口
 *
 * 对应后端 modules/auth
 *   - POST /auth/dev-login  开发环境兜底登录（生产禁用）
 *   - 后续：/auth/wx-login、/auth/refresh、/auth/logout
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
  user: AuthUser;
}

export function devLogin(params: DevLoginParams): Promise<LoginResult> {
  return http.post<LoginResult>('/auth/dev-login', params, { skipAuth: true });
}
