# Day 4：本地卡片库

## 实际完成

- 使用 `techlex.cards.v1` 保存 Card 数组。
- 实现读取、保存、新增、更新和删除。
- 使用 `term + sourceSentence` 去重。
- 损坏 JSON 和写入失败会转成可显示错误，不导致页面白屏。

## 测试

覆盖空存储、新增去重、更新、删除和损坏 JSON。

## 本日产出

- `src/storage/localStore.js`
- `src/storage/localStore.test.js`
