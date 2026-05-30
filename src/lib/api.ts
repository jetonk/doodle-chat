import { API_BASE_URL, API_TOKEN } from './constants';
import type { Message } from '../types/message';

const baseHeaders = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

export interface GetMessagesParams {
  after?: string;
  before?: string;
  limit?: number;
}

export async function getMessages({ after, before, limit = 50 }: GetMessagesParams = {}): Promise<Message[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);
  if (before) params.set('before', before);

  const res = await fetch(`${API_BASE_URL}/api/v1/messages?${params}`, {
    headers: baseHeaders,
  });

  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function postMessage(author: string, message: string): Promise<Message> {
  const res = await fetch(`${API_BASE_URL}/api/v1/messages`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ author, message }),
  });

  if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`);
  return res.json();
}
