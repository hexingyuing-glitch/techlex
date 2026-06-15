# Day 3：卡片生成与展示

## 实际完成

- 新增 `POST /api/generate-card`。
- 按顺序为术语生成卡片，保留部分成功结果。
- 完成中英双语卡片列表、单卡展示、空状态和删除操作。
- 本地程序补充 ID、创建时间和复习初始值。

## 关键决策

模型只生成内容字段，不控制本地状态。逐项生成比无限并发更适合第一版，也更容易定位失败术语。

卡片内容包含中文术语、英文定义/中文解释、英文例句/中文译文和双语应用场景。

## 本日产出

- `api/generate-card.js`
- `src/services/cardGenerator.js`
- `src/components/CardList.jsx`
- `src/components/CardItem.jsx`
