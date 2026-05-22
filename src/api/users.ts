/**
 * 用户相关接口
 *
 * 对应后端 modules/users
 *   - POST /users/me  当前登录用户信息
 */

import { http } from '@/utils/request';

/** 后端 users.service.ts findMe 返回字段（id 为 BigInt 字符串化结果） */
export interface MeProfile {
  id: string;
  openid: string | null;
  nickname: string | null;
  avatar: string | null;
  gender: number | null;
  city: string | null;
  fishingAgeBand: string | null;
  playStyles: string | null;
  allowNearby: boolean;
  allowShowLoc: boolean;
  lastActiveAt: string | null;
  createdAt: string;
}

export function fetchMe(): Promise<MeProfile> {
  return http.post<MeProfile>('/users/me');
}
