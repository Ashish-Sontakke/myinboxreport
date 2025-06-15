"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  syncEmails,
  createGmailSyncService,
  type SyncProgress,
  type SyncOptions,
  type GmailAuthConfig,
} from "@/lib/fetch-emails";
import { getSyncMetadata, updateSyncStatus } from "@/lib/db-operations";
import type { SyncMetadata } from "@/lib/db";

export interface GmailSyncState {
  isInitialized: boolean;
  isSyncing: boolean;
  syncProgress: SyncProgress | null;
  lastSyncDate: Date | null;
  syncMetadata: SyncMetadata | null;
  error: string | null;
  isOnline: boolean;
}

export interface GmailSyncActions {
  startSync: (options?: SyncOptions) => Promise<void>;
  stopSync: () => void;
  forceFullSync: (options?: SyncOptions) => Promise<void>;
  refreshMetadata: () => Promise<void>;
  enableAutoSync: (intervalMinutes?: number) => void;
  disableAutoSync: () => void;
}

export interface UseGmailSyncOptions {
  authConfig?: GmailAuthConfig;
  autoSyncInterval?: number; // minutes
  enableAutoSync?: boolean;
  onSyncComplete?: (progress: SyncProgress) => void;
  onSyncError?: (error: string) => void;
}

export function useGmailSync(
  options: UseGmailSyncOptions = {}
): [GmailSyncState, GmailSyncActions] {
  const {
    authConfig,
    autoSyncInterval = 15, // Default 15 minutes
    enableAutoSync: shouldEnableAutoSync = false,
    onSyncComplete,
    onSyncError,
  } = options;

  // State
  const [state, setState] = useState<GmailSyncState>({
    isInitialized: false,
    isSyncing: false,
    syncProgress: null,
    lastSyncDate: null,
    syncMetadata: null,
    error: null,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  });

  // Refs for managing intervals and sync service
  const autoSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncServiceRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize sync service and metadata
  const initialize = useCallback(async () => {
    try {
      if (authConfig) {
        syncServiceRef.current = createGmailSyncService(authConfig);
      }

      const metadata = await getSyncMetadata();
      setState((prev) => ({
        ...prev,
        syncMetadata: metadata || null,
        lastSyncDate:
          metadata?.lastPartialSyncDate || metadata?.lastFullSyncDate || null,
        isInitialized: true,
      }));
    } catch (error) {
      console.error("Failed to initialize Gmail sync:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Initialization failed",
        isInitialized: true,
      }));
    }
  }, [authConfig]);

  // Refresh sync metadata
  const refreshMetadata = useCallback(async () => {
    try {
      const metadata = await getSyncMetadata();
      setState((prev) => ({
        ...prev,
        syncMetadata: metadata || null,
        lastSyncDate:
          metadata?.lastPartialSyncDate || metadata?.lastFullSyncDate || null,
      }));
    } catch (error) {
      console.error("Failed to refresh sync metadata:", error);
    }
  }, []);

  // Progress callback for sync operations
  const handleSyncProgress = useCallback((progress: SyncProgress) => {
    setState((prev) => ({
      ...prev,
      syncProgress: progress,
    }));
  }, []);

  // Start synchronization
  const startSync = useCallback(
    async (syncOptions: SyncOptions = {}) => {
      if (!authConfig) {
        const error = "Gmail authentication configuration is required";
        setState((prev) => ({ ...prev, error }));
        onSyncError?.(error);
        return;
      }

      if (state.isSyncing) {
        console.log("Sync already in progress");
        return;
      }

      setState((prev) => ({
        ...prev,
        isSyncing: true,
        error: null,
        syncProgress: null,
      }));

      abortControllerRef.current = new AbortController();

      try {
        await updateSyncStatus("in_progress");

        const progress = await syncEmails(authConfig, {
          ...syncOptions,
          onProgress: handleSyncProgress,
        });

        setState((prev) => ({
          ...prev,
          isSyncing: false,
          syncProgress: progress,
          lastSyncDate: new Date(),
        }));

        await refreshMetadata();
        onSyncComplete?.(progress);

        console.log("Sync completed successfully:", progress);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Sync failed";

        setState((prev) => ({
          ...prev,
          isSyncing: false,
          error: errorMessage,
        }));

        await updateSyncStatus("failed", errorMessage);
        onSyncError?.(errorMessage);
        console.error("Sync failed:", error);
      }
    },
    [
      authConfig,
      state.isSyncing,
      handleSyncProgress,
      refreshMetadata,
      onSyncComplete,
      onSyncError,
    ]
  );

  // Force full synchronization
  const forceFullSync = useCallback(
    async (syncOptions: SyncOptions = {}) => {
      if (!authConfig) {
        const error = "Gmail authentication configuration is required";
        setState((prev) => ({ ...prev, error }));
        onSyncError?.(error);
        return;
      }

      if (state.isSyncing) {
        console.log("Sync already in progress");
        return;
      }

      setState((prev) => ({
        ...prev,
        isSyncing: true,
        error: null,
        syncProgress: null,
      }));

      try {
        const syncService = createGmailSyncService(authConfig);

        const progress = await syncService.performFullSync({
          ...syncOptions,
          onProgress: handleSyncProgress,
        });

        setState((prev) => ({
          ...prev,
          isSyncing: false,
          syncProgress: progress,
          lastSyncDate: new Date(),
        }));

        await refreshMetadata();
        onSyncComplete?.(progress);

        console.log("Full sync completed successfully:", progress);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Full sync failed";

        setState((prev) => ({
          ...prev,
          isSyncing: false,
          error: errorMessage,
        }));

        await updateSyncStatus("failed", errorMessage);
        onSyncError?.(errorMessage);
        console.error("Full sync failed:", error);
      }
    },
    [
      authConfig,
      state.isSyncing,
      handleSyncProgress,
      refreshMetadata,
      onSyncComplete,
      onSyncError,
    ]
  );

  // Stop current sync operation
  const stopSync = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isSyncing: false,
      error: "Sync stopped by user",
    }));

    console.log("Sync stopped by user");
  }, []);

  // Disable auto sync
  const disableAutoSync = useCallback(() => {
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
      autoSyncIntervalRef.current = null;
      console.log("Auto sync disabled");
    }
  }, []);

  // Enable auto sync
  const enableAutoSyncAction = useCallback(
    (intervalMinutes: number = autoSyncInterval) => {
      disableAutoSync(); // Clear any existing interval

      const runAutoSync = async () => {
        if (!state.isSyncing && state.isOnline) {
          console.log(
            `Running auto sync (interval: ${intervalMinutes} minutes)`
          );
          await startSync({ maxMessages: 100 }); // Smaller batch for auto sync
        }
      };

      // Run initial sync after a short delay
      setTimeout(runAutoSync, 5000);

      // Set up recurring sync
      autoSyncIntervalRef.current = setInterval(
        runAutoSync,
        intervalMinutes * 60 * 1000
      );

      console.log(`Auto sync enabled with ${intervalMinutes} minute interval`);
    },
    [
      autoSyncInterval,
      state.isSyncing,
      state.isOnline,
      startSync,
      disableAutoSync,
    ]
  );

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      console.log("Connection restored");
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      console.log("Connection lost");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Enable auto sync if requested
  useEffect(() => {
    if (shouldEnableAutoSync && state.isInitialized && authConfig) {
      enableAutoSyncAction(autoSyncInterval);
    }

    return () => {
      disableAutoSync();
    };
  }, [
    shouldEnableAutoSync,
    state.isInitialized,
    authConfig,
    autoSyncInterval,
    enableAutoSyncAction,
    disableAutoSync,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableAutoSync();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [disableAutoSync]);

  const actions: GmailSyncActions = {
    startSync,
    stopSync,
    forceFullSync,
    refreshMetadata,
    enableAutoSync: enableAutoSyncAction,
    disableAutoSync,
  };

  return [state, actions];
}

// Utility hook for sync status
export function useSyncStatus() {
  const [syncMetadata, setSyncMetadata] = useState<SyncMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const metadata = await getSyncMetadata();
      setSyncMetadata(metadata || null);
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return { syncMetadata, loading, refreshStatus };
}
