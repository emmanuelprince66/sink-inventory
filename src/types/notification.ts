// types/notification.ts
export interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read?: boolean;
}

export interface SocketConfig {
  url: string;
  path: string;
  token: string;
}
