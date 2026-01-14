export enum UserPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

export interface User {
  id: string;
  whatsappHash: string;
  name?: string;
  email?: string;
  plan: UserPlan;
  tripsThisMonth: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  referralCode?: string;
  hasConsented: boolean;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  whatsappHash: string;
  name?: string;
  email?: string;
  plan?: UserPlan;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  plan?: UserPlan;
  hasConsented?: boolean;
  preferences?: Record<string, any>;
}

export interface UserStats {
  plan: UserPlan;
  tripsThisMonth: number;
  totalTrips: number;
  memberSince: Date;
  referralCode?: string;
}

