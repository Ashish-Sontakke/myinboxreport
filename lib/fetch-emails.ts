/**
 * Lib to handle all email fetching and state management for emails
 */

import { google } from "googleapis";
import {
  saveEmailsBatch,
  emailExists,
  getMostRecentAndOldestParsedEmail,
  getSyncMetadata,
  saveSyncMetadata,
  updateSyncStatus,
  getLastHistoryId,
  updateLastHistoryId,
  incrementTotalEmailsSynced,
  markFullSyncComplete,
} from "./db-operations";
import type { ParsedEmail } from "./db";

export interface SyncProgress {
  totalMessages: number;
  processedMessages: number;
  currentBatch: number;
  isComplete: boolean;
  errors: string[];
}

export interface SyncOptions {
  maxMessages?: number;
  batchSize?: number;
  monthsToSync?: number; // For initial sync, default 6 months
  onProgress?: (progress: SyncProgress) => void;
}

export interface GmailAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken: string;
}

export class GmailSyncService {
  private gmail: any;
  private auth: any;
  private lastHistoryId: string | null = null;

  constructor(authConfig: GmailAuthConfig) {
    this.auth = new google.auth.OAuth2(
      authConfig.clientId,
      authConfig.clientSecret,
      authConfig.redirectUri
    );

    this.auth.setCredentials({
      access_token: authConfig.accessToken,
      refresh_token: authConfig.refreshToken,
    });

    this.gmail = google.gmail({ version: "v1", auth: this.auth });
  }

  /**
   * Perform full synchronization for the first time or when partial sync is not available
   * Retrieves messages from the last X months (default 6 months)
   */
  async performFullSync(options: SyncOptions = {}): Promise<SyncProgress> {
    const {
      maxMessages = 1000,
      batchSize = 100,
      monthsToSync = 6,
      onProgress,
    } = options;

    const progress: SyncProgress = {
      totalMessages: 0,
      processedMessages: 0,
      currentBatch: 0,
      isComplete: false,
      errors: [],
    };

    try {
      // Mark sync as in progress
      await updateSyncStatus("in_progress");

      // Calculate date range for the last X months
      const now = new Date();
      const fromDate = new Date();
      fromDate.setMonth(now.getMonth() - monthsToSync);

      const query = `after:${fromDate.getFullYear()}/${(fromDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${fromDate.getDate().toString().padStart(2, "0")}`;

      console.log(
        `Starting full sync for messages after: ${fromDate.toISOString()}`
      );

      // Step 1: Get list of message IDs
      let allMessageIds: string[] = [];
      let nextPageToken: string | undefined;

      do {
        const listResponse = await this.gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: Math.min(500, maxMessages), // Gmail API limit
          pageToken: nextPageToken,
        });

        if (listResponse.data.messages) {
          const messageIds = listResponse.data.messages.map(
            (msg: any) => msg.id
          );
          allMessageIds.push(...messageIds);

          if (allMessageIds.length >= maxMessages) {
            allMessageIds = allMessageIds.slice(0, maxMessages);
            break;
          }
        }

        nextPageToken = listResponse.data.nextPageToken;
      } while (nextPageToken && allMessageIds.length < maxMessages);

      progress.totalMessages = allMessageIds.length;
      console.log(`Found ${progress.totalMessages} messages to sync`);

      if (onProgress) onProgress(progress);

      // Step 2: Process messages in batches
      const batches = this.chunkArray(allMessageIds, batchSize);

      for (const [batchIndex, batch] of batches.entries()) {
        progress.currentBatch = batchIndex + 1;

        try {
          const emails = await this.fetchMessagesBatch(batch);

          if (emails.length > 0) {
            await saveEmailsBatch(emails);
            progress.processedMessages += emails.length;
            await incrementTotalEmailsSynced(emails.length);
          }

          if (onProgress) onProgress(progress);

          // Rate limiting: wait between batches
          await this.delay(100);
        } catch (error) {
          const errorMsg = `Batch ${batchIndex + 1} failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          progress.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Get current historyId and mark sync as complete
      const currentHistoryId = await this.getCurrentHistoryId();
      await markFullSyncComplete(currentHistoryId, progress.processedMessages);

      progress.isComplete = true;
      console.log(
        `Full sync completed. Processed ${progress.processedMessages}/${progress.totalMessages} messages`
      );

      if (onProgress) onProgress(progress);
      return progress;
    } catch (error) {
      const errorMsg = `Full sync failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      progress.errors.push(errorMsg);
      console.error(errorMsg);
      await updateSyncStatus("failed", errorMsg);
      throw error;
    }
  }

