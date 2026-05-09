# 06 — 前端方案

## 1. 技术栈

| 模块 | 选型 |
|------|------|
| 框架 | **Next.js 14（App Router）** |
| 语言 | TypeScript（strict 模式） |
| 样式 | TailwindCSS + shadcn/ui |
| 数据 | TanStack Query + Zustand（轻量全局状态） |
| 表单 | react-hook-form + zod |
| 钱包 | wagmi v2 + viem + RainbowKit |
| 富文本 | react-markdown + rehype-sanitize |
| 主题 | next-themes（亮 / 暗） |
| 图标 | lucide-react |
| i18n | v0.1 不做，v0.3 加 next-intl（中英） |

---

## 2. 路由结构

```
app/
├── layout.tsx                # 全局 layout（导航 / footer）
├── page.tsx                  # 首页
├── (auth)/
│   ├── login/page.tsx        # 钱包登录引导
│   └── setup-handle/page.tsx # 首次登录设置 handle
├── p/
│   └── [slug]/
│       ├── page.tsx          # 详情
│       ├── reviews/page.tsx  # 全部评论
│       ├── token/page.tsx    # v0.2 token tab
│       └── launch/page.tsx   # v0.2 发射向导（仅 owner）
├── upload/
│   ├── page.tsx              # 上传向导（type 选择）
│   └── [type]/page.tsx       # skill / agent / mcp_app 子表单
├── u/
│   └── [handle]/page.tsx     # 用户主页
├── wallet/page.tsx           # v0.2 钱包页（持仓 / 空投）
├── search/page.tsx           # 搜索结果（也可用 / 加 ?q=）
├── tags/[name]/page.tsx
└── docs/                     # 文档站（mdx）
```

---

## 3. 关键页面设计

### 3.1 首页

**Above the fold**：
- 大标题 + 一句价值主张
- "Browse" / "Upload" 双 CTA
- 搜索框

**下方板块**（按顺序）：
- **Trending this week**（横向滚动卡片）
- **By type**：tabs `Skills` / `Agents` / `MCP Apps`，每个 tab 6 张卡
- **New & noteworthy**
- **Top contributors**（v0.2 起按 token holders 加权）

卡片布局：
```
┌─────────────────────────────────────┐
│ [type icon]  awesome-rust-skill      │
│              by @alice               │
│                                      │
│ 简短描述...                          │
│                                      │
│ ⭐ 4.7 (23)  📦 412 installs        │
│ #rust #code-review                    │
└─────────────────────────────────────┘
```

### 3.2 详情页 `/p/{slug}`

布局：
```
┌─ Header ─────────────────────────────┐
│ [icon] Title                  [Install] │
│ by @alice · v1.2.0 · MIT              │
│ ⭐ 4.7 (23) · 📦 412 installs          │
└──────────────────────────────────────┘

[Overview] [Versions] [Reviews] [Token (v0.2)] [Source]

Tab 1 - Overview:
  - README markdown rendering
  - Screenshots gallery
  - Tags

Tab 2 - Versions:
  - 版本列表（newest first），每个版本：version, published_at, changelog

Tab 3 - Reviews:
  - 评分分布柱状图
  - 评论列表（sort by newest / highest / lowest）
  - 已安装但未评价 → 显示 "Write a review"

Tab 4 - Token（v0.2，可能无）:
  - 总供应、合约地址、持有者数
  - "你持有：XXX 枚"
  - 持有者列表（前 100）
  - 是否有可领取空投
  - **不显示**价格 / K 线

Tab 5 - Source:
  - repo / homepage 链接
  - 安装命令拷贝
```

**Install 按钮行为**：
- 未登录 → 跳转登录
- 已登录 → 弹 modal 显示安装命令 + 一键复制 + 后台 POST install-receipt
- 已安装 → 按钮变 "Installed ✓"，旁边出现 "Write review"

### 3.3 上传向导 `/upload`

