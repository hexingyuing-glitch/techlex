#!/bin/zsh

cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "未找到 Node.js。请先安装 Node.js 24，然后重新双击此文件。"
  echo "下载地址：https://nodejs.org/"
  read -k 1 "?按任意键关闭..."
  exit 1
fi

if curl -fsS http://127.0.0.1:5173/ >/dev/null 2>&1; then
  open http://127.0.0.1:5173/
  echo "TechLex 已经在运行，已为你打开浏览器。"
  exit 0
fi

if [[ ! -d node_modules ]]; then
  echo "首次启动，正在安装项目依赖..."
  npm install || {
    echo "依赖安装失败，请检查网络后重试。"
    read -k 1 "?按任意键关闭..."
    exit 1
  }
fi

clear
echo "========================================"
echo "            TechLex 启动器"
echo "========================================"
echo "1. 动态演示模式（免费，不调用 DeepSeek）"
echo "2. 真实 DeepSeek 模式（需要 .env 中的 API Key）"
echo ""
read "choice?请选择模式 [1/2，默认 1]："

if [[ "$choice" == "2" ]]; then
  echo "正在启动真实 DeepSeek 模式..."
  npm run dev:real &
else
  echo "正在启动动态演示模式..."
  npm run dev &
fi

server_pid=$!
trap 'kill $server_pid 2>/dev/null' EXIT INT TERM

for attempt in {1..30}; do
  if curl -fsS http://127.0.0.1:5173/ >/dev/null 2>&1; then
    open http://127.0.0.1:5173/
    echo ""
    echo "TechLex 已打开：http://127.0.0.1:5173/"
    echo "保持此终端窗口运行。按 Control+C 可停止应用。"
    wait $server_pid
    exit $?
  fi
  sleep 0.2
done

echo "启动失败，请查看上方错误信息。"
kill $server_pid 2>/dev/null
read -k 1 "?按任意键关闭..."
exit 1
