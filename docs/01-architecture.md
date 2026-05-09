# 01 — 系统架构

## 1. 整体形态

**v0.1 单体起步**，三个进程同机运行：

```
┌─────────────────────────────────────────────────────────┐
│                     nginx (443/80)                       │
│        TLS 终止 / 静态资源 / 反代到内部端口              │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
       /api/*│                       其它 │
             ▼                            ▼
   ┌──────────────────┐       ┌──────────────────┐
   │  api (FastAPI)   │       │  web (Next.js)   │
   │  uvicorn :8000   │       │  next start :3000│
   └────────┬─────────┘       └──────────────────┘
            │
            ▼
   ┌──────────────────┐       ┌──────────────────┐
   │  SQLite (v0.1)   │       │  Redis (本机)    │
   │  Postgres (v0.5) │       │  缓存 / 限流     │
   └──────────────────┘       └──────────────────┘

   v0.2 加：
   ┌──────────────────┐       ┌──────────────────┐
   │  worker          │       │  Sepolia testnet │
   │  链事件索引       │ ────> │  Alchemy RPC     │
   └──────────────────┘       └──────────────────┘
```

按需拆分原则：v0.1 不拆，v0.5 数据库迁移时再拆 worker / api 到不同机器。

---

## 2. 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| 后端语言 | **Python 3.12** | 用户既有偏好；MCP 与 LLM 生态 Python 资源最多 |
| Web 框架 | **FastAPI** | async 原生支持；OpenAPI 自动生成；和 pydantic 配合好 |
| ORM | **SQLAlchemy 2.x**（直接写 select，不引入 Repository / DAO 抽象） | 用户偏好 |
| 迁移 | **Alembic** | SQLAlchemy 默认搭档 |
| DB | **SQLite v0.1** → **Postgres v0.5+** | 不过早优化 |
| 缓存/限流 | **Redis** | 评分缓存、登录 nonce、API 限流 |
| 任务队列 | v0.2 加 **rq**（基于 Redis）或 **arq** | 链事件索引 |
| 前端 | **Next.js 14 App Router + TypeScript** | SSR 利于 SEO；shadcn/ui 生态好 |
| 钱包 | **wagmi + viem**（前端）、**eth-account / web3.py**（后端） | EVM 标配 |
| 智能合约 | **Solidity + Foundry** | OpenZeppelin ERC-20 起步 |
| 链 | **Sepolia testnet** | 免费、工具最熟、避开主网与"meme coin"标签 |
| RPC | **Alchemy 免费 tier** | 稳定；后期可换 Infura / 自建节点 |
| 测试 | **pytest + respx + fakeredis** | 用户偏好 |
| 反代 / TLS | **nginx + certbot** | 用户偏好的传统姿势 |
| 进程管理 | **systemd** | 不用 Docker（用户偏好） |

---

## 3. 模块划分

### 后端模块（FastAPI 单进程内）

```
api/
├── auth/           # 钱包绑定登录（SIWE 风格 nonce 签名）
├── registry/       # package 元数据、版本、上传
├── search/         # 全文搜索（v0.1 用 SQLite FTS5；v0.5 迁 Postgres trigram）
├── reviews/        # 评分、评论、反刷
├── installs/       # 安装凭证签发与验证
├── tokens/         # v0.2 加：合约部署、token 元数据
├── events/         # v0.2 加：链事件索引器（worker 进程消费）
├── notifications/  # 邮件 / push（持有者通知用）
└── core/           # config / db / redis / 中间件 / 错误处理
```

### 前端结构

```
web/
├── app/
│   ├── (marketing)/        # 首页、关于、文档站
│   ├── p/[slug]/           # package 详情
│   ├── upload/             # 上传向导
│   ├── u/[handle]/         # 用户主页
│   └── wallet/             # v0.2 加：持仓 / 空投领取
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── package-card/
│   ├── review-list/
│   └── wallet-connect/
└── lib/
    ├── api.ts              # TanStack Query hooks
    ├── wagmi-config.ts
    └── siwe.ts
```

详见 [06-frontend.md](06-frontend.md)。

---

## 4. 关键流程

### 4.1 钱包登录（SIWE 风格）

