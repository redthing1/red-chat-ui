import { KeyValuePair } from './data';

export interface Plugin {
  id: PluginID;
  name: string;
  type: PluginType;
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
  CODEX_DOCS = 'codex-docs',
  CODEX_WEB = 'codex-web',
}

export enum PluginType {
  PROMPT_ENHANCER,
  CUSTOM_ENDPOINT,
}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.GOOGLE_SEARCH]: {
    id: PluginID.GOOGLE_SEARCH,
    name: "Google Search",
    type: PluginType.CUSTOM_ENDPOINT,
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
    name: "Web Browser",
    type: PluginType.CUSTOM_ENDPOINT,
    enabled: false,
  },
  [PluginID.CODEX_DOCS]: {
    id: PluginID.CODEX_DOCS,
    type: PluginType.PROMPT_ENHANCER,
    name: "Codex Docs",
    enabled: true,
  },
  [PluginID.CODEX_WEB]: {
    id: PluginID.CODEX_WEB,
    type: PluginType.PROMPT_ENHANCER,
    name: "Codex Web",
    enabled: true,
  },
};

export const PluginList = Object.values(Plugins);
