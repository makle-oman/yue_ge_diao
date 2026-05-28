import { http } from '@/utils/request';

export type CommentSort = 'hot' | 'new';

export interface CommentItem {
  id: string;
  catchId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  isAuthor: boolean;
  createdAt: string;
  replies?: CommentItem[];
}

export interface CommentListResp {
  list: CommentItem[];
  nextCursor: string | null;
  total: number;
  allowComments?: boolean;
}

export function listComments(params: {
  catchId: string;
  sort?: CommentSort;
  limit?: number;
  cursor?: string | null;
}): Promise<CommentListResp> {
  return http.post('/comments/list', params);
}

export function createComment(payload: {
  catchId: string;
  content: string;
  parentId?: string;
}): Promise<CommentItem> {
  return http.post('/comments/create', payload);
}

export function likeComment(
  commentId: string,
  action: 'like' | 'unlike',
): Promise<{ ok: boolean; likeCount: number }> {
  return http.post('/comments/like', { commentId, action });
}

export function removeComment(commentId: string): Promise<{
  ok: boolean;
  removed: number;
  commentCount: number;
}> {
  return http.post('/comments/remove', { commentId });
}
