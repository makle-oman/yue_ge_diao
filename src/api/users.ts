/**
 * 用户相关接口
 *
 * 对应后端 modules/users
 *   - POST /users/me      当前登录用户信息
 *   - POST /users/update  更新个人资料(部分字段),返回更新后的 MeProfile
 *   - POST /users/detail  他人主页
 *   - POST /users/nearby  附近钓友
 *   - POST /users/follow  关注 / 取消关注
 */

import { http } from '@/utils/request';

/** 钓龄段机器码(与后端 FISHING_AGE_BANDS 一一对应) */
export type FishingAgeBand = 'within_1y' | '1_3y' | '3_5y' | '5y_plus';

/** 钓龄段中文标签 ↔ 机器码 的双向映射,UI 直接消费 */
export const FISHING_AGE_BAND_LABEL: Record<FishingAgeBand, string> = {
  within_1y: '1年内',
  '1_3y': '1-3年',
  '3_5y': '3-5年',
  '5y_plus': '5年以上',
};

export const FISHING_AGE_BAND_CODE: Record<string, FishingAgeBand> = {
  '1年内': 'within_1y',
  '1-3年': '1_3y',
  '3-5年': '3_5y',
  '5年以上': '5y_plus',
};

/** 后端 users.service.ts MeProfile 返回字段(id 是 BigInt 字符串化结果) */
export interface MeProfile {
  id: string;
  openid: string;
  nickname: string | null;
  avatar: string | null;
  gender: number;
  city: string | null;
  fishingAgeBand: FishingAgeBand | null;
  playStyles: string[];
  allowNearby: boolean;
  allowShowLoc: boolean;
  lastActiveAt: string | null;
  createdAt: string;
}

/** /users/update 入参(全 optional,只发改动过的字段) */
export interface UpdateMePayload {
  nickname?: string;
  avatar?: string;
  city?: string;
  gender?: number;
  fishingAgeBand?: FishingAgeBand;
  playStyles?: string[];
  allowNearby?: boolean;
  allowShowLoc?: boolean;
}

export interface NearbyUserItem {
  id: string;
  nickname: string | null;
  avatar: string | null;
  city: string | null;
  fishingAgeBand: FishingAgeBand | null;
  playStyles: string[];
  distance: number;
  lastActiveAt: string | null;
  following: boolean;
}

export interface PublicUserProfile extends Omit<NearbyUserItem, 'distance'> {
  distance: number | null;
  followerCount: number;
  followingCount: number;
  stats: {
    catches: number;
    spots: number;
    heaviestG: number | null;
  };
  createdAt: string;
}

export function fetchMe(): Promise<MeProfile> {
  return http.post<MeProfile>('/users/me');
}

export function updateMe(payload: UpdateMePayload): Promise<MeProfile> {
  return http.post<MeProfile>('/users/update', payload);
}

export function fetchUserDetail(userId: string): Promise<PublicUserProfile> {
  return http.post<PublicUserProfile>('/users/detail', { userId });
}

export function fetchNearbyUsers(params: {
  lat: number;
  lng: number;
  radius?: number;
  keyword?: string;
  playStyle?: string;
  limit?: number;
}): Promise<{ list: NearbyUserItem[] }> {
  return http.post('/users/nearby', params);
}

export function followUser(
  userId: string,
  action: 'follow' | 'unfollow',
): Promise<{ ok: boolean; following: boolean; followerCount: number }> {
  return http.post('/users/follow', { userId, action });
}

export function formatFishingAge(code: FishingAgeBand | null): string {
  return code ? FISHING_AGE_BAND_LABEL[code] : '钓龄待填';
}
