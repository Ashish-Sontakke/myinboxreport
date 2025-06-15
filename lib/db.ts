import Dexie, { type EntityTable } from "dexie";

/**
 * Stores metadata and processing status of emails
 */
export interface ParsedEmail {
  id: string; // same as email id
  from: string;
  to: string;

  isParsed: boolean;
  processingStatus: "pending" | "completed" | "failed" | "skipped";
  errorMessage?: string;
  requiresUserAction: boolean;

  relatedTransactionIds: string[];
  relatedSubscriptions: string[];
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
  emailReceivedAt: Date;
}

/**
 * Represents financial transaction extracted from emails
 * Stored with metadata to deduplicate transactions from multiple emails
 */
export interface Transaction {
  id: string; // uuid randomly generated
  sourceEmails: string[]; // emails that contributed to this transaction eg: [bank-email, merchant-email, etc]

  transactionIds: string[]; // ids of transactions that are part of this transaction eg: [bank-tx-id, merchent-tx-id, order-id, etc]

  paymentMethod: "card" | "bank" | "cash" | "other";
  tags: string[];

  amount: number;
  currency: string;
  transactionDate: Date;
  transactionType:
    | "debit"
    | "credit"
    | "refund"
    | "self-transfer"
    | "investment"
    | "loan"
    | "other";
  category: string; // eg: "food", "transport", "shopping", "bills", "other"

  isManuallyVerified: boolean;
  isProbableDuplicate: boolean;
}

export interface Subscription {
  id: string; // uuid randomly generated

  name: string;
  sourceEmails: string[];
  tags: string[];

  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "weekly" | "daily";
  nextBillingDate: Date;
  isActive: boolean;

  category: string; // eg: "food", "transport", "shopping", "bills", "other"
  isManuallyVerified: boolean;
  isProbableDuplicate: boolean;
  linkToManageSubscription?: string; //

  createdAt: Date;
  updatedAt: Date;
}

export interface GenericAnalyticsItem {
  id?: number; // Auto-incrementing primary key
  type: string; // e.g., 'newsletter_summary', 'monthly_spend_overview', 'investment_update', 'flight_details'
  key: string; // A unique key for this item type, e.g., 'newsletter_brand_x_vol_5', 'spend_2024_05_food'
  data: any; // Flexible object to store any kind of analytical data
  sourceEmailIds?: string[]; // Optional: link back to source emails
  relevantDate?: Date; // Date relevant to the analytic item (e.g., newsletter date, summary period end)
  tags?: string[]; // For categorization and searching

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stores synchronization metadata for Gmail API
 * Used to track sync state and enable efficient partial synchronization
 */
export interface SyncMetadata {
  id: string; // Primary key, typically 'gmail_sync'
  lastHistoryId: string; // Gmail historyId for partial sync
  lastFullSyncDate: Date; // When the last full sync was performed
  lastPartialSyncDate: Date; // When the last partial sync was performed
  totalEmailsSynced: number; // Total count of emails synced
  lastSyncStatus: "success" | "failed" | "in_progress"; // Status of last sync
  lastErrorMessage?: string; // Error message if last sync failed
  syncSettings: {
    monthsToSync: number; // How many months to sync in full sync
    batchSize: number; // Batch size for processing
    maxMessages: number; // Maximum messages to sync
  };

