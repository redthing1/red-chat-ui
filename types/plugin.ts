import { KeyValuePair } from './data';

export interface Plugin {
  id: PluginID;
  name: PluginName;
  enabled: boolean;
  requiredKeys?: KeyValuePair[];
}

export interface PluginKey {
  pluginId: PluginID;
  requiredKeys: KeyValuePair[];
}

export enum PluginID {
  GOOGLE_SEARCH = 'google-search',
  WEB_BROWSER = 'web-browser',
  ASSISTANT_DOCS = 'assistant-docs',
}

export enum PluginName {
  GOOGLE_SEARCH = 'Google Search',
  WEB_BROWSER = 'Web Browser',
  ASSISTANT_DOCS = 'Assistant Docs',
}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.GOOGLE_SEARCH]: {
    id: PluginID.GOOGLE_SEARCH,
    name: PluginName.GOOGLE_SEARCH,
    enabled: false,
    requiredKeys: [
      {
        key: 'GOOGLE_API_KEY',
        value: '',
      },
      {
        key: 'GOOGLE_CSE_ID',
        value: '',
      },
    ],
  },
  [PluginID.WEB_BROWSER]: {
    id: PluginID.WEB_BROWSER,
    name: PluginName.WEB_BROWSER,
    enabled: false,
  },
  [PluginID.ASSISTANT_DOCS]: {
    id: PluginID.ASSISTANT_DOCS,
    name: PluginName.ASSISTANT_DOCS,
    enabled: true,
  },
};

export const PluginList = Object.values(Plugins);
