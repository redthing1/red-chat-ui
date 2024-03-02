import { KeyValuePair } from './data';
import {
  IconBolt,
  IconBrandGoogle,
  IconBrandSafari,
  IconFileText,
  IconWorldSearch,
  TablerIconsProps,
} from '@tabler/icons-react';

export interface Plugin {
  id: PluginID;
  name: string;
  type: PluginType;
  enabled: boolean;
  requiredKeys?: KeyValuePair[];
  icon: (props: TablerIconsProps) => JSX.Element;
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
    icon: IconBrandGoogle,
  },
  [PluginID.WEB_BROWSER]: {
    id: PluginID.WEB_BROWSER,
    name: "Web Browser",
    type: PluginType.CUSTOM_ENDPOINT,
    enabled: false,
    icon: IconBrandSafari,
  },
  [PluginID.CODEX_DOCS]: {
    id: PluginID.CODEX_DOCS,
    type: PluginType.PROMPT_ENHANCER,
    name: "Codex Docs",
    enabled: true,
    icon: IconFileText,
  },
  [PluginID.CODEX_WEB]: {
    id: PluginID.CODEX_WEB,
    type: PluginType.PROMPT_ENHANCER,
    name: "Codex Web",
    enabled: true,
    icon: IconWorldSearch,
  },
};

export const PluginList = Object.values(Plugins);
