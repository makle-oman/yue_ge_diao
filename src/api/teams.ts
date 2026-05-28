import { http } from '@/utils/request';

export type CostMode = 'aa' | 'host' | 'self';
export type TeamFilter = 'nearby' | 'weekend' | 'carpool' | 'all';
export type TeamStatus = 'recruiting' | 'full' | 'started' | 'ended' | 'cancelled' | string;
export type TeamMemberStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | string;

export interface ListResp<T> {
  list: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface TeamOwner {
  id: string;
  name: string | null;
  avatar: string | null;
}

export interface TeamListItem {
  id: string;
  title: string;
  spotId: string;
  spotName: string;
  spotCity: string | null;
  startTime: string;
  endTime: string;
  targetFish: string[];
  maxPeople: number;
  joinedCount: number;
  costMode: CostMode;
  needCarpool: boolean;
  status: TeamStatus;
  note: string | null;
  distance?: number;
  owner: TeamOwner;
  yourMemberStatus: TeamMemberStatus | null;
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  name: string | null;
  avatar: string | null;
  status: TeamMemberStatus;
  message: string | null;
  appliedAt: string;
  reviewedAt: string | null;
}

export interface TeamDetail extends TeamListItem {
  members: TeamMember[];
}

export function listTeams(params: {
  filter?: TeamFilter;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  cursor?: string | null;
}): Promise<ListResp<TeamListItem>> {
  return http.post('/teams/list', params);
}

export function teamDetail(teamId: string): Promise<TeamDetail> {
  return http.post('/teams/detail', { teamId });
}

export function createTeam(payload: {
  spotId: string;
  startTime: string;
  endTime: string;
  targetFish?: string[];
  maxPeople: number;
  costMode: CostMode;
  needCarpool?: boolean;
  note?: string;
}): Promise<{ id: string }> {
  return http.post('/teams/create', payload);
}

export function applyTeam(
  teamId: string,
  message?: string,
): Promise<{ ok: boolean; status: TeamMemberStatus }> {
  return http.post('/teams/apply', { teamId, message });
}

export function cancelTeamApply(teamId: string): Promise<{ ok: boolean; status: TeamMemberStatus }> {
  return http.post('/teams/cancel-apply', { teamId });
}

export function userTeams(params: {
  userId?: string;
  role?: 'owner' | 'joined' | 'all';
  limit?: number;
  cursor?: string | null;
}): Promise<ListResp<TeamListItem>> {
  return http.post('/users/teams', params);
}

export const COST_MODE_LABEL: Record<CostMode, string> = {
  aa: 'AA',
  host: '发起人请客',
  self: '各自承担',
};

export function formatTeamDistance(m: number | undefined): string {
  if (m == null || !isFinite(m)) return '';
  if (m < 10) return '<10m';
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}
