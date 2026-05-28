import { http } from '@/utils/request';

export interface MessageItem {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export interface PagedMessages {
  list: MessageItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MessageThread {
  peer: {
    id: string;
    nickname: string | null;
    avatar: string | null;
  };
  lastMessage: MessageItem;
  unreadCount: number;
}

export function fetchMessageThreads(payload: {
  limit?: number;
} = {}): Promise<{ list: MessageThread[] }> {
  return http.post('/messages/threads', payload, { dedupe: true });
}

export function fetchMessageHistory(payload: {
  peerId: string;
  cursor?: string;
  limit?: number;
}): Promise<PagedMessages> {
  return http.post('/messages/history', payload, { dedupe: true });
}

export function sendMessage(payload: {
  toUserId: string;
  content: string;
}): Promise<MessageItem> {
  return http.post('/messages/send', payload);
}
