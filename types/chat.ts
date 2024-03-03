import { OpenAIModel } from './openai_models';
import { PluginID } from './plugin';

export interface Message {
  role: Role;
  foldedContent?: string | null;
  displayContent: string;
  content: string;
  pluginId?: PluginID;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
  temperature: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  folderId: string | null;
}
