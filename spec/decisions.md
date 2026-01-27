# AuraBookmarks Decisions（决策记录）

> 目的：记录会影响实现路径的关键决策，避免实现漂移。

## 2026-01-27：v1 存储策略

- 结论：v1 **只实现 LocalStorage** 持久化（无 D1/SQLite 双实现）。
- 理由：
  - 当前仓库目标是“单前端项目”，优先把核心交互、导入导出、数据模型跑通。
  - D1/SQLite 需要额外的部署与迁移策略，适合作为 v2/增强路径。

## 2026-01-27：v1 元信息抓取策略

- 结论：v1 在前端提供 **best-effort** 的 `fetchMetadata(url)`：
  - 对允许 CORS 的站点可直接抓取并解析 `<head>`（og / icon）。
  - 对被 CORS 阻挡的站点：提示用户失败原因，并允许手动填写/上传封面与图标。
- 理由：
  - 静态前端直接抓取远端 HTML 受浏览器 CORS 限制，无法保证所有站点可用。
  - 服务端抓取涉及 SSRF 防护与部署形态，后续可按 `spec/02-design.md#7` 增强。

## 2026-01-27：任务 ID 兼容

- `spec/03-tasks.md` 与 `spec/02-design.md` 中出现的 `T-DECISIONS-02`（DB schema 相关）在当前任务列表中缺失。
- 处理方式：v1 走 LocalStorage only，因此不阻塞；后续若引入 D1/SQLite，再补充对应决策与任务条目。

