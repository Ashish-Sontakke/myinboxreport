'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { EmailCategory, StoredEmail } from '@/lib/types/email';
import type {
  Subscription,
  Transaction,
  Income,
  Newsletter,
} from '@/lib/types/parsed';

export function useEmails(
  filters?: { parsed?: boolean; category?: EmailCategory },
): StoredEmail[] | undefined {
  return useLiveQuery(() => {
    let query = db.emails.toCollection();
    if (filters?.parsed !== undefined) {
      query = db.emails.where('parsed').equals(filters.parsed ? 1 : 0);
    }
    if (filters?.category) {
      query = db.emails.where('category').equals(filters.category);
    }
    return query.reverse().sortBy('date');
  }, [filters?.parsed, filters?.category]);
}

export function useSubscriptions(
  status?: 'active' | 'cancelled' | 'trial',
): Subscription[] | undefined {
  return useLiveQuery(() => {
    if (status) {
      return db.subscriptions.where('status').equals(status).toArray();
    }
    return db.subscriptions.toArray();
  }, [status]);
}

export function useTransactions(
  dateRange?: { from: Date; to: Date },
): Transaction[] | undefined {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.transactions
        .where('date')
        .between(dateRange.from, dateRange.to, true, true)
        .reverse()
        .sortBy('date');
    }
    return db.transactions.orderBy('date').reverse().toArray();
  }, [dateRange?.from, dateRange?.to]);
}

export function useIncome(
  dateRange?: { from: Date; to: Date },
): Income[] | undefined {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.income
        .where('date')
        .between(dateRange.from, dateRange.to, true, true)
        .reverse()
        .sortBy('date');
    }
    return db.income.orderBy('date').reverse().toArray();
  }, [dateRange?.from, dateRange?.to]);
}

export function useNewsletters(): Newsletter[] | undefined {
  return useLiveQuery(() => {
    return db.newsletters.orderBy('receivedAt').reverse().toArray();
  });
}

export function useStats():
  | { totalEmails: number; parsed: number; unparsed: number }
  | undefined {
  return useLiveQuery(async () => {
    const totalEmails = await db.emails.count();
    const parsed = await db.emails.where('parsed').equals(1).count();
    return {
      totalEmails,
      parsed,
      unparsed: totalEmails - parsed,
    };
  });
}
