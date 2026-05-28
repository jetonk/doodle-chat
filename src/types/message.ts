export interface Message {
  _id: string;
  message: string;
  author: string;
  createdAt: string;
}

export interface SendPayload {
  author: string;
  message: string;
}
