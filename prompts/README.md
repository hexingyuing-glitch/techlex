# Prompts 目录说明

这个目录记录 TechLex 的 Prompt 资产。真实调用由 `server/promptTemplates.js` 提供运行时模板；两处的目标、字段和约束必须保持同步。

| 文件 | 用途 | 服务端入口 |
|---|---|---|
| `extract-terms.md` | 技术文本 → 术语数组 | `api/extract-terms.js` |
| `generate-card.md` | 术语与原句 → 卡片内容 | `api/generate-card.js` |

## 设计原则

1. Prompt 与 React 组件分离。
2. 使用 DeepSeek JSON Output，并在程序中继续校验中英双语字段。
3. 原文被视为不可信数据，不能覆盖系统指令。
4. 单次最多提取 8 个术语，卡片顺序生成。
5. `id`、时间和复习字段由程序确定。
6. 每次修改 Prompt 都记录原因，并用固定样本回归。

## 修改步骤

1. 明确失败样本和成功标准。
2. 更新对应 Markdown 的“当前版本 Prompt”。
3. 同步修改 `server/promptTemplates.js`。
4. 如果字段变化，同步修改 API、前端校验和测试。
5. 运行 `npm test` 和一次真实 DeepSeek 请求。
