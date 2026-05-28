/**
 * 钓点（spots）相关接口
 *
 * 对应后端 modules/spots，7 个接口：
 *   POST /spots/list      首页/列表，按 lat/lng+radius 取邻域、按距离排序、cursor 分页
 *   POST /spots/nearby    扁平 list，不分页（用于"发鱼获"前选钓点）
 *   POST /spots/search    关键词+多筛选，按 评分>热度>新鲜 排序、cursor 分页
 *   POST /spots/detail    详情 + 7/30 天鱼获数 + yourWantStatus（需登录）
 *   POST /spots/mine-detail 我的钓点编辑详情（需登录）
 *   POST /spots/create    上报新钓点（需登录，accuracy<50m 防作弊）
 *   POST /spots/update    更新自己上报的钓点（需登录）
 *   POST /spots/want      标记/取消想去（需登录，幂等）
 *   POST /spots/history   历史鱼获 + 7 天趋势
 *
 * 后端契约见 yue-ge-diao-server/docs/spots-v1.md。
 */

import { http } from '@/utils/request';

export type SpotType = 'wild' | 'black' | 'paid' | 'sea';
export type WaterType = 'river' | 'lake' | 'reservoir' | 'pond' | 'sea';

/** 列表/搜索 item（list/nearby/search 都返回这个 shape） */
export interface SpotListItem {
  id: string;
  name: string;
  type: SpotType;
  waterType: WaterType | null;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  /** 米，list/nearby 返回；search 不返回 */
  distance?: number;
  avgRating: number;
  ratingCount: number;
  wantCount: number;
  photos: string[];
  fishSpecies: string[];
  createdAt: string;
}

/** detail 返回的完整钓点 */
export interface SpotDetail {
  id: string;
  name: string;
  type: SpotType;
  waterType: WaterType | null;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  description: string | null;
  photos: string[];
  fishSpecies: string[];
  facilities: Record<string, boolean | string | number>;
  avgRating: number;
  ratingCount: number;
  wantCount: number;
  creatorId: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  createdAt: string;
  updatedAt: string;
  catchCount7Days: number;
  catchCount30Days: number;
  lastCatchTime: string | null;
  yourWantStatus: boolean;
}

export interface EditableSpotDetail {
  id: string;
  name: string;
  type: SpotType;
  waterType: WaterType | null;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  description: string | null;
  photos: string[];
  fishSpecies: string[];
  facilities: Record<string, boolean | string | number>;
  status: string;
  updatedAt: string;
}

export interface CatchHistoryItem {
  id: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  photos: string[];
  fishSpecies: string[];
  weight: number | null;
  length: number | null;
  content: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface SpotHistoryResp {
  catches: CatchHistoryItem[];
  weekTrend: { date: string; count: number }[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ListResp<T> {
  list: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ─── 接口封装 ───────────────────────────────────────────────────────

export function listSpots(params: {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  cursor?: string | null;
  city?: string;
  type?: SpotType;
}): Promise<ListResp<SpotListItem>> {
  return http.post('/spots/list', params);
}

export function nearbySpots(params: {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  type?: SpotType;
  waterType?: WaterType;
}): Promise<{ list: SpotListItem[] }> {
  return http.post('/spots/nearby', params);
}

export function searchSpots(params: {
  keyword?: string;
  type?: SpotType;
  waterType?: WaterType;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  hasParking?: boolean;
  hasToilet?: boolean;
  limit?: number;
  cursor?: string | null;
}): Promise<ListResp<SpotListItem>> {
  return http.post('/spots/search', params);
}

export function spotDetail(spotId: string): Promise<SpotDetail> {
  return http.post('/spots/detail', { spotId });
}

export function createSpot(payload: {
  name: string;
  type: SpotType;
  waterType?: WaterType;
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  city?: string;
  description?: string;
  fishSpecies?: string[];
  facilities?: Record<string, boolean>;
  photos?: string[];
}): Promise<{ id: string; status: string; createdAt: string }> {
  return http.post('/spots/create', payload);
}

export function editableSpotDetail(spotId: string): Promise<EditableSpotDetail> {
  return http.post('/spots/mine-detail', { spotId });
}

export function updateSpot(payload: {
  spotId: string;
  name?: string;
  type?: SpotType;
  waterType?: WaterType;
  lat?: number;
  lng?: number;
  accuracy?: number;
  address?: string;
  city?: string;
  description?: string;
  fishSpecies?: string[];
  facilities?: Record<string, boolean>;
  photos?: string[];
}): Promise<{ id: string; status: string; updatedAt: string }> {
  return http.post('/spots/update', payload);
}

export function wantSpot(
  spotId: string,
  action: 'want' | 'unwant',
): Promise<{ ok: boolean; wantCount: number }> {
  return http.post('/spots/want', { spotId, action });
}

export function spotHistory(
  spotId: string,
  opts: { days?: number; limit?: number; cursor?: string | null } = {},
): Promise<SpotHistoryResp> {
  return http.post('/spots/history', { spotId, ...opts });
}

// ─── /users/spots 聚合 ──────────────────────────────────────────────

export type UserSpotTab = 'all' | 'published' | 'review';

/**
 * 我的（或他人的）钓点列表 item
 *
 * 与 SpotListItem 的差异:
 *   - 不含 distance(没有 lat/lng 上下文)
 *   - 多 status(自看含 'pending' | 'rejected'),便于"审核中" tab 角标
 */
export interface UserSpotItem {
  id: string;
  name: string;
  type: SpotType;
  waterType: WaterType | null;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  status: 'pending' | 'approved' | 'rejected' | string;
  photos: string[];
  fishSpecies: string[];
  avgRating: number;
  ratingCount: number;
  wantCount: number;
  createdAt: string;
}

export interface UserSpotsStats {
  total: number;
  reviewing: number;
  monthAdd: number;
  hottest: {
    id: string;
    name: string;
    wantCount: number;
    ratingCount: number;
  } | null;
}

export function userSpots(params: {
  userId?: string;
  tab?: UserSpotTab;
  keyword?: string;
  limit?: number;
  cursor?: string | null;
}): Promise<ListResp<UserSpotItem>> {
  return http.post('/users/spots', params);
}

export function userSpotsStats(params: {
  userId?: string;
} = {}): Promise<UserSpotsStats> {
  return http.post('/users/spots/stats', params);
}

// ─── UI 辅助 ─────────────────────────────────────────────────────────

export const SPOT_TYPE_LABEL: Record<SpotType, string> = {
  wild: '野钓',
  black: '黑坑',
  paid: '收费',
  sea: '海钓',
};

export const WATER_TYPE_LABEL: Record<WaterType, string> = {
  river: '江河',
  lake: '湖泊',
  reservoir: '水库',
  pond: '池塘',
  sea: '海域',
};

/** 米 → 「1.2km」/「230m」/「<10m」展示串 */
export function formatDistance(m: number | undefined): string {
  if (m == null || !isFinite(m)) return '';
  if (m < 10) return '<10m';
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}
