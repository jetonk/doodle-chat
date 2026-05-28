export interface Message {
  _id: string;
  message: string;
  author: string;
  createdAt: string;
  failed?: boolean;
}

export interface SendPayload {
  author: string;
  message: string;
  retryId?: string;
}
