# TechLex

面向技术学习者的英语术语结构化学习工具。

TechLex 把“阅读英文技术文档”和“积累专业英语”合并成一个动作：粘贴 README、API 文档或技术文章片段，应用会通过 DeepSeek 提取关键表达、生成结构化卡片，并用简单的加权复习机制帮助你巩固记忆。

## 当前功能

- 从英文技术文本中提取最多 8 个专业术语或固定表达
- 为每个术语生成定义、例句和应用场景
- 使用 localStorage 保存、读取和删除卡片
- 通过“看定义猜术语”进行复习
- 答错提高复习权重，答对降低复习权重
- 支持无 API 费用的本地模拟模式
- 通过 Vercel Functions 安全调用 DeepSeek，密钥不进入浏览器

## 技术栈

- React + Vite + Tailwind CSS
- DeepSeek JSON Output API
- Vercel Functions
- localStorage
- Vitest + React Testing Library

## 本地运行

要求 Node.js 24 或更高版本。

```bash
git clone https://github.com/你的用户名/techlex.git
cd techlex
npm install
cp .env.example .env
npm run dev
```

`npm run dev` 会固定启用模拟 API，因此不会发送真实请求：

```env
VITE_USE_MOCK_API=true
```

此模式不发送真实请求，适合开发 UI、存储和复习流程。

## 使用真实 DeepSeek API

真实密钥只能放在服务端变量中，不能使用 `VITE_` 前缀。`npm run dev:full` 会固定关闭模拟模式：

```env
VITE_USE_MOCK_API=false
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

首次运行时 `npx` 会按需下载 Vercel CLI。登录后运行完整前后端：

```bash
npm run dev:full
```

部署时在 Vercel 项目设置中配置 `DEEPSEEK_API_KEY`。不要把真实 `.env` 提交到 Git。

## 常用命令

```bash
npm run dev       # Vite 前端开发服务器
npm run dev:full  # Vercel 前端 + Functions
npm test          # 自动测试
npm run build     # 生产构建
npm run preview   # 预览生产构建
```

## 项目结构

```text
api/        Vercel 服务端接口
server/     DeepSeek 客户端和运行时 Prompt
src/        React 页面、服务、存储与复习逻辑
prompts/    Prompt 设计和迭代记录
docs/       架构、路线图与初学者指南
devlog/     开发过程记录
```

第一次开发完整项目，请先阅读 [初学者开发指南](docs/development-guide.md)。核心架构取舍见 [设计思路](docs/design.md)，后续计划见 [Roadmap](docs/roadmap.md)。

## 数据与隐私

卡片保存在当前浏览器的 `techlex.cards.v1` localStorage 中。清理浏览器数据、切换浏览器或设备后不会自动同步。用户粘贴的文本会在真实 API 模式下发送给 DeepSeek 处理。

## License

MIT
