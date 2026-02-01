export type AIProvider = 'ollama' | 'openai' | 'anthropic';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string; // not needed for Ollama
  baseUrl?: string; // custom Ollama URL
}

export interface SyncState {
  lastSyncedAt?: Date;
  latestHistoryId?: string;
  oldestFetchedDate?: Date;
  isSyncing: boolean;
  totalFetched: number;
}

export interface UserSettings {
  aiProvider: AIProviderConfig;
  syncState: SyncState;
  theme: 'light' | 'dark' | 'system';
}
