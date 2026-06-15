# Day 2：DeepSeek 术语提取

## 实际完成

- 将 AI 提供商统一为 DeepSeek。
- 新增 `POST /api/extract-terms`。
- 使用服务端环境变量保护 API Key。
- 启用 JSON Output，并校验、去重、限制最多 8 个术语。
- 映射认证、余额、限流、服务错误和超时。

## 关键决策

前端不直接调用 DeepSeek。这样 API Key 不会出现在浏览器构建中，也便于统一处理供应商错误。

## 本日产出

- `api/extract-terms.js`
- `server/deepseekClient.js`
- `server/promptTemplates.js`
- `src/services/apiClient.js`
- `src/services/termExtractor.js`