Step 1：选 type
```
┌────────────┐ ┌────────────┐ ┌────────────┐
│   Skill    │ │   Agent    │ │  MCP App   │
│  .md file  │ │ system     │ │ MCP server │
│  for CC    │ │ prompt+tools│ │ or app    │
└────────────┘ └────────────┘ └────────────┘
```

Step 2：填表单（按 type 不同）
- 公共：slug / title / description / tags / license / repository / screenshots
- type-specific：见 04-package-format.md
- 上传资产文件（拖拽，进度条）

Step 3：预览 + 发布
- 渲染 manifest 预览
- 点 Publish → POST /api/packages

技术点：
- react-hook-form + zod 校验
- 大文件分块上传（>5MB 时）
- 草稿自动保存到 localStorage

### 3.4 用户主页 `/u/{handle}`

- 头像 / handle / bio / 钱包地址（缩写）
- 上传的 packages（grid）
- 近期 reviews
- v0.2 加：持仓的 tokens（按 slug 分组）

### 3.5 钱包页（v0.2）`/wallet`

- 当前钱包地址 / 余额（ETH testnet）
- 持仓 tokens 列表：每行 = 一个 package + 余额 + "去详情"
- 可领取空投：每行 = 一个空投 + 数额 + "Claim" 按钮（弹起钱包签名）
- 历史交易记录（来自后端索引器）

---

## 4. 钱包登录流（SIWE 风格）

```
[Connect Wallet] (RainbowKit)
       │
       ▼
连接成功，前端拿到 address
       │
       ▼
POST /api/auth/wallet-nonce { address }
       │
       ▼
弹钱包签名 message（文本含 nonce）
       │
       ▼
POST /api/auth/wallet-verify { address, signature }
       │
       ▼
拿到 access_token 存 httpOnly cookie + 内存
       │
       ▼
若 needs_handle_setup → 跳 /setup-handle
否则 → 跳来源页
```

JWT 存 httpOnly cookie；wagmi 状态存内存。

---

## 5. 状态管理

- **服务端数据**：TanStack Query（cache、stale-while-revalidate、optimistic update）
- **钱包状态**：wagmi（自带 React context）
- **UI 全局**：Zustand（侧栏开合、主题、当前 user 概要）
- **表单**：react-hook-form

避免引入 Redux / Recoil 这类重 state 管理。

---

## 6. 设计语言（轻规范）

- 主色：科技蓝 + 强调色（暖橙）
- 字体：Inter（西文）+ 系统中文
- 圆角：12px (cards) / 8px (inputs) / 999px (pills)
- 间距：4 / 8 / 16 / 24 / 32 / 48 / 64 (Tailwind 默认)
- shadcn/ui 全套组件，少量自定义

---

## 7. SEO

- Next.js metadata API
- 详情页 OG image 走 `@vercel/og` 动态生成（package title + 作者 + rating）
- sitemap：`/api/sitemap.xml` 后端生成
- robots.txt 放开

---

## 8. 性能预算

| 页面 | LCP 目标 | TTI 目标 |
|------|---------|---------|
| 首页 | < 2.0s | < 3.0s |
| 详情页 | < 2.5s | < 3.5s |
| 上传向导 | < 3.0s | < 4.0s |

策略：
- SSR + ISR（首页 60s revalidate）
- 详情页 generateStaticParams 预渲染 top 100 包
- 图片用 Next.js Image
- 不要无脑全量 client component；shadcn 默认是 client，按需 server

---

## 9. 测试

- 单元：Vitest（utils / hooks）
- 组件：Testing Library（关键 form 与 wallet flow）
- E2E：Playwright（v0.1 末期补几条关键 flow：登录 → 上传 → 评分）

---

## 10. 开发与部署

- 包管理：**pnpm**（monorepo 友好）
- 构建：`next build`，输出 standalone（systemd 跑 `node .next/standalone/server.js`）
- 环境变量：`.env.production` 托管在服务器（systemd EnvironmentFile）
- 静态资产：`/public` 通过 nginx 直出
