import {
  db,
  type ParsedEmail,
  type Transaction,
  type Subscription,
  type SyncMetadata,
} from "./db";

export const getMostRecentAndOldestParsedEmail = async (): Promise<{
  latest: ParsedEmail | undefined;
  oldest: ParsedEmail | undefined;
}> => {
  try {
    const [latest, oldest] = await Promise.all([
      db.emails
        .orderBy("emailReceivedAt")
        .reverse()
        .filter((email) => email.isParsed)
        .first(),
      db.emails
        .orderBy("emailReceivedAt")
        .filter((email) => email.isParsed)
        .first(),
    ]);

    return { latest, oldest };
  } catch (error) {
    console.error(
      "Error fetching most recent and oldest parsed emails:",
      error
    );
    throw new Error("Failed to fetch parsed emails");
  }
};

export const getTransactionsThisMonth = async (): Promise<Transaction[]> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return await db.transactions
      .where("transactionDate")
      .between(startOfMonth, endOfMonth, true, true)
      .toArray();
  } catch (error) {
    console.error("Error fetching transactions for this month:", error);
    throw new Error("Failed to fetch transactions for this month");
  }
};

export const getLastXTransactions = async (
  x: number
): Promise<Transaction[]> => {
  try {
    if (x <= 0) {
      throw new Error("Number of transactions must be greater than 0");
    }

    return await db.transactions
      .orderBy("transactionDate")
      .reverse()
      .limit(x)
      .toArray();
  } catch (error) {
    console.error(`Error fetching last ${x} transactions:`, error);
    throw new Error(`Failed to fetch last ${x} transactions`);
  }
};

export const getTransactionsBetweenDates = async (
  fromDate: Date,
  toDate: Date
): Promise<Transaction[]> => {
  try {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    return await db.transactions
      .where("transactionDate")
      .between(start, end, true, true)
      .toArray();
  } catch (error) {
    console.error("Error fetching transactions from date:", error);
    throw new Error("Failed to fetch transactions from specified date");
  }
};

/**
 * function to find a probable duplicate transaction/s based on identifiers
 * If any of the identifiers are present in any other transaction, then it is a probable duplicate
 * identifiers can be: bank-transaction-id, merchant-transaction-id, order-id, etc.
 */
export const findProbableDuplicateTransaction = async (
  identifiers: string[]
): Promise<Transaction[]> => {
  try {
    if (!identifiers || identifiers.length === 0) {
      return [];
    }

    // Filter out empty identifiers
    const validIdentifiers = identifiers.filter((id) => id && id.trim());
    if (validIdentifiers.length === 0) {
      return [];
    }

    // Use the multi-entry index on transactionIds to find matching transactions
    const duplicates = await db.transactions
      .where("transactionIds")
      .anyOf(validIdentifiers)
      .toArray();

    return duplicates;
  } catch (error) {
    console.error("Error finding probable duplicate transactions:", error);
    throw new Error("Failed to find probable duplicate transactions");
  }
};

export const getTransactionsByCategory = async (
  category: string
): Promise<Transaction[]> => {
  try {
    if (!category || !category.trim()) {
      throw new Error("Category cannot be empty");
    }

    return await db.transactions
      .where("category")
      .equals(category.trim())
      .toArray();
  } catch (error) {
    console.error(
      `Error fetching transactions by category '${category}':`,
      error
    );
    throw new Error(`Failed to fetch transactions by category '${category}'`);
  }
};

export const getTransactionsByPaymentMethod = async (
  paymentMethod: string
): Promise<Transaction[]> => {
  try {
    if (!paymentMethod || !paymentMethod.trim()) {
      throw new Error("Payment method cannot be empty");
    }

    const normalizedPaymentMethod = paymentMethod.trim().toLowerCase();
    const validPaymentMethods = ["card", "bank", "cash", "other"];

    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      throw new Error(
        `Invalid payment method. Must be one of: ${validPaymentMethods.join(
          ", "
        )}`
      );
    }

    return await db.transactions
      .where("paymentMethod")
      .equals(normalizedPaymentMethod as "card" | "bank" | "cash" | "other")
      .toArray();
  } catch (error) {
    console.error(
      `Error fetching transactions by payment method '${paymentMethod}':`,
      error
    );
    throw new Error(
      `Failed to fetch transactions by payment method '${paymentMethod}'`
    );
  }
};

