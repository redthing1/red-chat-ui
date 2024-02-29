
# red-chatbot-ui

a [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui) fork for local models. a continuation of [this fork](https://github.com/yportne13/chatbot-ui-llama.cpp), which made it local-first.

# usage

## build the webui

in this respository:
```sh
npm install
npm run build
```

this will build a static webpage to `./out`.

## build [llama.cpp](https://github.com/ggerganov/llama.cpp)

in your llama.cpp directory:
```sh
make -j
```

## run the llama.cpp server with this frontend:

run llama.cpp server:
```sh
/path/to/llama.cpp/server --model /path/to/mistral-7b-openorca.Q4_0.gguf --path /path/to/red-chatbot-ui/out --port 8000
```

tips for llama.cpp server:
+ pass `-ngl <num_gpu_layers>` to put layers on the gpu
+ pass `-c <context_window> -n <context_window>` to set the context window
+ pass `--host <host>` or `--port <port>` to set the server endpoint
