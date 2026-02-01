import Dexie, { type Table } from 'dexie';
import type { StoredEmail } from '@/lib/types/email';
import type {
  Subscription,
  Transaction,
  Income,
  Newsletter,
} from '@/lib/types/parsed';

export class InboxDB extends Dexie {
  emails!: Table<StoredEmail, string>;
  subscriptions!: Table<Subscription, string>;
  transactions!: Table<Transaction, string>;
  income!: Table<Income, string>;
  newsletters!: Table<Newsletter, string>;

  constructor() {
    super('myinboxreport');
    this.version(1).stores({
      emails: 'id, threadId, from, date, *labels, parsed, category',
      subscriptions: 'id, emailId, vendor, status, frequency',
      transactions: 'id, emailId, vendor, category, date',
      income: 'id, emailId, source, date, type',
      newsletters: 'id, emailId, sender, receivedAt',
    });
  }
}

export const db = new InboxDB();
