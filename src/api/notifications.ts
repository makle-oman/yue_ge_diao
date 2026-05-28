/**
 * 通知（notifications）相关接口
 *
 *   POST /notifications/list           列表（支持 group / type / unreadOnly / cursor）
 *   POST /notifications/unread-count   未读数总览 + 各 group 分组
 *   POST /notifications/read           标记已读：ids[] 或 all=true（可叠加 group 过滤）
 */

import { http } from '@/utils/request';

export type NotificationType =
  | 'catch_like'
  | 'catch_collect'
  | 'catch_comment'
  | 'comment_reply'
  | 'comment_like'
  | 'team_apply'
  | 'team_review_approved'
  | 'team_review_rejected'
  | 'team_member_left';

export type NotificationGroup = 'comment' | 'like' | 'team' | 'system';

export interface NotificationActor {
  id: string;
  name: string | null;
  avatar: string | null;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  group: NotificationGroup;
  refType: string | null;
  refId: string | null;
  payload: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface PagedNotifications {
  list: NotificationItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UnreadCount {
  total: number;
  byGroup: Record<NotificationGroup, number>;
}

export function listNotifications(payload: {
  group?: NotificationGroup;
  type?: NotificationType;
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
} = {}): Promise<PagedNotifications> {
  return http.post('/notifications/list', payload);
}

export function getUnreadCount(): Promise<UnreadCount> {
  return http.post('/notifications/unread-count', {});
}

export function markNotificationsRead(
  payload: { ids?: string[]; all?: boolean; group?: NotificationGroup },
): Promise<{ updated: number }> {
  return http.post('/notifications/read', payload);
}

// ──────────────────────────────────────────────────────────────
// 文案 / 跳转辅助
// ──────────────────────────────────────────────────────────────

export const NOTIFICATION_GROUP_LABEL: Record<NotificationGroup, string> = {
  comment: '评论',
  like: '赞和收藏',
  team: '组队消息',
  system: '系统通知',
};

const ACTION_TEXT: Record<NotificationType, string> = {
  catch_like: '赞了你的鱼获',
  catch_collect: '收藏了你的鱼获',
  catch_comment: '评论了你的鱼获',
  comment_reply: '回复了你的评论',
  comment_like: '赞了你的评论',
  team_apply: '申请加入你发起的组队',
  team_review_approved: '同意了你的组队申请',
  team_review_rejected: '拒绝了你的组队申请',
  team_member_left: '退出了你的组队',
};

export function notificationActionText(n: NotificationItem): string {
  return ACTION_TEXT[n.type] ?? '给你发来了一条消息';
}

export function notificationExcerpt(n: NotificationItem): string {
  const p = n.payload ?? {};
  if (typeof p.excerpt === 'string') return p.excerpt;
  if (typeof p.message === 'string') return p.message;
  if (typeof p.spotName === 'string') return p.spotName;
  return '';
}

export function notificationCover(n: NotificationItem): string | null {
  const p = n.payload ?? {};
  if (typeof p.cover === 'string' && p.cover.length > 0) return p.cover;
  return null;
}

/** 给消息行点击用：返回应该跳的 pages 路径，没有匹配返回 null */
export function notificationTargetPath(n: NotificationItem): string | null {
  const p = n.payload ?? {};
  if (n.refType === 'catch' && n.refId) {
    return `/subpackages/catch/detail/index?id=${n.refId}`;
  }
  if (n.refType === 'comment' && typeof p.catchId === 'string') {
    return `/subpackages/catch/detail/index?id=${p.catchId}`;
  }
  if (n.refType === 'team' && n.refId) {
    return `/subpackages/team/detail/index?id=${n.refId}`;
  }
  return null;
}
