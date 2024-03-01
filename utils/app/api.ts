import { Plugin, PluginID } from '@/types/plugin';

export enum EndpointType {
  OpenAIChat,
  GoogleSearch
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

  return EndpointType.OpenAIChat;
}