  /**
   * Perform partial synchronization using Gmail's history API
   * Use this for regular updates after initial full sync
   */
  async performPartialSync(
    startHistoryId?: string,
    options: SyncOptions = {}
  ): Promise<SyncProgress> {
    const { batchSize = 100, onProgress } = options;

    const progress: SyncProgress = {
      totalMessages: 0,
      processedMessages: 0,
      currentBatch: 0,
      isComplete: false,
      errors: [],
    };

    try {
      // Get the historyId from database if not provided
      const historyId = startHistoryId || (await getLastHistoryId());

      if (!historyId) {
        console.log("No historyId found, performing full sync instead");
        return await this.performFullSync(options);
      }

      // Mark sync as in progress
      await updateSyncStatus("in_progress");

      console.log(`Starting partial sync from historyId: ${historyId}`);

      // Get history records since the last sync
      let historyRecords: any[] = [];
      let nextPageToken: string | undefined;

      do {
        try {
          const historyResponse = await this.gmail.users.history.list({
            userId: "me",
            startHistoryId: historyId,
            historyTypes: [
              "messageAdded",
              "messageDeleted",
              "labelAdded",
              "labelRemoved",
            ],
            pageToken: nextPageToken,
          });

          if (historyResponse.data.history) {
            historyRecords.push(...historyResponse.data.history);
          }

          nextPageToken = historyResponse.data.nextPageToken;
        } catch (error: any) {
          if (error.code === 404) {
            console.log("History not available, performing full sync instead");
            return await this.performFullSync(options);
          }
          throw error;
        }
      } while (nextPageToken);

      // Extract unique message IDs from history records
      const messageIds = new Set<string>();
      for (const record of historyRecords) {
        if (record.messagesAdded) {
          record.messagesAdded.forEach((msg: any) =>
            messageIds.add(msg.message.id)
          );
        }
        // Handle other history types if needed (deleted, label changes, etc.)
      }

      const uniqueMessageIds = Array.from(messageIds);
      progress.totalMessages = uniqueMessageIds.length;

      console.log(`Found ${progress.totalMessages} new/updated messages`);
      if (onProgress) onProgress(progress);

      if (uniqueMessageIds.length === 0) {
        progress.isComplete = true;
        // Update the historyId even if no new messages
        const currentHistoryId = await this.getCurrentHistoryId();
        await updateLastHistoryId(currentHistoryId);
        await updateSyncStatus("success");
        return progress;
      }

      // Process new messages in batches
      const batches = this.chunkArray(uniqueMessageIds, batchSize);

      for (const [batchIndex, batch] of batches.entries()) {
        progress.currentBatch = batchIndex + 1;

        try {
          // Filter out messages we already have
          const newMessageIds = [];
          for (const messageId of batch) {
            if (!(await emailExists(messageId))) {
              newMessageIds.push(messageId);
            }
          }

          if (newMessageIds.length > 0) {
            const emails = await this.fetchMessagesBatch(newMessageIds);

            if (emails.length > 0) {
              await saveEmailsBatch(emails);
              progress.processedMessages += emails.length;
              await incrementTotalEmailsSynced(emails.length);
            }
          } else {
            progress.processedMessages += batch.length; // All were already processed
          }

          if (onProgress) onProgress(progress);

          // Rate limiting
          await this.delay(100);
        } catch (error) {
          const errorMsg = `Partial sync batch ${batchIndex + 1} failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          progress.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Update historyId and mark sync as complete
      const currentHistoryId = await this.getCurrentHistoryId();
      await updateLastHistoryId(currentHistoryId);
      await updateSyncStatus("success");

      progress.isComplete = true;
      console.log(
        `Partial sync completed. Processed ${progress.processedMessages} new messages`
      );

      if (onProgress) onProgress(progress);
      return progress;
    } catch (error) {
      const errorMsg = `Partial sync failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      progress.errors.push(errorMsg);
      console.error(errorMsg);
      await updateSyncStatus("failed", errorMsg);
      throw error;
    }
  }

  /**
   * Fetch a batch of messages using the Gmail API
   * Uses batch requests for optimal performance
   */
  private async fetchMessagesBatch(
    messageIds: string[]
  ): Promise<ParsedEmail[]> {
    const emails: ParsedEmail[] = [];

    // Process in smaller sub-batches for the batch API (Gmail allows up to 100 requests per batch)
    const subBatches = this.chunkArray(messageIds, 100);

    for (const subBatch of subBatches) {
      try {
        // For now, we'll use individual requests.
        // TODO: Implement actual batch requests for better performance
        const batchPromises = subBatch.map(async (messageId) => {
          try {
            const messageResponse = await this.gmail.users.messages.get({
              userId: "me",
              id: messageId,
              format: "FULL", // Get full message for first-time retrieval
            });

            return this.convertGmailMessageToEmail(messageResponse.data);
          } catch (error) {
            console.error(`Failed to fetch message ${messageId}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validEmails = batchResults.filter(
          (email): email is ParsedEmail => email !== null
        );
        emails.push(...validEmails);
      } catch (error) {
        console.error("Batch request failed:", error);
        throw error;
      }
    }

    return emails;
  }

  /**
   * Convert Gmail API message to our ParsedEmail format
   */
  private convertGmailMessageToEmail(gmailMessage: any): ParsedEmail {
    const headers = gmailMessage.payload?.headers || [];
    const fromHeader =
      headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
    const toHeader =
      headers.find((h: any) => h.name.toLowerCase() === "to")?.value || "";
    const dateHeader =
      headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";

    const emailReceivedAt = dateHeader ? new Date(dateHeader) : new Date();
    const now = new Date();

    return {
      id: gmailMessage.id,
      from: fromHeader,
      to: toHeader,
      isParsed: false,
      processingStatus: "pending",
      requiresUserAction: false,
      relatedTransactionIds: [],
      relatedSubscriptions: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
      emailReceivedAt,
    };
  }

  /**
   * Get the current historyId for the user's mailbox
   * This is used as a starting point for future partial syncs
   */
  async getCurrentHistoryId(): Promise<string> {
    try {
      const profile = await this.gmail.users.getProfile({ userId: "me" });
      return profile.data.historyId;
    } catch (error) {
      console.error("Failed to get current historyId:", error);
      throw error;
    }
  }

  /**
   * Check if we need to perform a full sync or can use partial sync
   */
  async shouldPerformFullSync(): Promise<boolean> {
    try {
      const syncMetadata = await getSyncMetadata();

      // If no sync metadata exists, perform full sync
      if (!syncMetadata || !syncMetadata.lastHistoryId) {
        return true;
      }

      // If last full sync is older than a week, consider full sync
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (syncMetadata.lastFullSyncDate < oneWeekAgo) {
        console.log(
          "Last full sync is older than a week, performing full sync"
        );
        return true;
      }

      // Check if we have any emails in the database
      const { latest } = await getMostRecentAndOldestParsedEmail();
      if (!latest) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error determining sync type:", error);
      return true; // Default to full sync on error
    }
  }

  /**
   * Utility function to split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Simple delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create a GmailSyncService instance
 */
export function createGmailSyncService(
  authConfig: GmailAuthConfig
): GmailSyncService {
  return new GmailSyncService(authConfig);
}

/**
 * Helper function to sync emails with automatic full/partial detection
 */
export async function syncEmails(
  authConfig: GmailAuthConfig,
  options: SyncOptions = {}
): Promise<SyncProgress> {
  const syncService = createGmailSyncService(authConfig);

  const shouldFullSync = await syncService.shouldPerformFullSync();

  if (shouldFullSync) {
    console.log("Performing full synchronization...");
    return await syncService.performFullSync(options);
  } else {
    console.log("Performing partial synchronization...");
    return await syncService.performPartialSync(undefined, options);
  }
}
