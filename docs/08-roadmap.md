# 08 — 路线图

## 视角

| 版本 | 周期 | 核心价值 | 状态 |
|------|------|---------|------|
| **v0.1** | 4-6 周 | 三类 package 的 marketplace（无 token） | 待启动 |
| **v0.2** | 4-6 周 | Token 系统（testnet）：发射 / 空投 / 持有者 | |
| **v0.3** | 4-6 周 | 治理（投票）+ 推荐算法 + 数据看板 | |
| **v0.5** | 4-6 周 | 工程化（SQLite → Postgres、worker 拆机、CDN） | |
| **v1.0** | -    | GA 决策点：主网与商业化 | |

---

## v0.1 — Marketplace 核心（4-6 周）

**目标**：让一个开发者能上传 skill / agent / mcp_app，让一个用户能发现、安装、评价。无 token、无链上交互。

### Stages（每 stage = 1 commit）

| Stage | 周 | 内容 |
|-------|----|------|
| **B1** | 1 | 仓库骨架 + DB schema + alembic 首迁 + 基础测试框架 |
| **B2** | 1 | 钱包绑定登录（SIWE 风格）+ 用户 CRUD |
| **B3** | 1.5 | package CRUD + 三类 type manifest 校验 + 上传向导后端 |
| **B4** | 1 | 列表 / 详情 / 搜索 / 标签 / 排行榜 |
| **B5** | 1 | 安装凭证 + 评分评论 + 反刷三层 |
| **B6** | 1 | 前端打磨（关键页面联调）+ 部署上线 + 文档站 |

### 验收标准

- 一个新用户从落地 → 注册 → 上传一个 skill → 拿到 install link 全程顺利
- 另一个新用户从落地 → 找到这个 skill → 装上 → 评分，全程顺利
- 评分需要 install receipt，秒评 / 无凭证评分被拦
- 50+ package 上架（冷启动期靠人工种子）
- 30+ 真实评价（同上）
- LCP < 2.5s（详情页）

### 不做（推到 v0.2 之后）

- token 系统
- 钱包持仓页
- 站内通知
- 高级搜索（标签组合 / 多条件）

---

## v0.2 — Token 系统（4-6 周）

**目标**：作者可以为自己的 package 发射 token；早期用户可以拿到空投；持有者列表清晰；新版本通知发送给持有者。**继续不上 DEX、不做行情**。

### Stages

| Stage | 周 | 内容 |
|-------|----|------|
| **B1** | 1.5 | Solidity 合约：AgentTokenFactory + AgentToken + VestingWallet + MerkleAirdrop；Foundry 测试 |
| **B2** | 1 | Sepolia 部署脚本 + factory 部署 + 后端 ABI 集成 |
| **B3** | 1.5 | 链事件索引器（worker.service）+ tokens / token_holders / airdrop_claims 三表 |
| **B4** | 1 | 发射向导前端（owner-only）+ 持有者列表 + token tab |
| **B5** | 1 | 早期用户 merkle 空投生成 + 用户 claim 流程 |
| **B6** | 0.5 | 通知系统：新版本 / 新空投触发邮件 |

### 验收标准

- 5+ package 完成发射
- 100+ 钱包绑定
- 至少 1 次空投快照 + 用户成功 claim
- token tab 不显示价格（保证设计意图）

### 关键风险

- Sepolia 不稳定时索引器要能续跑：要做 reconcile 周期任务
- merkle tree 大于 1 万叶子节点时生成耗时：分批生成

---

## v0.3 — 治理与推荐（4-6 周）

**目标**：让 token 有真实用途（治理）；让 marketplace 不只靠"最近上传 / 评分高"，引入个性化推荐。

### Stages

| Stage | 周 | 内容 |
|-------|----|------|
| **B1** | 1.5 | proposals + votes 表 + 链上 ERC20Votes 集成（升级 AgentToken）+ snapshot 机制 |
| **B2** | 1 | 提议 / 投票 UI + 治理面板 |
| **B3** | 1 | 数据看板：作者维度 / 持有者维度 / 平台总览 |
| **B4** | 1.5 | 推荐算法 v1：协同过滤 + 基于 tags + 基于持仓相似度 |
| **B5** | 1 | A/B 框架（推荐算法替换实验位）+ 评分质量 LLM 评估 |

### 验收标准

- 至少 3 个 package 跑过治理流程
- 推荐栏 CTR ≥ 8%（vs trending 6%）
- 数据看板上线（管理员 + 公开两版）

---

## v0.5 — 工程化（4-6 周）

**目标**：为更大流量准备。

### Stages

| Stage | 周 | 内容 |
|-------|----|------|
| **B1** | 1.5 | SQLite → Postgres 迁移（pgloader + 双写 + 切换） |
| **B2** | 1 | API / worker 拆到独立 VPS；Redis 拆独立机 |
| **B3** | 1 | 静态资产迁 Cloudflare R2 + CDN |
| **B4** | 1 | 全文搜索：FTS5 → Postgres tsvector + trigram |
| **B5** | 1 | 监控完善：Sentry + Prometheus + 告警规则 |
| **B6** | 0.5 | 灾难恢复演练 |

---

## v1.0 — GA 决策点

到此阶段需明确以下问题（**今天先不答**）：

1. 是否上主网？哪个主网（Ethereum / Base / Solana）？
2. 主网上是否考虑商业化（platform fee / premium tier）？
3. 是否需要 KYC（取决于司法管辖区策略）？
4. 是否扩展第二个市场维度（如 Workflow 或 Agent System，而非单个 package）？
5. 是否做开放 API / SDK 让第三方平台集成（如 Cursor / Cline 等）？

---

## 长期愿景（v2.0+，非承诺）

- **Agent 之间的 marketplace**：不止"包"，而是 agent 编排 / orchestration 模板的市场
- **跨链支持**：用户用任意链的 wallet 都能登录 / 持仓
- **去中心化注册表**：核心元数据上链 / IPFS 备份
- **企业版**：私有 marketplace 支持

这些是远景，**当前不规划** —— 用户明确要求"v0.X 阶段做 v0.X 的事"。
