# 03 — API 规格

## 0. 通用约定

- **Base URL**：`https://<host>/api`
- **认证**：登录后端发的 `access_token`（JWT，HS256，TTL 7d），放 `Authorization: Bearer <token>`
- **内容类型**：`application/json`，上传走 `multipart/form-data`
- **错误体**：`{ "error": "code", "message": "human readable", "details": {...} }`
- **限流**：默认 60/min/IP；登录 / 上传 / 评分单独配额
- **分页**：cursor 分页，`?cursor=<opaque>&limit=20`，响应带 `next_cursor`
- **时间**：全 ISO 8601 UTC

---

## 1. 鉴权

### `POST /api/auth/wallet-nonce`

请求：
```json
{ "address": "0xabc..." }
```

响应：
```json
{
  "nonce": "abc123...",
  "message": "AgentMarketplace login\nNonce: abc123\nIssued: 2026-05-09T..."
}
```

### `POST /api/auth/wallet-verify`

请求：
```json
{ "address": "0xabc...", "signature": "0xdef..." }
```

响应：
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": 42,
    "handle": "alice",
    "wallet_address": "0xabc...",
    "needs_handle_setup": false
  }
}
```

### `POST /api/auth/setup-handle`（首次登录用）

请求：`{ "handle": "alice" }` → 响应：`{ "user": {...} }`

### `GET /api/me`

响应当前登录用户。

---

## 2. Packages

### `GET /api/packages`

Query：
- `type` = `skill` / `agent` / `mcp_app` / 缺省 = 全部
- `q` = 搜索关键词
- `tag` = 标签 slug，可重复
- `sort` = `trending` / `new` / `top_rated` / `most_installed`，默认 `trending`
- `cursor` / `limit`

响应：
```json
{
  "items": [
    {
      "slug": "awesome-rust-skill",
      "type": "skill",
      "title": "Awesome Rust Skill",
      "short_description": "...",
      "owner": { "handle": "alice", "avatar_url": "..." },
      "rating_avg": 4.7,
      "rating_count": 23,
      "install_count": 412,
      "tags": ["rust", "claude-code"],
      "latest_version": "1.2.0",
      "updated_at": "2026-05-09T..."
    }
  ],
  "next_cursor": "..."
}
```

### `GET /api/packages/{slug}`

响应：包含 `latest_version` 完整 manifest、最近 5 条 reviews、是否已安装、（v0.2）token 信息。

### `POST /api/packages`

需登录。请求：
```json
{
  "slug": "awesome-rust-skill",
  "type": "skill",
  "title": "Awesome Rust Skill",
  "short_description": "...",
  "tags": ["rust", "claude-code"],
  "manifest": { ... },         // 见 04-package-format.md
  "readme": "# ...",
  "changelog": "v1.0.0 first release"
}
```

资产文件单独走 `POST /api/packages/{slug}/assets`（multipart），返回 `asset_url` 后塞进下一次发版本请求。

响应：`{ "package": {...}, "version": {...} }`

### `POST /api/packages/{slug}/versions`

发新版本。请求：
```json
{
  "version": "1.3.0",
  "manifest": { ... },
  "asset_url": "...",
  "changelog": "..."
}
```

会更新 `packages.latest_version_id`。

### `PATCH /api/packages/{slug}`

修改可变元数据（title / short_description / tags / status）。仅 owner 可调。

---

## 3. 安装凭证

### `POST /api/packages/{slug}/install-receipt`

需登录。响应：
```json
{
  "receipt_sig": "...",
  "issued_at": "2026-05-09T...",
  "version": "1.2.0",
  "install_command": "claude skill add ...",   // 或 mcp.json 片段
  "instructions": "..."                          // markdown
}
```

幂等：一钱包一包只发一次（INSERT OR IGNORE）。

---

## 4. Reviews

### `GET /api/packages/{slug}/reviews`

Query：`?cursor=&limit=&sort=newest|highest|lowest`。

### `POST /api/packages/{slug}/reviews`

需登录 + installs 记录存在。请求：
```json
{ "rating": 5, "body": "great skill, saved me hours" }
```

校验：
- `rating ∈ [1,5]`
- 必须存在 `installs(package_id, user_id)`
- 距离 install 签发 ≥ 5 分钟（防秒评）
- 若已存在 review，走 update 路径（`edit_count++`，最多 1 次）

### `DELETE /api/packages/{slug}/reviews/me`

撤销自己的评论。

---

## 5. Tags

### `GET /api/tags?q=`

返回前缀匹配 + 包数倒序，用于上传向导的 autocomplete。

### `GET /api/tags/{name}`

返回 tag 信息 + 关联 package 列表（cursor 分页）。

---

## 6. Users

### `GET /api/users/{handle}`

公开主页信息：基本资料、上传的 packages、近期 reviews。

### `PATCH /api/users/me`

改 handle / bio / avatar。handle 改一次后冷却 30 天。

---

## 7. Search（v0.1 用 SQLite FTS5；v0.5 迁 Postgres）

`GET /api/packages?q=...` 走 FTS：

- 索引字段：`title`、`short_description`、`readme`、`tags`
- v0.5 迁移后用 `ts_vector` + `tsquery`，补 trigram 用于模糊匹配

---

## 8. Token 接口（v0.2）

### `POST /api/packages/{slug}/token/launch`

需登录 + 请求者 = package owner。请求：
```json
{
  "name": "tAGM AwesomeRustSkill",
  "symbol": "tAGM-ARS",
  "deploy_tx": "0xabc..."          // 前端在链上发完交易后回报 tx
}
```

后端：
- 校验 deployer = owner.wallet_address
- 等待 worker 索引到 `TokenDeployed` 事件后插入 `tokens` 表
- 返回 `{ "token": {...}, "indexed": true | false }`

### `GET /api/packages/{slug}/token`

返回 token 元数据 + 当前持有者数 + 用户自己的余额（若登录）。

### `GET /api/packages/{slug}/token/holders`

cursor 分页返回 `[{ wallet, handle?, balance, percent }]`。

### `GET /api/packages/{slug}/token/claims/me`

返回当前登录者可领取的空投列表。

### `POST /api/packages/{slug}/token/claims/{claim_id}/proof`

返回 merkle proof，前端拿去链上调 claim 合约。

---

## 9. 治理接口（v0.3）

### `GET /api/packages/{slug}/proposals`

### `POST /api/packages/{slug}/proposals`

发议案。要求当前钱包持有 ≥ N 枚（N 可配置，默认 0，v0.3 调）。

### `POST /api/proposals/{id}/votes`

投票。需要钱包签名带 snapshot 余额；后端去链上验证 snapshot blockNumber 时的余额。

---

## 10. Notifications（v0.2）

### `POST /api/me/notifications/subscribe`

订阅类型：`new_version` / `airdrop_available` / `proposal_opened`，按 package 维度。

### `GET /api/me/notifications`

最近通知列表。

---

## 11. Health

### `GET /api/healthz`

返回 200 + DB / Redis 连通状态；nginx 探活用。

### `GET /api/version`

返回 `{ "version": "0.1.0", "commit": "abc123", "deployed_at": "..." }`。

---

## 12. 错误码

| code | 含义 |
|------|------|
| `auth_required` | 401 未登录 |
| `permission_denied` | 403 |
| `not_found` | 404 |
| `slug_taken` | 409 slug 重复 |
| `manifest_invalid` | 400 manifest schema 错 |
| `not_installed` | 403 评分时缺安装凭证 |
| `review_too_soon` | 429 距 install 不足 5 分钟 |
| `rate_limited` | 429 |
| `wallet_signature_invalid` | 401 |
| `version_exists` | 409 |
| `internal` | 500 |
