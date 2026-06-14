# TechLex 初学者开发指南

这份文档解释 TechLex 的结构、数据流和继续开发时应遵守的顺序。项目当前已经完成可运行 MVP；初学者可以从现有代码反向理解每一层。

## 1. 应用如何工作

```text
浏览器输入文本
  → src/services 请求 /api
  → Vercel Function 调用 DeepSeek
  → 前端校验术语和卡片
  → localStorage 保存 Card[]
  → React 重新显示卡片
  → 复习结果更新权重并再次保存
```

## 2. 五个主要层次

| 层 | 负责什么 | 对应位置 |
|---|---|---|
| 页面层 | 用户看到什么、点击什么 | `src/components/` |
| 状态协调层 | 当前卡片、模式和加载状态 | `src/App.jsx` |
| 前端服务层 | 请求自己的 API 并校验业务结果 | `src/services/` |
| 数据与逻辑层 | localStorage、答案判断和复习权重 | `src/storage/`、`src/logic/` |
| 服务端层 | 保护密钥、调用 DeepSeek、处理供应商错误 | `api/`、`server/` |

每个文件只解决一种问题。组件不直接调用 DeepSeek，也不直接拼接 localStorage 数据。

## 3. 根目录为什么需要这些文件

- `index.html`：浏览器先加载它，React 最终挂载到 `#root`。
- `package.json`：记录依赖、Node 版本和 `dev/build/test` 命令。
- `package-lock.json`：锁定依赖版本，保证不同电脑安装结果一致。
- `vite.config.js`：启用 React、Tailwind 和 Vitest。
- `.env.example`：告诉开发者需要哪些变量，但不能包含真实密钥。
- `.gitignore`：阻止 `.env`、`node_modules`、`dist` 等进入 Git。
- `README.md`：项目首页和经过验证的运行说明。
- `LICENSE`：说明代码使用许可。

## 4. src 文件职责

- `main.jsx`：导入全局 CSS，将 `App` 渲染到页面。
- `App.jsx`：协调生成、保存、删除和复习，不包含底层请求细节。
- `Layout.jsx`：网站框架和卡片库/复习模式导航。
- `InputPanel.jsx`：文本输入、长度、空值和提交状态。
- `CardList.jsx`：遍历卡片和显示空状态。
- `CardItem.jsx`：显示一张卡片及其统计。
- `QuizMode.jsx`：答案输入、结果反馈和下一题。
- `apiClient.js`：统一 POST 请求、超时、网络错误和模拟模式。
- `termExtractor.js`：校验术语列表、去重并限制最多 8 项。
- `cardGenerator.js`：校验模型字段并补充 Card 本地字段。
- `localStore.js`：读取、保存、新增、更新和删除卡片。
- `spacedRepetition.js`：纯函数形式的答案标准化、权重更新和抽题。

## 5. api 与 server 文件职责

- `api/extract-terms.js`：接收 `{ text }`，返回 `{ terms }`。
- `api/generate-card.js`：接收 `{ term, context_sentence }`，返回卡片内容。
- `api/_response.js`：统一成功和错误 JSON 响应。
- `server/deepseekClient.js`：调用 DeepSeek，处理超时和状态码。
- `server/promptTemplates.js`：运行时 Prompt，需与 `prompts/` 文档同步。

`DEEPSEEK_API_KEY` 只在服务端读取。任何 `VITE_*` 变量都会进入浏览器，因此不能用于保存秘密。

## 6. 推荐学习顺序

1. 运行 `npm run dev`，修改 `App.jsx` 中一段文案，观察热更新。
2. 阅读 `CardItem.jsx`，理解 props 如何把 Card 传给组件。
3. 阅读 `App.jsx`，跟踪 `cards` state 如何流向 `CardList`。
4. 阅读 `localStore.test.js`，再阅读对应实现。
5. 阅读 `spacedRepetition.test.js`，理解纯函数为什么容易测试。
6. 在 `.env` 使用 `VITE_USE_MOCK_API=true`，走一次完整模拟流程。
7. 最后阅读 `api/` 和 `server/`，理解浏览器为什么不能保存 API Key。

## 7. 固定开发步骤

每次只做一个可验证的小目标：

1. 用一句话写清目标。
2. 判断它属于组件、服务、存储、逻辑还是服务端。
3. 先写成功路径。
4. 补空输入、错误和边界情况。
5. 添加或更新自动测试。
6. 运行 `npm test` 和 `npm run build`。
7. 浏览器手工验证。
8. 更新 Roadmap 和对应 devlog。

## 8. 本地命令

```bash
npm install
cp .env.example .env
npm run dev
npm test
npm run build
```

模拟模式只需要 Vite。真实 DeepSeek 调用需要 `npm run dev:full`，并在服务端配置 `DEEPSEEK_API_KEY`。
