# TechLex

面向技术学习者的英语术语结构化学习工具。

## 这是什么

TechLex 帮助开发者和技术学习者把"阅读英文技术文档"和"学习专业英语"合并成同一个动作。粘贴一段英文技术文档、API说明或博客片段,系统会自动提取专业术语,生成"定义 + 例句 + 应用场景"的结构化卡片,并通过交互式问答帮你巩固记忆。

## 解决什么问题

很多非英语母语的开发者能看懂英文文档,但自己写代码注释、commit message、技术文章时,表达不够地道,词汇停留在"认识但不会用"的阶段。市面上的语言学习App大多聚焦日常场景词汇,对这类专业、垂直的英语表达需求覆盖不足。TechLex 专注于这个细分场景。

## 功能

- **术语提取**:粘贴英文技术文本,自动识别其中的专业术语和高频表达
- **卡片生成**:为每个术语生成定义、例句和应用场景说明
- **交互式复习**:基于简单的间隔重复机制,优先复习你容易出错的术语

## 技术栈

- 前端:React + Vite + Tailwind CSS
- AI能力:Claude API(用于术语提取与卡片生成)
- 数据存储:浏览器本地存储(localStorage),无需后端和数据库

## 快速开始

### 在线使用

访问 [在线demo链接占位] ,在设置中填入你自己的 Claude API key 即可使用。

### 本地运行

```bash
git clone https://github.com/你的用户名/techlex.git
cd techlex
npm install
cp .env.example .env
# 编辑 .env,填入你自己的 CLAUDE_API_KEY
npm run dev
```

## 关于 API Key

TechLex 不内置任何 API key,也不会代为承担调用费用。你需要使用自己的 Claude API key,key 仅保存在你本地的环境变量或浏览器本地存储中,不会上传到任何服务器。获取 API key 请前往 [Anthropic Console](https://console.anthropic.com)。

## 项目结构

```
techlex/
├── docs/          # 设计文档与开发计划
├── devlog/        # 开发日志,记录每一步的思路与问题
├── prompts/       # 术语提取与卡片生成所用的 Prompt 模板
└── src/           # 前端源码
```

详见 [docs/design.md](docs/design.md)。

## Roadmap

- [ ] 支持从文件/URL导入文本
- [ ] 英文技术写作辅助(中文描述生成地道英文表达)
- [ ] 导出为 Anki 等格式

日常场景英语词汇暂不在本项目范围内,聚焦专业与技术英语。

## 项目背景

这是作者在学习 Agent 开发过程中,为解决自己"阅读英文技术文档时积累专业词汇"这一真实需求而做的小项目,同时作为练习 Agent/Prompt 设计能力的练兵场。开发过程记录见 [devlog](devlog/)。

## License

MIT