export const getTransactionsByTags = async (
  tags: string[]
): Promise<Transaction[]> => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }

    // Filter out empty tags
    const validTags = tags.filter((tag) => tag && tag.trim());
    if (validTags.length === 0) {
      return [];
    }

    // Use the multi-entry index on tags to find transactions that have any of the specified tags
    return await db.transactions.where("tags").anyOf(validTags).toArray();
  } catch (error) {
    console.error("Error fetching transactions by tags:", error);
    throw new Error("Failed to fetch transactions by tags");
  }
};

export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  try {
    return await db.subscriptions
      .filter((subscription) => subscription.isActive)
      .toArray();
  } catch (error) {
    console.error("Error fetching active subscriptions:", error);
    throw new Error("Failed to fetch active subscriptions");
  }
};

// Additional utility functions for common operations

export const getTransactionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  try {
    if (startDate > endDate) {
      throw new Error("Start date cannot be after end date");
    }

    return await db.transactions
      .where("transactionDate")
      .between(startDate, endDate, true, true)
      .toArray();
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    throw new Error("Failed to fetch transactions by date range");
  }
};

export const getTransactionsByType = async (
  transactionType: Transaction["transactionType"]
): Promise<Transaction[]> => {
  try {
    return await db.transactions
      .where("transactionType")
      .equals(transactionType)
      .toArray();
  } catch (error) {
    console.error(
      `Error fetching transactions by type '${transactionType}':`,
      error
    );
    throw new Error(
      `Failed to fetch transactions by type '${transactionType}'`
    );
  }
};

export const getEmailsByProcessingStatus = async (
  status: ParsedEmail["processingStatus"]
): Promise<ParsedEmail[]> => {
  try {
    return await db.emails.where("processingStatus").equals(status).toArray();
  } catch (error) {
    console.error(
      `Error fetching emails by processing status '${status}':`,
      error
    );
    throw new Error(`Failed to fetch emails by processing status '${status}'`);
  }
};

export const getEmailsRequiringUserAction = async (): Promise<
  ParsedEmail[]
> => {
  try {
    return await db.emails
      .filter((email) => email.requiresUserAction)
      .toArray();
  } catch (error) {
    console.error("Error fetching emails requiring user action:", error);
    throw new Error("Failed to fetch emails requiring user action");
  }
};

export const getSubscriptionsByCategory = async (
  category: string
): Promise<Subscription[]> => {
  try {
    if (!category || !category.trim()) {
      throw new Error("Category cannot be empty");
    }

    return await db.subscriptions
      .where("category")
      .equals(category.trim())
      .toArray();
  } catch (error) {
    console.error(
      `Error fetching subscriptions by category '${category}':`,
      error
    );
    throw new Error(`Failed to fetch subscriptions by category '${category}'`);
  }
};

export const getUpcomingSubscriptionRenewals = async (
  daysAhead: number = 7
): Promise<Subscription[]> => {
  try {
    if (daysAhead < 0) {
      throw new Error("Days ahead cannot be negative");
    }

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    return await db.subscriptions
      .where("nextBillingDate")
      .between(now, futureDate, true, true)
      .filter((subscription) => subscription.isActive)
      .toArray();
  } catch (error) {
    console.error("Error fetching upcoming subscription renewals:", error);
    throw new Error("Failed to fetch upcoming subscription renewals");
  }
};

// Email operations
export const saveEmail = async (email: ParsedEmail): Promise<void> => {
  try {
    await db.emails.put(email);
  } catch (error) {
    console.error(`Error saving email with id ${email.id}:`, error);
    throw new Error(`Failed to save email with id ${email.id}`);
  }
};

export const saveEmailsBatch = async (emails: ParsedEmail[]): Promise<void> => {
  try {
    if (!emails || emails.length === 0) {
      return;
    }
    await db.emails.bulkPut(emails);
  } catch (error) {
    console.error("Error saving emails in batch:", error);
    throw new Error("Failed to save emails in batch");
  }
};

export const getAllEmails = async (): Promise<ParsedEmail[]> => {
  try {
    return await db.emails.toArray();
  } catch (error) {
    console.error("Error fetching all emails:", error);
    throw new Error("Failed to fetch all emails");
  }
};

