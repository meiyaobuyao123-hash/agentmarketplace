# 00 — 总览

## 1. 痛点

当前 Claude Code / Anthropic 生态的 Skill / Agent / MCP 资源处于**散落状态**：

- **Skill** 散落在 GitHub 各仓库的 README、个人 dotfiles、零散 gist 里，没有集中目录
- **Agent**（带 system prompt 与 tools 配置的预设角色）通常是用户自己拼装，少有公开发布的"最佳实践合集"
- **MCP server / 基于 MCP 的应用**已经有几十个，但仍缺集中索引，质量参差
- 没有评价系统让用户判断"哪个 skill 真的好用"
- 开发者贡献缺乏正反馈循环：发布了一个好 skill，能得到关注 / 留存用户 / 长期激励的方式很少

AgentMarketplace 想解决这件事——做这三类资源的集中式 AppStore，并通过评价系统 + 代币权益绑定，给开发者建立长期激励。

---

## 2. 核心用户

### 开发者
- 写 Claude Code Skill 的人
- 调 Anthropic SDK 做 agent 应用的人
- 写 MCP server 或基于 MCP 做应用 / 产品的人

**他们想要**：把作品被人看见、被使用、被认可；长期留住"喜欢自己作品的用户"。

### 终端用户
- 用 Claude Code / Anthropic API 的开发者
- 想在工作流里加 skill / agent / MCP 工具，但**不想自己一个个去 GitHub 找**

**他们想要**：方便发现、装得上、有真实评价帮判断。

---

## 3. 核心循环

```
开发者上传 package
        │
        ▼
用户发现 → 安装 → 试用
        │
        ▼
用户评分 + 评论（需要安装凭证）
        │
        ▼
排行榜 / 推荐流让好作品被看见
        │
        ▼
开发者为优秀 package 发射 token
        │
        ▼
看好这个 agent 的用户持有 token
        │
        ▼
持有者获更新通知 / 空投权重 / 治理权
        │
        └── 反过来强化作者的发布动力
```

**注意**：token 不是炒作工具——不做撮合、不做 K 线、不做 launchpad。它是**权益凭证 + 弱激励信号**。

---

## 4. 三类 Package

| 维度 | Skill | Agent | MCP App |
|------|-------|-------|---------|
| 内容形态 | 带 frontmatter 的 `.md` | manifest（system prompt + tools + model） | mcp.json 片段 / npm 包 / git repo / docker image |
| 主要消费方 | Claude Code | Claude Code / Anthropic SDK | Claude Code / 任何 MCP host |
| 典型大小 | 几十到几百行 markdown | 几 KB manifest | 一个完整可执行项目 |
| 安装产物 | 下载 .md 到 `~/.claude/skills/` | 输出可粘贴配置块 | 输出 mcp.json + install 命令 |
| 是否带运行环境 | 否 | 否 | 通常是 |

详见 [04-package-format.md](04-package-format.md)。

---

## 5. 范围与非范围

### 在范围内

- 三类 package 的上传 / 版本管理 / 元数据维护
- 搜索、分类、标签、排行榜
- 评分 + 评论 + 反刷
- 钱包绑定登录（SIWE）
- v0.2：每个 package 一枚独立 ERC-20，testnet 部署
- v0.3：token 加权治理投票

### 不在范围内（明确不做）

- ❌ 商业化（订阅 / 抽成 / 广告）—— 用户明确要求不考虑
- ❌ KYC / 合规审查
- ❌ pump.fun / launchpad / bonding curve / meme coin 玩法
- ❌ 站内撮合订单簿 / 接 DEX
- ❌ Token 行情 K 线 / 涨跌榜
- ❌ Docker / k8s
- ❌ 主网部署（v1.0 决策点再定）
- ❌ 多租户 / 企业版

---

## 6. 成功标准

| 阶段 | 衡量 |
|------|------|
| v0.1 | 50+ package 上架；30+ 真实评价；冷启动期作者活跃 |
| v0.2 | 5+ token 发射；100+ 钱包绑定；空投流程跑通 |
| v0.3 | 第一次 token 加权投票完成；推荐算法 CTR ≥ 8% |

---

## 7. 命名

- 项目代号：**AgentMarketplace**
- 站点域名：未定（v0.1 部署前定）
- Token 命名：跟随 package slug，例如 package `awesome-rust-skill` → token `tAGM-AWESOME-RUST-SKILL`（前缀 `tAGM` 表示 testnet AgentMarketplace）