```
前端连接钱包 → POST /api/auth/wallet-nonce { address }
              ← { nonce, message }
前端用钱包签 message → POST /api/auth/wallet-verify { address, signature }
                    ← { access_token, user }
```

- nonce 存 Redis，TTL 5 分钟
- 同地址登录自动复用 user 记录
- 首次登录引导设置 handle（用户名）

### 4.2 上传 package

```
开发者填上传向导（type / 元数据 / manifest）
        │
        ▼
前端校验 manifest schema（zod）
        │
        ▼
POST /api/packages（multipart 或 URL）
        │
        ▼
后端校验：
  - manifest schema（pydantic）
  - slug 唯一
  - 上传 asset 到 S3-compatible（v0.1 用本机 /var/lib/agentmarket/uploads）
        │
        ▼
写 packages + package_versions（latest_version_id）
        │
        ▼
异步触发：search index 重建、首页 trending 缓存失效
```

### 4.3 评分（带反刷）

```
用户在详情页点 "Install" 按钮
        │
        ▼
前端：copy install command + POST /api/packages/{slug}/install-receipt
        │
        ▼
后端签发 install receipt（HMAC，含 user_id + package_id + timestamp）
        │
        ▼
（用户实际安装并使用过一段时间，前端记录"已安装" 状态）
        │
        ▼
用户提交评分 → POST /api/packages/{slug}/reviews
        │
        ▼
后端校验：installs 表中存在该 (user, package) 记录、距离签发 ≥ 5 分钟
```

防刷三层：
1. 必须连钱包登录（一钱包一账号）
2. 必须先领过 install receipt
3. 评分时间窗口（不能秒评）

### 4.4 Token 发射（v0.2）

```
package 作者 → /upload 之外的独立入口 /p/{slug}/launch
        │
        ▼
前端：连接钱包（必须 = package owner 绑定的钱包）
        │
        ▼
前端调用 AgentTokenFactory.deployToken(slug, name, symbol, totalSupply)
        │
        ▼
合约部署一枚独立 ERC-20，初始 totalSupply 全部转入 factory 托管
factory 按规则分发：
  40% → vesting 合约（作者 12 个月线性）
  30% → 空投合约（按 reviewer / installer 名单）
  20% → 平台金库（站内激励）
  10% → 平台保留
        │
        ▼
worker 监听 TokenDeployed 事件，落库 tokens 表
        │
        ▼
前端 /p/{slug} 详情页 token tab 出现
```

详见 [05-token-design.md](05-token-design.md)。

---

## 5. 安全要点

- **secrets 走环境变量**：`.env` 在生产由 systemd 的 EnvironmentFile 注入；不进 git
- **SQL 注入**：全部走 SQLAlchemy 参数化
- **XSS**：用户输入的 markdown 用 [DOMPurify](https://github.com/cure53/DOMPurify) 净化
- **限流**：登录 / 上传 / 评分接口走 Redis 漏桶（5/min/ip + 30/min/user）
- **manifest 校验**：上传时严格 schema 校验，拒绝未知字段
- **资产存储**：上传文件大小上限（10 MB skill / 50 MB agent / 200 MB mcp_app），扫病毒（v0.5+ 接 ClamAV）
- **钱包签名**：nonce 一次性、防重放
- **CORS**：API 只信任自家 web 域名

---

## 6. 性能与扩展

- v0.1：单 VPS 4C8G 跑全部，目标 100 RPS、5K DAU
- v0.5：拆 worker 到独立机器；DB 迁 Postgres；上 CDN（Cloudflare）放 asset
- v1.0：API 横向扩，session 走 Redis cluster

---

## 7. 与其他系统的边界

| 边界 | 说明 |
|------|------|
| **Anthropic API / Claude Code** | 我们不调 Anthropic API；Skill / Agent 的"运行"在用户本地的 Claude Code / SDK 里发生。我们只做 registry。 |
| **MCP host** | 我们不运行 MCP server；只描述如何安装。 |
| **链** | testnet 上的 token 合约；我们的服务只读链状态做索引，不托管私钥。 |
| **资产托管** | v0.1 本机磁盘；v0.5 可考虑 S3 / R2。 |
