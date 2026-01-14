export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WhatsappWebhook {
  From: string;
  Body: string;
  MessageSid?: string;
  AccountSid?: string;
  NumMedia?: string;
  MediaUrl0?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name?: string;
    plan: string;
  };
}

export interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}

