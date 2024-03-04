export interface Settings {
  theme: 'light' | 'dark';
  chatApiBaseUrl: string;
  codexApiBaseUrl: string | null;
  autoTitleConversations: boolean;
  enableCustomPersonality: boolean;
  customPersonality: string | null;
}
