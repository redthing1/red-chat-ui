import { IconClearAll, IconSettings } from '@tabler/icons-react';
import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { joinUrls } from '@/utils/app/url';
import { getSettings } from '@/utils/app/settings';
import { APP_CHAT_FONT } from '@/utils/app/fonts';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';
import { Plugin, PluginID, PluginType } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { TemperatureSlider } from './Temperature';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { OPENAI_API_COMPLETIONS_ENDPOINT } from '@/utils/app/const';
import { OpenAIModel } from '@/types/openai_models';
import { APP_BRAND_HERO } from '@/utils/app/brand';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

// function concatenateMessagesIntoPrompt(sys_prompt: string, prefix_prompt: string, post_prompt: string, messages: Message[]) {
//   let result = sys_prompt;
//   for (let i = 0; i < messages.length; i++) {
//     //if (i % 2 === 1) { // Skip even indexed messages
//     if (messages[i].role === 'assistant') {
//       result += `${messages[i].content}`;
//     } else {
//       result += `${prefix_prompt}${messages[i].content}${post_prompt}`;
//     }
//   }
//   // console.log('concatenated prompt:', result);
//   return result;
// }

function createPromptFromMessages(model: OpenAIModel, messages: Message[]) {
  let system = model.sysPrompt;
  let userPrefix = model.userPrefixPrompt;
  let userSuffix = model.userSuffixPrompt;
  let assistantPrefix = model.assistantPrefixPrompt ?? '';
  let assistantSuffix = model.assistantSuffixPrompt ?? '';
  // console.log('model:', model);
  // console.log('user prefix:', userPrefix);
  // console.log('user suffix:', userSuffix);
  // console.log('assistant prefix:', assistantPrefix);
  // console.log('assistant suffix:', assistantSuffix);

  // system prompt
  let chatLog = model.sysPrompt;

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === 'assistant') {
      // assistant message
      chatLog += `${assistantPrefix}${messages[i].content}${assistantSuffix}`;
    } else if (messages[i].role === 'user') {
      // user message
      chatLog += `${userPrefix}${messages[i].content}${userSuffix}`;
    }
  }
  let lastMessage = messages[messages.length - 1];

  // if the last message is from the user, add the assistant prefix
  if (lastMessage.role === 'user') {
    chatLog += assistantPrefix;
  }

  console.debug('prompt:', chatLog);

  return chatLog;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendImpl = async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
    if (!selectedConversation) return;
    let updatedConversation: Conversation;

    if (plugin) {
      message.pluginId = plugin.id;
    }

    if (deleteCount) {
      const updatedMessages = [...selectedConversation.messages];
      for (let i = 0; i < deleteCount; i++) {
        updatedMessages.pop();
      }
      updatedConversation = {
        ...selectedConversation,
        messages: [...updatedMessages, message],
      };
    } else {
      // add the user's message to the conversation
      updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, message],
      };
    }

    homeDispatch({
      field: 'selectedConversation',
      value: updatedConversation,
    });

    const isFreshConversation = updatedConversation.messages.length === 1;

    homeDispatch({ field: 'loading', value: true });
    const controller = new AbortController();

    const settings = getSettings();

    // define a function to cancel and fail in loading stage
    const cancelAndFailLoadingStage = (errorMessage: string) => {
      controller.abort();
      // delete the last message
      const updatedMessages = [...selectedConversation.messages];
      updatedMessages.pop();
      updatedConversation = {
        ...selectedConversation,
        messages: updatedMessages,
      };
      homeDispatch({
        field: 'selectedConversation',
        value: updatedConversation,
      });
      // stop loading
      homeDispatch({ field: 'loading', value: false });
      toast.error(errorMessage);
    };


    // const chatBody: ChatBody = {
    //   model: updatedConversation.model,
    //   messages: updatedConversation.messages,
    //   key: apiKey,
    //   prompt: updatedConversation.prompt,
    //   temperature: updatedConversation.temperature,
    // };

    // let requestBody;
    // if (!plugin) {
    //   requestBody = JSON.stringify(chatBody);
    // } else {
    //   console.log('plugin', plugin);
    //   requestBody = JSON.stringify({
    //     ...chatBody,
    //     googleAPIKey: pluginKeys
    //       .find((key) => key.pluginId === 'google-search')
    //       ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
    //     googleCSEId: pluginKeys
    //       .find((key) => key.pluginId === 'google-search')
    //       ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
    //   });
    // }
    // console.log('request body', requestBody);

    // if (endpointType == EndpointType.OpenAIChat) {

    // } else if (endpointType === EndpointType.GoogleSearch) {
    //   console.log('endpoint type is google search');
    // } else if (endpointType === EndpointType.WebBrowser) {
    //   console.log('endpoint type is web browser');
    // }

    console.log('conversation', updatedConversation);
    const currentModel = updatedConversation.model;
    console.log('model', currentModel);

    // apply prompt enhancer plugins
    if (plugin && plugin.type === PluginType.PROMPT_ENHANCER) {
      console.log('using prompt enhancer plugin', plugin);

      // ensure the most recent message is from the user
      if (updatedConversation.messages.length === 0 || updatedConversation.messages[updatedConversation.messages.length - 1].role !== 'user') {
        console.error('Invalid conversation state: most recent message is not from the user');
        cancelAndFailLoadingStage('Invalid conversation state');
        return;
      }

      // store the updated user message
      let updatedUserMessage: Message = {
        ...message,
        content: message.content,
        displayContent: message.displayContent,
      }

      // get the message the user just submitted
      let userMessageText = message.content;

      if (plugin.id == PluginID.CODEX_DOCS) {
        if (!settings.codexApiBaseUrl) {
          cancelAndFailLoadingStage('Codex endpoint is not set');
          return;
        }

        let codexEndpoint = joinUrls(settings.codexApiBaseUrl, '/v1/codex/query');

        const codexRequestData = {
          queryTerm: userMessageText,
          minScore: 0.65,
          maxResults: 4,
          responseType: 'chunk',
          maxChunkSize: 480,
        };
        const codexResponse = await fetch(codexEndpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(codexRequestData),
        });
        if (!codexResponse.ok) {
          cancelAndFailLoadingStage('Failed to query codex');
          console.error('Failed to query codex', codexResponse);
          return;
        }

        const codexData = await codexResponse.json();
        console.log('codex response:', codexData);

        let enhancedMessageText = userMessageText;
        if (codexData.results.length > 0) {
          let codexContextStr = '';
          for (let i = 0; i < codexData.results.length; i++) {
            let result = codexData.results[i];

            // codexContextStr += `[Context #${i + 1}]: `;
            codexContextStr += `[${i + 1}]: `;
            if (result.title) {
              codexContextStr += `${result.title}: `;
            }
            codexContextStr += `${result.content}`;
            codexContextStr += '\n';
          }

          console.log('added codex context:', codexContextStr);

          const codexContextInstructions = '[Instructions: The above are relevant excerpts from documents. You can use them to enhance your response to the query.]';

          const codexContextFull = `${codexContextStr}\n${codexContextInstructions}\n`;
          enhancedMessageText = `${codexContextFull}\n${userMessageText}`;
          updatedUserMessage.foldContent = codexContextFull;
          updatedUserMessage.displayContent = userMessageText;
          updatedUserMessage.content = enhancedMessageText;
        }
      }

      if (plugin.id == PluginID.CODEX_WEB) {
        if (!settings.codexApiBaseUrl) {
          cancelAndFailLoadingStage('Codex endpoint is not set');
          return;
        }

        let codexEndpoint = joinUrls(settings.codexApiBaseUrl, '/v1/codex/web');

        const codexRequestData = {
          queryTerm: userMessageText,
          maxResults: 4,
          responseType: 'chunk',
          maxChunkSize: 480,
        };
        const codexResponse = await fetch(codexEndpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(codexRequestData),
        });
        if (!codexResponse.ok) {
          cancelAndFailLoadingStage('Failed to query codex');
          console.error('Failed to query codex', codexResponse);
          return;
        }

        const codexData = await codexResponse.json();
        console.log('codex response:', codexData);

        let enhancedMessageText = userMessageText;
        if (codexData.results.length > 0) {
          let codexContextStr = '';

          // add main search results
          for (let i = 0; i < codexData.results.length; i++) {
            let result = codexData.results[i];

            codexContextStr += `[Web Result ${i + 1}]: `;
            if (result.title) {
              codexContextStr += `${result.title}: `;
            }
            codexContextStr += `${result.content}`;
            codexContextStr += '\n';
          }

          // add entity search results
          for (let entityName in codexData.entities) {
            let entityInfo = codexData.entities[entityName];

            codexContextStr += `[${entityName}]: `;
            if (entityInfo.content) {
              codexContextStr += `${entityInfo.content}`;
            }
          }

          console.log('added codex context:', codexContextStr);

          const codexContextInstructions = '[Instructions: The above are relevant web search results, and referenced entities. You should use them to enhance your response to the query.]';

          const codexContextFull = `${codexContextStr}\n${codexContextInstructions}\n`;
          enhancedMessageText = `${codexContextFull}\n${userMessageText}`;
          updatedUserMessage.foldContent = codexContextFull;
          updatedUserMessage.displayContent = userMessageText;
          updatedUserMessage.content = enhancedMessageText;
        }
      }

      updatedConversation.messages.pop();
      updatedConversation.messages.push(updatedUserMessage);
    }

    // create request for completions endpoint
    homeDispatch({ field: 'messageIsStreaming', value: true });
    const completionsRequestData = {
      prompt: createPromptFromMessages(
        currentModel,
        updatedConversation.messages
      ),
      temperature: updatedConversation.temperature,
      stream: true,
    };

    const completionsUrl = joinUrls(settings.chatApiBaseUrl, OPENAI_API_COMPLETIONS_ENDPOINT);
    console.log(`completions url: ${completionsUrl}`);
    // console.log(updatedConversation.temperature);
    const response = await fetch(completionsUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(completionsRequestData),
    });
    if (!response.ok) {
      homeDispatch({ field: 'loading', value: false });
      homeDispatch({ field: 'messageIsStreaming', value: false });
      toast.error(response.statusText);
      return;
    }
    const data = response.body;
    if (!data) {
      homeDispatch({ field: 'loading', value: false });
      homeDispatch({ field: 'messageIsStreaming', value: false });
      return;
    }

    // if (!plugin) {

    // } else {
    //   console.log('handling response for plugin', plugin, response);
    //   const { answer } = await response.json();
    //   const updatedMessages: Message[] = [
    //     ...updatedConversation.messages,
    //     { role: 'assistant', content: answer },
    //   ];
    //   updatedConversation = {
    //     ...updatedConversation,
    //     messages: updatedMessages,
    //   };
    //   homeDispatch({
    //     field: 'selectedConversation',
    //     value: updateConversation,
    //   });
    //   saveConversation(updatedConversation);
    //   const updatedConversations: Conversation[] = conversations.map(
    //     (conversation) => {
    //       if (conversation.id === selectedConversation.id) {
    //         return updatedConversation;
    //       }
    //       return conversation;
    //     },
    //   );
    //   if (updatedConversations.length === 0) {
    //     updatedConversations.push(updatedConversation);
    //   }
    //   homeDispatch({ field: 'conversations', value: updatedConversations });
    //   saveConversations(updatedConversations);
    //   homeDispatch({ field: 'loading', value: false });
    //   homeDispatch({ field: 'messageIsStreaming', value: false });
    // }

    // if this is the first message, update the conversation name
    if (isFreshConversation) {
      // set conversation name to be the beginning of the user's request
      const { displayContent: messageVisibleContent } = message;
      const customName =
        messageVisibleContent.length > 30 ? messageVisibleContent.substring(0, 30) + '...' : messageVisibleContent;
      console.log('is fresh conversation, setting name:', customName);
      updatedConversation = {
        ...updatedConversation,
        name: customName,
      };
    }

    // no longer loading, we are now going to stream the response
    homeDispatch({ field: 'loading', value: false });
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let streamingDone = false;
    let isFirstChunk = true;
    let textSoFar = '';

    // stream the response text
    while (!streamingDone) {
      // handle the stop conversation signal
      if (stopConversationRef.current === true) {
        controller.abort();
        streamingDone = true;
        break;
      }

      // read the next chunk of the streaming completion
      const { value: rawChunk, done: isLastChunk } = await reader.read();
      streamingDone = isLastChunk;
      const decodedChunk = decoder.decode(rawChunk);
      // console.log('raw chunk:', rawChunk);
      // console.log('decoded chunk:', decodedChunk);
      let chunkJson;
      try {
        // skip "data: ", the json is after it
        chunkJson = JSON.parse(decodedChunk.slice(6));
      } catch (e) {
        chunkJson = { stop: true, content: '' }
      }
      // console.log('json chunk:', json);
      const chunkValue = chunkJson.content;
      streamingDone = chunkJson.stop;
      textSoFar += chunkValue;
      if (isFirstChunk) {
        // if it's the first chunk
        isFirstChunk = false;

        // add a new message with the assistant role
        const updatedMessages: Message[] = [
          ...updatedConversation.messages,
          { role: 'assistant', displayContent: chunkValue, content: chunkValue },
        ];
        updatedConversation = {
          ...updatedConversation,
          messages: updatedMessages,
        };
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
      } else {
        // if this is the last chunk, strip any junk from the end
        if (streamingDone) {
          let cleanedText = textSoFar;
          // extra newlines at the end
          cleanedText = cleanedText.replace(/\n+$/, '');
          // any kind of <|...|> token at the end
          cleanedText = cleanedText.replace(/<\|.*?\|>$/, '');

          if (cleanedText !== textSoFar) {
            // get the diff (get the part that was stripped off the end)
            let strippedText = textSoFar.slice(cleanedText.length);
            console.log('cleaned response, removed:', strippedText);
            // console.log('original text:', textSoFar);
            // console.log('cleaned text:', cleanedText);
            textSoFar = cleanedText;
          }
        }

        // update the most recent message
        const updatedMessages: Message[] =
          updatedConversation.messages.map((message, index) => {
            if (index === updatedConversation.messages.length - 1) {
              // update the content of the most recent message
              return {
                ...message,
                content: textSoFar,
                displayContent: textSoFar,
              };
            }
            return message;
          });
        updatedConversation = {
          ...updatedConversation,
          messages: updatedMessages,
        };
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
      }
    }

    // if this is the first message, set the conversation name
    if (isFreshConversation && settings.autoTitleConversations) {
      // summarize the above exchange
      let summarizeExchangePrompt = 'Give a few word very short title of the above conversation. Do not mention conversation.';

      let messagesForSummarize: Message[] = [
        ...updatedConversation.messages,
        { role: 'user', content: summarizeExchangePrompt, displayContent: summarizeExchangePrompt }
      ];

      const completionRequestData = {
        prompt: createPromptFromMessages(
          currentModel,
          messagesForSummarize
        ),
        temperature: 0.6,
        n_predict: 32,
      };

      const summarizeResponse = await fetch(completionsUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(completionRequestData),
      });
      if (!summarizeResponse.ok) {
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });
        console.error('Failed to summarize conversation', summarizeResponse);
        toast.error('Failed to summarize conversation');
        return;
      }
      const summarizeData = await summarizeResponse.json();
      // clean up the title
      let summarizeContent = summarizeData.content.trim();
      // remove anything like "Summary: " or "Title: " at the beginning
      summarizeContent = summarizeContent.replace(/^[A-Z].+?: ?/, '');
      // remove any newlines
      summarizeContent = summarizeContent.replace(/\n/g, ' ');
      // remove any <|...|> tokens
      summarizeContent = summarizeContent.replace(/<\|.+\|>/g, '');
      // remove any quotes
      summarizeContent = summarizeContent.replace(/['"`]/g, '');
      // remove any trailing punctuation
      summarizeContent = summarizeContent.replace(/[.,;:!?]$/, '');
      // final trim
      summarizeContent = summarizeContent.trim();

      console.log('proposed title:', summarizeContent);

      const customName = summarizeContent.length > 30 ? summarizeContent.substring(0, 30) + '...' : summarizeContent;
      updatedConversation = {
        ...updatedConversation,
        name: customName,
      };
      homeDispatch({
        field: 'selectedConversation',
        value: updatedConversation,
      });
    }

    // save the conversation
    saveConversation(updatedConversation);
    const updatedConversations: Conversation[] = conversations.map(
      (conversation) => {
        if (conversation.id === selectedConversation.id) {
          return updatedConversation;
        }
        return conversation;
      },
    );

    // if the conversation is not in the list, add it
    if (updatedConversations.length === 0) {
      updatedConversations.push(updatedConversation);
    }

    // save the conversations
    homeDispatch({ field: 'conversations', value: updatedConversations });
    saveConversations(updatedConversations);

    // done streaming
    homeDispatch({ field: 'messageIsStreaming', value: false });
  };

  const handleSend = useCallback(
    handleSendImpl,
    [
      conversations,
      selectedConversation,
      stopConversationRef,
      homeDispatch,
      // apiKey,
      // pluginKeys,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  // useEffect(() => {
  //   console.log('currentMessage', currentMessage);
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <div className={`chat-ui-root relative flex-1 overflow-hidden bg-white dark:bg-[#191918]`}>
      {!(apiKey || serverSideApiKeyIsSet) ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-black dark:text-white">
            Welcome to Chatbot UI
          </div>
          <div className="text-center text-lg text-black dark:text-white">
            <div className="mb-8">{`Chatbot UI is an open source clone of OpenAI's ChatGPT UI.`}</div>
            <div className="mb-2 font-bold">
              Important: Chatbot UI is 100% unaffiliated with OpenAI.
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              Chatbot UI allows you to plug in your API key to use this UI with
              their API.
            </div>
            <div className="mb-2">
              It is <span className="italic">only</span> used to communicate
              with their API.
            </div>
            <div className="mb-2">
              {t(
                'Please set your OpenAI API key in the bottom left of the sidebar.',
              )}
            </div>
            <div>
              {t("If you don't have an OpenAI API key, you can get one here: ")}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                openai.com
              </a>
            </div>
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages.length === 0 ? (
              <>
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                  <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    {models.length === 0 ? (
                      <div>
                        <Spinner size="16px" className="mx-auto" />
                      </div>
                    ) : (
                      APP_BRAND_HERO
                    )}
                  </div>

                  {models.length > 0 && (
                    <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                      <ModelSelect />

                      <SystemPrompt
                        conversation={selectedConversation}
                        prompts={prompts}
                        onChangePrompt={(prompt) =>
                          handleUpdateConversation(selectedConversation, {
                            key: 'prompt',
                            value: prompt,
                          })
                        }
                      />

                      <TemperatureSlider
                        label={t('Temperature')}
                        onChangeTemperature={(temperature) =>
                          handleUpdateConversation(selectedConversation, {
                            key: 'temperature',
                            value: temperature,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 mb-6 text-sm text-neutral-500 dark:border-none dark:bg-[#1b1e1f] dark:text-neutral-200">
                  {selectedConversation?.model.name}
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button>
                </div>
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )}

                {selectedConversation?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedConversation?.messages.length - index,
                      );
                    }}
                  />
                ))}

                {loading && <ChatLoader />}

                <div
                  className="h-[162px] bg-white dark:bg-[#191918]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message, plugin) => {
              setCurrentMessage(message);
              handleSend(message, 0, plugin);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2, null);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
