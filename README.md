
# Chatbot UI

## Chatbot UI for llama.cpp server

### How to use

`step1` get the web

download from [release](https://github.com/yportne13/chatbot-ui-llama.cpp/releases) page and unzip it

or

clone this repository, and then:

```
npm install
npm run build
```

and you will get a `out/` dir.

`step2` get llama.cpp server

if you are windows user, go to https://github.com/ggerganov/llama.cpp/releases to download a server.

or if you are not windows user, go to https://github.com/ggerganov/llama.cpp, clone, and `make`.

`step3` run

for windows

```
 .\server.exe --model /PATH_TO_MODEL --path THE_OUT_DIR_YOU_JUST_BUILD
```

or else

```
 ./server --model /PATH_TO_MODEL --path THE_OUT_DIR_YOU_JUST_BUILD
```

and go to your browser: http://localhost:8080

### Config

change the language: in next-i18next.config.js, change defaultLocale

add more model: types/openai.ts
