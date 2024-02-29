export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const SYSPROMPT = process.env.SYSPROMPT || "";

export const PREFIXPROMPT = process.env.PREFIXPROMPT || "";

export const POSTPROMPT = process.env.POSTPROMPT || "";

// export const OPENAI_API_HOST =
//   process.env.OPENAI_API_HOST || 'https://api.openai.com';
let custom_openai_api_host = process.env.OPENAI_API_HOST;
if (typeof window !== 'undefined') {
  // in browser, use local storage instead of environment variables
  let localstorage_openai_api_host = localStorage.getItem('OPENAI_API_HOST');
  if (localstorage_openai_api_host) {
    console.log(`Using OPENAI_API_HOST from local storage: ${localstorage_openai_api_host}`);
    custom_openai_api_host = localstorage_openai_api_host;
  }
}
// default to relative path, which will use the same host that serves the frontend
export const OPENAI_API_HOST = custom_openai_api_host || '/';
console.log(`OPENAI_API_HOST: ${OPENAI_API_HOST}`);

export const DEFAULT_TEMPERATURE = 
  parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

export const OPENAI_API_TYPE =
  process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID =
  process.env.AZURE_DEPLOYMENT_ID || '';
