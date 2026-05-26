/**
 * 鱼获（catches）相关接口
 *
 * 对应后端 modules/catches，5 个接口：
 *   POST /catches/list      feed 列表：tab=recommend/nearby/follow（nearby 需 lat/lng）
 *   POST /catches/create    发鱼获，photos[1..9] + fishSpecies[1..10] 必填
 *   POST /catches/detail    详情，含 yourLikeStatus / yourCollectStatus
 *   POST /catches/like      点赞 / 取消点赞，幂等
 *   POST /catches/collect   收藏 / 取消收藏，幂等
 *
 * 以及 modules/users 上的 2 个聚合：
 *   POST /users/catches         我的（或他人的）鱼获列表，visibility=all|public|private
 *   POST /users/catches/stats   鱼获档案：total / monthCount / monthAdd / heaviest
 *
 * 后端契约见 yue-ge-diao-server/docs/catches-v1.md。
 */

import { http } from '@/utils/request';

export type FeedTab = 'recommend' | 'nearby' | 'follow';
export type Technique = 'hand' | 'taiwan' | 'lure' | 'sea' | 'other';
export type Visibility = 'all' | 'public' | 'private';

/** feed 列表 item（list 返回的 shape） */
export interface CatchFeedItem {
  id: string;
  cover: string | null;
  photos: string[];
  fishSpecies: string[];
  /** 克。nearby 走 raw SQL 路径时后端会返回 string，前端 toNumber 兜底 */
  weight: number | null;
  /** 厘米。同上 */
  length: number | null;
  content: string | null;
  spotId: string | null;
  spotName: string | null;
  city: string | null;
  /** nearby tab 返回；按距离排序的米数 */
  distance?: number;
  likeCount: number;
  commentCount: number;
  favCount: number;
  liked: boolean;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  createdAt: string;
}

/** detail 返回的完整鱼获 */
export interface CatchDetail {
  id: string;
  photos: string[];
  cover: string | null;
  fishSpecies: string[];
  weight: number | null;
  length: number | null;
  technique: string | null;
  bait: string | null;
  content: string | null;
  /** 私密鱼获（locationVisible=false）返回 null */
  lat: number | null;
  lng: number | null;
  locationVisible: boolean;
  allowComments: boolean;
  weatherSnapshot: Record<string, unknown> | null;
  likeCount: number;
  commentCount: number;
  favCount: number;
  reviewStatus: string;
  createdAt: string;
  user: { id: string; nickname: string | null; avatar: string | null };
  spot: {
    id: string;
    name: string;
    city: string | null;
    lat: number;
    lng: number;
  } | null;
  yourLikeStatus: boolean;
  yourCollectStatus: boolean;
}

export interface UserCatchesStats {
  total: number;
  /** 本月（当月 1 号 0:00 起） */
  monthCount: number;
  /** 本月 - 上月 */
  monthAdd: number;
  heaviest: {
    weightG: number | null;
    fishSpecies: string[];
    createdAt: string;
  } | null;
}

export interface ListResp<T> {
  list: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ─── feed / detail / 互动 ────────────────────────────────────────────

export function listCatches(params: {
  tab: FeedTab;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  cursor?: string | null;
}): Promise<ListResp<CatchFeedItem>> {
  return http.post('/catches/list', params);
}

export function createCatch(payload: {
  photos: string[];
  fishSpecies: string[];
  weight?: number;
  length?: number;
  technique?: Technique;
  bait?: string;
  content?: string;
  spotId?: string;
  lat?: number;
  lng?: number;
  locationVisible?: boolean;
  allowComments?: boolean;
}): Promise<{ id: string; reviewStatus: string; createdAt: string }> {
  return http.post('/catches/create', payload);
}

export function catchDetail(catchId: string): Promise<CatchDetail> {
  return http.post('/catches/detail', { catchId });
}

export function likeCatch(
  catchId: string,
  action: 'like' | 'unlike',
): Promise<{ ok: boolean; likeCount: number }> {
  return http.post('/catches/like', { catchId, action });
}

export function collectCatch(
  catchId: string,
  action: 'collect' | 'uncollect',
): Promise<{ ok: boolean; favCount: number }> {
  return http.post('/catches/collect', { catchId, action });
}

// ─── 我的（聚合） ────────────────────────────────────────────────────

export function userCatches(params: {
  /** 不传 = 自己；传了 = 看别人 */
  userId?: string;
  /** 不传 = all；看别人时 'private' 会 403 */
  visibility?: Visibility;
  limit?: number;
  cursor?: string | null;
}): Promise<ListResp<CatchFeedItem>> {
  return http.post('/users/catches', params);
}

export function userCatchesStats(params: {
  userId?: string;
} = {}): Promise<UserCatchesStats> {
  return http.post('/users/catches/stats', params);
}

// ─── UI 辅助 ─────────────────────────────────────────────────────────

export const TECHNIQUE_LABEL: Record<Technique, string> = {
  hand: '手竿',
  taiwan: '台钓',
  lure: '路亚',
  sea: '海钓',
  other: '其他',
};

/** 数据库走 raw SQL 时可能返回 string，统一转 number；null/undefined 透出 null */
export function toNum(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 克 → "1.2斤" / "800g" 展示串 */
export function formatWeight(g: number | string | null | undefined): string {
  const n = toNum(g);
  if (n == null) return '—';
  if (n >= 500) return `${(n / 500).toFixed(1)}斤`;
  return `${Math.round(n)}g`;
}

/** 厘米 → "28cm" 展示串 */
export function formatLength(cm: number | string | null | undefined): string {
  const n = toNum(cm);
  if (n == null) return '—';
  return `${Math.round(n)}cm`;
}

/**
 * 解析用户输入的重量串 → 克（int）
 *
 * 支持「1.2斤 / 600g / 600 / 1.2kg」等常见写法。无法解析时返回 undefined。
 */
export function parseWeightInputToG(s: string): number | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  const num = parseFloat(trimmed);
  if (!Number.isFinite(num)) return undefined;
  if (/斤/.test(trimmed)) return Math.round(num * 500);
  if (/kg/i.test(trimmed)) return Math.round(num * 1000);
  if (/g/i.test(trimmed)) return Math.round(num);
  // 纯数字按斤算（前端最常用单位）
  return Math.round(num * 500);
}

/** 解析用户输入的长度串 → 厘米（int） */
export function parseLengthInputToCm(s: string): number | undefined {
  if (!s) return undefined;
  const num = parseFloat(s.trim());
  if (!Number.isFinite(num)) return undefined;
  return Math.round(num);
}

/** ISO 时间串 → "今天 6:42" / "5月14日" 简单本地化 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (same(d, now)) return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (same(d, yesterday))
    return `昨天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
