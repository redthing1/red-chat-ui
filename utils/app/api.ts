import { Plugin, PluginID } from '@/types/plugin';

export enum EndpointType {
  OpenAIChat,
  GoogleSearch,
  WebBrowser,
}

// export const getEndpoint = (plugin: Plugin | null) => {
//   if (!plugin) {
//     return 'api/chat';
//   }

//   if (plugin.id === PluginID.GOOGLE_SEARCH) {
//     return 'api/google';
//   }

//   return 'api/chat';
// };

export const getEndpointType = (plugin: Plugin | null) => {
  if (!plugin) {
    return EndpointType.OpenAIChat;
  }

  if (plugin.id === PluginID.GOOGLE_SEARCH) {
    return EndpointType.GoogleSearch;
  }

  if (plugin.id === PluginID.WEB_BROWSER) {
    return EndpointType.WebBrowser;
  }

  return EndpointType.OpenAIChat;
}