  createdAt: Date;
  updatedAt: Date;
}

// Adjust the db type for GenericAnalyticsItem if you make 'id' auto-incrementing
export const db = new Dexie("gmail-analytics") as Dexie & {
  emails: EntityTable<ParsedEmail, "id">;
  transactions: EntityTable<Transaction, "id">;
  subscriptions: EntityTable<Subscription, "id">;
  analytics: EntityTable<GenericAnalyticsItem, "id">;
  syncMetadata: EntityTable<SyncMetadata, "id">;
};

db.version(1).stores({
  emails:
    "id, from, to, isParsed, processingStatus, errorMessage, requiresUserAction, relatedTransactionIds, relatedSubscriptions, tags, createdAt, updatedAt",
  transactions:
    "id, sourceEmails, transactionIds, paymentMethod, tags, amount, currency, transactionDate, transactionType, category, isManuallyVerified, isProbableDuplicate, createdAt, updatedAt",
  subscriptions:
    "id, name, sourceEmails, tags, amount, currency, billingCycle, nextBillingDate, isActive, category, isManuallyVerified, isProbableDuplicate, linkToManageSubscription, createdAt, updatedAt",
  analytics:
    "id, type, key, data, sourceEmailIds, relevantDate, tags, createdAt, updatedAt",
});

db.version(2).stores({
  emails:
    "id, from, to, isParsed, processingStatus, requiresUserAction, *relatedTransactionIds, *relatedSubscriptions, *tags, createdAt, updatedAt, emailReceivedAt",
  // Primary Key: 'id' (Gmail message ID, string)
  // Indexes:
  // 'from', 'to': For querying by sender/recipient.
  // 'isParsed': Boolean, for filtering processed/unprocessed emails.
  // 'processingStatus': For finding emails in specific states (pending, completed, etc.).
  // 'requiresUserAction': Boolean, for emails needing attention.
  // '*relatedTransactionIds': Multi-entry for finding emails linked to specific transaction IDs.
  // '*relatedSubscriptions': Multi-entry for finding emails linked to specific subscription IDs.
  // '*tags': Multi-entry for searching emails by tags.
  // 'createdAt', 'updatedAt': Timestamps for auditing/sorting.
  // 'emailReceivedAt': Crucial for time-based queries, sorting, and determining sync status ranges.

  transactions:
    "id, *sourceEmails, *transactionIds, paymentMethod, *tags, amount, currency, transactionDate, transactionType, category, isManuallyVerified, isProbableDuplicate, [category+transactionDate], [transactionType+transactionDate]",
  // Primary Key: 'id' (UUID string you generate)
  // Indexes:
  // '*sourceEmails': Multi-entry for finding all transactions derived from a specific email ID.
  // '*transactionIds': Multi-entry. This is KEY for deduplication. You can query if any of the bank-tx-id, merchant-tx-id, order-id, etc., already exist in another transaction record.
  // 'paymentMethod': For analytics.
  // '*tags': Multi-entry for flexible searching.
  // 'amount', 'currency': For financial queries (though range queries on amount are common).
  // 'transactionDate': Essential for time-based analytics, filtering by date ranges.
  // 'transactionType': For analytics (debit, credit, etc.).
  // 'category': For analytics (food, shopping, etc.).
  // 'isManuallyVerified', 'isProbableDuplicate': Booleans for filtering.
  // '[category+transactionDate]': Compound index for common queries like "show all 'food' transactions this month".
  // '[transactionType+transactionDate]': Compound index for queries like "show all 'credit' transactions this year".

  subscriptions:
    "id, name, *sourceEmails, *tags, amount, currency, billingCycle, nextBillingDate, isActive, category, isManuallyVerified, isProbableDuplicate, [category+isActive], [name+isActive]",
  // Primary Key: 'id' (UUID string you generate)
  // Indexes:
  // 'name': For searching by subscription name.
  // '*sourceEmails': Multi-entry for linking to source emails.
  // '*tags': Multi-entry for searching by tags.
  // 'nextBillingDate': Essential for finding upcoming renewals.
  // 'isActive': Boolean, for filtering active/inactive subscriptions.
  // 'category': For analytics.
  // 'isManuallyVerified', 'isProbableDuplicate': Booleans for filtering.
  // '[category+isActive]': Compound index for "show active subscriptions in 'entertainment' category".
  // '[name+isActive]': Compound index for finding a specific active/inactive subscription.

  analytics:
    "++id, &[type+key], type, key, *sourceEmailIds, relevantDate, *tags, createdAt",
  // Primary Key: '++id' (Auto-incrementing number). This is a common choice for generic tables.
  //   If you use ++id, ensure your GenericAnalyticsItem interface's 'id' is `number` (optional for creation).
  //   And update `EntityTable<GenericAnalyticsItem, "id">` to `EntityTable<GenericAnalyticsItem, number>`.
  //   If you intend to provide your own `id` (number) for `GenericAnalyticsItem`, keep it as `id` here.
  // Indexes:
  // '&[type+key]': Compound unique index. Ensures that the combination of 'type' and 'key' is unique.
  //               Excellent for uniquely identifying specific analytic items (e.g., type='monthly_spend', key='2024-05').
  // 'type': For querying all items of a certain analytic type.
  // 'key': For querying by key (often used with 'type').
  // '*sourceEmailIds': Multi-entry for linking to source emails.
  // 'relevantDate': For time-sensitive analytics.
  // '*tags': Multi-entry for general categorization and searching.
  // 'createdAt': For auditing.

  syncMetadata:
    "id, lastHistoryId, lastFullSyncDate, lastPartialSyncDate, totalEmailsSynced, lastSyncStatus, lastErrorMessage, createdAt, updatedAt",
  // Primary Key: 'id' (string, typically 'gmail_sync')
  // Indexes:
  // 'lastHistoryId': For quickly accessing the current sync state.
  // 'lastFullSyncDate', 'lastPartialSyncDate': For determining when syncs were last performed.
  // 'totalEmailsSynced': For analytics and progress tracking.
  // 'lastSyncStatus': For filtering by sync status.
  // 'createdAt', 'updatedAt': For auditing.
});
