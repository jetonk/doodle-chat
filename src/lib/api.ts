import { API_BASE_URL, API_TOKEN } from './constants';
import type { Message } from '../types/message';

const baseHeaders = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

export async function getMessages(after?: string, limit = 50): Promise<Message[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);

  const res = await fetch(`${API_BASE_URL}/api/v1/messages?${params}`, {
    headers: baseHeaders,
  });

  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function postMessage(author: string, message: string): Promise<Message> {
  console.log('author', author);
  console.log('message', message);
  const res = await fetch(`${API_BASE_URL}/api/v1/messages`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ author, message }),
  });

  if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`);
  return res.json();
}
