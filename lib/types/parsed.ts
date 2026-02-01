export interface Subscription {
  id: string;
  emailId: string;
  vendor: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRenewal?: Date;
  status: 'active' | 'cancelled' | 'trial';
  confidence: number;
  detectedAt: Date;
}

export interface Transaction {
  id: string;
  emailId: string;
  vendor: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  confidence: number;
  detectedAt: Date;
}

export interface Income {
  id: string;
  emailId: string;
  source: string;
  amount: number;
  currency: string;
  date: Date;
  type: 'salary' | 'freelance' | 'refund' | 'investment' | 'other';
  confidence: number;
  detectedAt: Date;
}

export interface Newsletter {
  id: string;
  emailId: string;
  sender: string;
  senderName: string;
  subject: string;
  receivedAt: Date;
  summary?: string;
  hasUnsubscribe: boolean;
  detectedAt: Date;
}
