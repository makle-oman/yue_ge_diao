import { http } from '@/utils/request';

export type FavoriteListType = 'spot' | 'user';
export type FavoriteKind = 'spot' | 'catch' | 'user';

export interface FavoriteItem {
  id: string;
  kind: FavoriteKind;
  tagText: string;
  name: string;
  meta: string;
  foot: string;
  createdAt: string;
}

export interface FavoriteCounts {
  spot: number;
  user: number;
}

export interface FavoriteListResp {
  list: FavoriteItem[];
  counts: FavoriteCounts;
  nextCursor: string | null;
  hasMore: boolean;
}

export function listFavorites(params: {
  type?: FavoriteListType;
  limit?: number;
  cursor?: string | null;
}): Promise<FavoriteListResp> {
  return http.post('/favorites/list', params);
}

export function removeFavorite(payload: {
  kind: FavoriteKind;
  id: string;
}): Promise<{ ok: boolean }> {
  return http.post('/favorites/remove', payload);
}
