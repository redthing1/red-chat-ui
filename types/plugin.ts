import { KeyValuePair } from './data';

export interface Plugin {
  id: PluginID;
  name: PluginName;
  requiredKeys: KeyValuePair[];
}

export interface PluginKey {
  pluginId: PluginID;
  requiredKeys: KeyValuePair[];
}

export enum PluginID {
  GOOGLE_SEARCH = 'google-search',
  WEB_BROWSER = 'web-browser',
}

export enum PluginName {
  GOOGLE_SEARCH = 'Google Search',
  WEB_BROWSER = 'Web Browser',
}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.GOOGLE_SEARCH]: {
    id: PluginID.GOOGLE_SEARCH,
    name: PluginName.GOOGLE_SEARCH,
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
    requiredKeys: [],
  },
};

export const PluginList = Object.values(Plugins);
