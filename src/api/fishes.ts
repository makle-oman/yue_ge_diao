import { http } from '@/utils/request';

export type FishCategory = 'fresh' | 'sea';

export interface FishItem {
  name: string;
  category: FishCategory;
  common: boolean;
  unlocked: boolean;
  firstCatchAt: string | null;
  maxWeightG: number | null;
}

export interface FishStats {
  fresh: { done: number; total: number };
  sea: { done: number; total: number };
}

export function fetchFishLibrary(params: {
  category?: FishCategory;
} = {}): Promise<{ list: FishItem[]; stats: FishStats }> {
  return http.post('/fishes/library', params);
}

export function fetchFishProgress(): Promise<FishStats> {
  return http.post('/fishes/library-progress', {});
}