export const getEmailById = async (
  id: string
): Promise<ParsedEmail | undefined> => {
  try {
    return await db.emails.get(id);
  } catch (error) {
    console.error(`Error fetching email with id ${id}:`, error);
    throw new Error(`Failed to fetch email with id ${id}`);
  }
};

export const emailExists = async (id: string): Promise<boolean> => {
  try {
    const email = await db.emails.get(id);
    return !!email;
  } catch (error) {
    console.error(`Error checking if email exists with id ${id}:`, error);
    return false;
  }
};

// Sync Metadata operations
export const getSyncMetadata = async (): Promise<SyncMetadata | undefined> => {
  try {
    return await db.syncMetadata.get("gmail_sync");
  } catch (error) {
    console.error("Error fetching sync metadata:", error);
    return undefined;
  }
};

export const saveSyncMetadata = async (
  metadata: Partial<SyncMetadata>
): Promise<void> => {
  try {
    const now = new Date();
    const existing = await getSyncMetadata();

    const syncMetadata: SyncMetadata = {
      id: "gmail_sync",
      lastHistoryId: metadata.lastHistoryId || existing?.lastHistoryId || "",
      lastFullSyncDate:
        metadata.lastFullSyncDate || existing?.lastFullSyncDate || now,
      lastPartialSyncDate:
        metadata.lastPartialSyncDate || existing?.lastPartialSyncDate || now,
      totalEmailsSynced:
        metadata.totalEmailsSynced || existing?.totalEmailsSynced || 0,
      lastSyncStatus:
        metadata.lastSyncStatus || existing?.lastSyncStatus || "success",
      lastErrorMessage: metadata.lastErrorMessage || existing?.lastErrorMessage,
      syncSettings: {
        monthsToSync:
          metadata.syncSettings?.monthsToSync ||
          existing?.syncSettings?.monthsToSync ||
          6,
        batchSize:
          metadata.syncSettings?.batchSize ||
          existing?.syncSettings?.batchSize ||
          100,
        maxMessages:
          metadata.syncSettings?.maxMessages ||
          existing?.syncSettings?.maxMessages ||
          1000,
        ...metadata.syncSettings,
      },
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await db.syncMetadata.put(syncMetadata);
  } catch (error) {
    console.error("Error saving sync metadata:", error);
    throw new Error("Failed to save sync metadata");
  }
};

export const updateSyncStatus = async (
  status: SyncMetadata["lastSyncStatus"],
  errorMessage?: string
): Promise<void> => {
  try {
    await saveSyncMetadata({
      lastSyncStatus: status,
      lastErrorMessage: errorMessage,
    });
  } catch (error) {
    console.error("Error updating sync status:", error);
    throw new Error("Failed to update sync status");
  }
};

export const getLastHistoryId = async (): Promise<string | null> => {
  try {
    const metadata = await getSyncMetadata();
    return metadata?.lastHistoryId || null;
  } catch (error) {
    console.error("Error getting last history ID:", error);
    return null;
  }
};

export const updateLastHistoryId = async (historyId: string): Promise<void> => {
  try {
    await saveSyncMetadata({
      lastHistoryId: historyId,
      lastPartialSyncDate: new Date(),
    });
  } catch (error) {
    console.error("Error updating last history ID:", error);
    throw new Error("Failed to update last history ID");
  }
};

export const incrementTotalEmailsSynced = async (
  count: number
): Promise<void> => {
  try {
    const metadata = await getSyncMetadata();
    const currentTotal = metadata?.totalEmailsSynced || 0;

    await saveSyncMetadata({
      totalEmailsSynced: currentTotal + count,
    });
  } catch (error) {
    console.error("Error incrementing total emails synced:", error);
    throw new Error("Failed to increment total emails synced");
  }
};

export const markFullSyncComplete = async (
  historyId: string,
  emailCount: number
): Promise<void> => {
  try {
    const now = new Date();
    await saveSyncMetadata({
      lastHistoryId: historyId,
      lastFullSyncDate: now,
      lastPartialSyncDate: now,
      totalEmailsSynced: emailCount,
      lastSyncStatus: "success",
      lastErrorMessage: undefined,
    });
  } catch (error) {
    console.error("Error marking full sync complete:", error);
    throw new Error("Failed to mark full sync complete");
  }
};
