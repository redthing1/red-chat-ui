import { OPENAI_API_TYPE, OPENAI_API_HOST } from '../utils/app/const';

export interface OpenAIModel {
  // url: string;
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
  sysPrompt: string;
  defaultPersonality?: string;
  userPrefixPrompt: string;
  userSuffixPrompt: string;
  assistantPrefixPrompt?: string;
  assistantSuffixPrompt?: string;
}

export enum OpenAIModelID {
  GenericChatML = 'ChatML',
  Dolphin = 'Dolphin',
  Mistral = 'Mistral-Instruct',
  Llama3Chat = 'Llama3-Chat',
  Llama2Chat = 'Llama2-Chat',
  Gemma = 'Gemma',
  Miqu = 'Miqu',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
// export const fallbackModelID = OpenAIModelID.Mistral;
export const FALLBACK_OPENAI_MODEL_ID = OpenAIModelID.GenericChatML;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GenericChatML]: {
    id: OpenAIModelID.GenericChatML,
    name: 'ChatML',
    sysPrompt: '<|im_start|>system\n$PERSONALITY<|im_end|>\n',
    defaultPersonality: 'You are a helpful and intelligent AI assistant.',
    userPrefixPrompt: '<|im_start|>user\n',
    userSuffixPrompt: '<|im_end|>\n',
    assistantPrefixPrompt: '<|im_start|>assistant\n',
    assistantSuffixPrompt: '<|im_end|>\n',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
  [OpenAIModelID.Dolphin]: {
    id: OpenAIModelID.Dolphin,
    name: 'Dolphin',
    sysPrompt: '<|im_start|>system\n$PERSONALITY<|im_end|>\n',
    defaultPersonality: 'You are Dolphin, a helpful AI assistant.',
    userPrefixPrompt: '<|im_start|>user\n',
    userSuffixPrompt: '<|im_end|>\n',
    assistantPrefixPrompt: '<|im_start|>assistant\n',
    assistantSuffixPrompt: '<|im_end|>\n',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
  [OpenAIModelID.Mistral]: {
    id: OpenAIModelID.Mistral,
    name: 'Mistral-Instruct',
    sysPrompt: '<s>',
    userPrefixPrompt: '[INST]',
    userSuffixPrompt: ' [/INST]',
    assistantPrefixPrompt: '',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
  [OpenAIModelID.Llama2Chat]: {
    // https://old.reddit.com/r/LocalLLaMA/comments/155po2p/get_llama_2_prompt_format_right/
    id: OpenAIModelID.Llama2Chat,
    name: 'Llama 2',
    sysPrompt: '<s>[INST] <<SYS>>\n$PERSONALITY\n<</SYS>>\n\n',
    defaultPersonality: 'You are a helpful and intelligent AI assistant who always answers the user\'s questions. You are designed to assist the user in any way you can.',
    userPrefixPrompt: '',
    userSuffixPrompt: ' [/INST] ',
    assistantPrefixPrompt: '',
    assistantSuffixPrompt: '</s><s>[INST] ',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
  // https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct/blob/main/tokenizer_config.json#L2053
  // {% set loop_messages = messages %}
  // {% for message in loop_messages %}
  //     {% set content = '<|start_header_id|>' + message['role'] + '<|end_header_id|>\n\n'+ message['content'] | trim + '<|eot_id|>' %}
  //     {% if loop.index0 == 0 %}
  //         {% set content = bos_token + content %}
  //     {% endif %}
  //     {{ content }}
  // {% endfor %}
  // {{ '<|start_header_id|>assistant<|end_header_id|>\n\n' }}
  [OpenAIModelID.Llama3Chat]: {
    id: OpenAIModelID.Llama3Chat,
    name: 'Llama 3',
    sysPrompt: '<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n$PERSONALITY<|eot_id|>',
    defaultPersonality: 'You are a helpful and intelligent AI assistant.',
    userPrefixPrompt: '<|start_header_id|>user<|end_header_id|>\n\n',
    userSuffixPrompt: '<|eot_id|>\n',
    assistantPrefixPrompt: '<|start_header_id|>assistant<|end_header_id|>\n\n',
    assistantSuffixPrompt: '<|eot_id|>\n',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
  // <start_of_turn>user\nYou are a helpful assistant\n\nHello<end_of_turn>\n<start_of_turn>model\nHi there<end_of_turn>\n<start_of_turn>user\nHow are you?<end_of_turn>\n<start_of_turn>model\n
  [OpenAIModelID.Gemma]: {
    id: OpenAIModelID.Gemma,
    name: 'Gemma',
    sysPrompt: '<start_of_turn>user\n$PERSONALITY\n\n',
    defaultPersonality: 'You are a helpful assistant.',
    userPrefixPrompt: '<start_of_turn>user\n',
    userSuffixPrompt: '<end_of_turn>\n',
    assistantPrefixPrompt: '<start_of_turn>model\n',
    assistantSuffixPrompt: '<end_of_turn>\n',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
  [OpenAIModelID.Miqu]: {
    // https://old.reddit.com/r/LocalLLaMA/comments/1b1gxmq/the_definite_correct_miqu_prompt/
    // [INST] {System}[/INST][INST] {User}[/INST] {Assistant}
    id: OpenAIModelID.Miqu,
    name: 'Miqu',
    sysPrompt: '[INST] $PERSONALITY[/INST]',
    defaultPersonality: 'You are Miqu, a helpful and intelligent AI assistant.',
    userPrefixPrompt: '[INST] ',
    userSuffixPrompt: ' [/INST] ',
    assistantPrefixPrompt: '',
    assistantSuffixPrompt: '\n',
    maxLength: 10000000,
    tokenLimit: 10000000,
  },
};
