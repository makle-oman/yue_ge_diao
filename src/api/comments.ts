/**
 * 评论（comments）相关接口
 *
 * 对应后端 modules/comments，4 个接口：
 *   POST /comments/list     列表：sort=hot|new + cursor 分页（一级评论分页，二级 reply 整组返回）
 *   POST /comments/create   发评论；带 parentId 即为二级回复（强制两层拍平）
 *   POST /comments/remove   删除（评论作者 OR 鱼获主可删；一级删除连带二级一起删）
 *   POST /comments/like     点赞 / 取消点赞，幂等
 */

import { http } from '@/utils/request';

export type CommentSort = 'hot' | 'new';

export interface CommentItem {
  id: string;
  catchId: string;
  /** 一级评论为 null；二级评论为父评论 id */
  parentId: string | null;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  /** 该评论作者是不是鱼获主（用于"作者标签"） */
  isAuthor: boolean;
  createdAt: string;
  /** 仅一级评论携带，列表里整组展开 */
  replies?: CommentItem[];
}

export interface ListCommentsResp {
  list: CommentItem[];
  nextCursor: string | null;
  total: number;
  allowComments?: boolean;
}

export interface PreviewCommentsResp {
  list: CommentItem[];
  total: number;
}

/** 列出某鱼获评论；不传 limit 默认后端 20 */
export function listComments(payload: {
  catchId: string;
  sort?: CommentSort;
  cursor?: string;
  limit?: number;
}): Promise<ListCommentsResp> {
  return http.post('/comments/list', payload);
}

/** 详情页评论预览：取最新 3 条一级评论 + 总数 */
export function previewLatestComments(catchId: string): Promise<ListCommentsResp> {
  return http.post('/comments/list', { catchId, sort: 'new', limit: 3 });
}

export function createComment(payload: {
  catchId: string;
  content: string;
  /** 二级回复时传父评论 id */
  parentId?: string;
}): Promise<CommentItem> {
  return http.post('/comments/create', payload);
}

export function removeComment(commentId: string): Promise<{
  ok: true;
  removed: number;
  commentCount: number;
}> {
  return http.post('/comments/remove', { commentId });
}

export function likeComment(payload: {
  commentId: string;
  action: 'like' | 'unlike';
}): Promise<{ ok: true; likeCount: number }> {
  return http.post('/comments/like', payload);
}

/** ISO 时间 → 中文相对时间（与详情页风格一致） */
export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  if (diff < 0) return '刚刚';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '刚刚';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}小时前`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day}天前`;
  const d = new Date(t);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
