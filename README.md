# AgentMarketplace

> AppStore for **Skills**, **Agents**, and **MCP-supported apps**.
>
> 让开发者上传与发布、用户发现与评价；优秀作品的作者可以发射代表 agent 的 token，用户用持有表达"我看好这个 agent"。

---

## 这是什么

AgentMarketplace 收录三类作品（统称 **package**）：

| 类型 | 内容形态 | 安装产物 |
|------|---------|---------|
| **Skill** | Claude Code Skill 格式（带 frontmatter 的 `.md`） | `~/.claude/skills/{name}/skill.md` |
| **Agent** | system prompt + tools + 模型配置（manifest） | 可粘贴的 agent 配置块 |
| **MCP App** | mcp.json 片段 / npm 包 / git repo（一个 MCP server 或基于 MCP 的应用） | `mcp.json` 片段或 install 命令 |

围绕这三类提供：

- **目录与发现**：分类、搜索、排行榜、标签
- **评价系统**：评分（1-5 星）+ 评论；评分需要安装凭证防刷
- **Token 系统**（v0.2 起，testnet）：每个 package 可发射独立 ERC-20，作为持有者权益凭证（更新通知、空投权重、治理投票），**不做撮合 / 不做行情 / 不做 launchpad**

---

## 文档导航

| 文档 | 内容 |
|------|------|
| [00 总览](docs/00-overview.md) | 项目愿景、核心循环、目标用户 |
| [01 架构](docs/01-architecture.md) | 系统架构、模块划分、技术栈 |
| [02 数据模型](docs/02-data-model.md) | DB schema |
| [03 API 规格](docs/03-api-spec.md) | REST API 表 |
| [04 Package 格式](docs/04-package-format.md) | Skill / Agent / MCP App 三类 manifest 规范 |
| [05 Token 设计](docs/05-token-design.md) | Token 系统设计与权益绑定 |
| [06 前端方案](docs/06-frontend.md) | Next.js + 钱包 + 关键页面 |
| [07 部署](docs/07-deployment.md) | systemd + nginx 单机部署 |
| [08 路线图](docs/08-roadmap.md) | v0.1 → v1.0 |
| [09 定时任务](docs/09-scheduled-jobs.md) | systemd timer + arq cron 任务清单 |
| [v0.1 Spec](docs/v0.1-spec.md) | v0.1 详细规格（B1-B6） |

---

## 状态

- 阶段：**方案文档（pre-v0.1）+ 设计稿原型已上线**
- 当前产物：完整一版项目方案 + Claude Design 出品的前端原型已部署
- **设计稿在线地址**：<https://www.ai100trading.cn/agentmarketplace/>
- 下一步：按 [v0.1-spec.md](docs/v0.1-spec.md) 的 B1 开始建仓库骨架

---

## 设计原则

1. **三类 package 用统一 manifest 抽象**，避免上来就分三套数据模型
2. **Token v0.2 才上**，先把 marketplace 价值跑通
3. **Sepolia testnet 起步**，主网决策放到 v1.0
4. **不做 bonding curve / 撮合 / 行情 / launchpad UI**，token 是权益凭证不是投机工具
5. **评分需要安装凭证**，反水军
6. **不上 Docker**，systemd + nginx 单机起步
7. **SQLite v0.1，Postgres v0.5+**，不过早优化

---

## License

MIT（待定）。
