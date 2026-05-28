/**
 * 组队（teams）相关接口
 *
 *   POST /teams/list          列表：filter=nearby|weekend|carpool|all（nearby 需 lat/lng）
 *   POST /teams/detail        详情：含队长、钓点、成员列表、我的报名状态
 *   POST /teams/create        发起组队（自动以 approved 入队）
 *   POST /teams/apply         申请加入（pending）
 *   POST /teams/cancel-apply  撤销报名 / 退队
 *   POST /teams/review        队长 approve/reject 申请
 *   POST /users/teams         我的（或他人的）组队（owner/joined/all）
 */

import { http } from '@/utils/request';

export type TeamFilter = 'nearby' | 'weekend' | 'carpool' | 'all';
export type CostMode = 'aa' | 'host' | 'self';
export type TeamStatus =
  | 'recruiting'
  | 'full'
  | 'started'
  | 'ended'
  | 'cancelled';
export type MemberStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

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
  owner: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  yourMemberStatus: MemberStatus | null;
  createdAt: string;
}

export interface TeamMemberItem {
  userId: string;
  name: string | null;
  avatar: string | null;
  status: MemberStatus;
  message: string | null;
  appliedAt: string;
  reviewedAt: string | null;
}

export interface TeamDetail extends TeamListItem {
  members: TeamMemberItem[];
}

export interface PagedTeams {
  list: TeamListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function listTeams(payload: {
  filter?: TeamFilter;
  lat?: number;
  lng?: number;
  radius?: number;
  cursor?: string;
  limit?: number;
}): Promise<PagedTeams> {
  return http.post('/teams/list', payload);
}

export function teamDetail(teamId: string): Promise<TeamDetail> {
  return http.post('/teams/detail', { teamId });
}

export function createTeam(payload: {
  spotId: string;
  startTime: string; // ISO
  endTime: string; // ISO
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
): Promise<{ ok: true; status: 'pending' }> {
  return http.post('/teams/apply', { teamId, message });
}

export function cancelApplyTeam(
  teamId: string,
): Promise<{ ok: true; status: MemberStatus }> {
  return http.post('/teams/cancel-apply', { teamId });
}

export function reviewMember(payload: {
  teamId: string;
  userId: string;
  action: 'approve' | 'reject';
}): Promise<{ ok: true; status: 'approved' | 'rejected' }> {
  return http.post('/teams/review', payload);
}

export function listUserTeams(payload: {
  userId?: string;
  role?: 'owner' | 'joined' | 'all';
  cursor?: string;
  limit?: number;
}): Promise<PagedTeams> {
  return http.post('/users/teams', payload);
}

// ──────────────────────────────────────────────────────────────
// 格式化辅助
// ──────────────────────────────────────────────────────────────

export const COST_MODE_LABEL: Record<CostMode, string> = {
  aa: 'AA',
  host: '发起人请客',
  self: '各自承担',
};

export const TEAM_STATUS_LABEL: Record<TeamStatus, string> = {
  recruiting: '招募中',
  full: '已满员',
  started: '已开始',
  ended: '已结束',
  cancelled: '已取消',
};

export function formatTeamWhen(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime())) return '';
  const mm = String(s.getMonth() + 1).padStart(2, '0');
  const dd = String(s.getDate()).padStart(2, '0');
  const sHm =
    String(s.getHours()).padStart(2, '0') +
    ':' +
    String(s.getMinutes()).padStart(2, '0');
  const eHm = Number.isNaN(e.getTime())
    ? ''
    : String(e.getHours()).padStart(2, '0') +
      ':' +
      String(e.getMinutes()).padStart(2, '0');
  return `${mm}月${dd}日 ${sHm}${eHm ? '-' + eHm : ''}`;
}

export function countdownLabel(startIso: string): string {
  const s = new Date(startIso).getTime();
  if (Number.isNaN(s)) return '';
  const diff = s - Date.now();
  if (diff <= 0) return '已开始';
  const totalH = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalH / 24);
  const hours = totalH % 24;
  if (days > 0) return `${days}天${hours}小时`;
  const mins = Math.floor(diff / (1000 * 60));
  if (totalH > 0) return `${totalH}小时${mins % 60}分`;
  return `${mins}分钟`;
}
