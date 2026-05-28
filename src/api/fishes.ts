/**
 * Fish library APIs.
 *
 * Backend:
 *   POST /fishes/list
 *   POST /fishes/library
 *   POST /fishes/library-progress
 */

import { http } from '@/utils/request';

export type FishCategory = 'fresh' | 'sea';

export interface FishLibraryItem {
  name: string;
  category: FishCategory;
  common: boolean;
  unlocked: boolean;
  firstCatchAt: string | null;
  maxWeightG: number | null;
}

export interface FishLibraryStats {
  fresh: { done: number; total: number };
  sea: { done: number; total: number };
}

export interface FishLibraryResp {
  list: FishLibraryItem[];
  stats: FishLibraryStats;
}

export function fishLibrary(params: { category?: FishCategory } = {}): Promise<FishLibraryResp> {
  return http.post('/fishes/library', params);
}

export function fishLibraryProgress(): Promise<FishLibraryStats> {
  return http.post('/fishes/library-progress');
}

export function fishCatalog(params: { category?: FishCategory } = {}): Promise<{ list: Omit<FishLibraryItem, 'unlocked' | 'firstCatchAt' | 'maxWeightG'>[] }> {
  return http.post('/fishes/list', params, { skipAuth: true });
}
