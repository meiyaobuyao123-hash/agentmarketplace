# 04 — Package 格式（Manifest 规范）

三类 package 共享一套 **公共字段**，加上 type-specific 字段。manifest 存为 JSON（DB `package_versions.manifest`），但前端上传时也接受 YAML（提交时转 JSON）。

---

## 1. 公共字段

```json
{
  "name": "awesome-rust-skill",
  "version": "1.2.0",
  "type": "skill",
  "title": "Awesome Rust Skill",
  "description": "Help Claude Code review Rust code with idiomatic patterns.",
  "author": {
    "handle": "alice",
    "wallet": "0xabc..."
  },
  "license": "MIT",
  "repository": "https://github.com/alice/awesome-rust-skill",
  "homepage": "https://...",
  "tags": ["rust", "code-review", "claude-code"],
  "screenshots": [
    "https://.../shot1.png"
  ],
  "demo_url": "https://...",
  "min_claude_version": "1.5.0",
  "platforms": ["macos", "linux", "windows"]
}
```

校验规则（pydantic）：
- `name`：`[a-z0-9][a-z0-9-]{1,62}[a-z0-9]`
- `version`：semver 严格校验
- `type` ∈ `{skill, agent, mcp_app}`
- `description` ≤ 280
- `tags` 1-8 个
- `screenshots` 至多 6 张

---

## 2. Skill manifest

新增字段：

```json
{
  "skill": {
    "skill_md_url": "https://.../skill.md",
    "frontmatter": {
      "name": "rust-reviewer",
      "description": "Review Rust code...",
      "license": "MIT"
    },
    "size_bytes": 8132,
    "checksum_sha256": "abc..."
  }
}
```

- `skill_md_url`：实际 .md 的 CDN / 站内静态资源 URL
- `frontmatter`：复制 .md 文件 frontmatter 内容（便于列表筛选不必下载文件）
- `size_bytes` / `checksum_sha256`：用于客户端校验完整性

**安装命令产物**（前端 Install 按钮）：
```bash
# 一键安装
curl -fsSL https://agentmarket.xxx/p/awesome-rust-skill/install.sh | sh

# 或手动
mkdir -p ~/.claude/skills/awesome-rust-skill
curl -L "<skill_md_url>" -o ~/.claude/skills/awesome-rust-skill/skill.md
```

---

## 3. Agent manifest

新增字段：

```json
{
  "agent": {
    "system_prompt": "You are an expert Rust reviewer...",
    "model": "claude-opus-4-7",
    "tools": [
      { "type": "builtin", "name": "Read" },
      { "type": "builtin", "name": "Grep" },
      { "type": "mcp_server", "ref": "mcp-rust-analyzer" }
    ],
    "env_vars": [
      { "name": "RUST_PROJECT_ROOT", "required": true, "description": "Path to your Rust project" }
    ],
    "stop_sequences": [],
    "temperature": 0.3,
    "examples": [
      { "user": "review my error handling", "assistant_excerpt": "..." }
    ]
  }
}
```

- `model`：推荐模型 ID（用户可改）
- `tools`：列举所需工具；`mcp_server.ref` 可指向 marketplace 内另一个 mcp_app 的 slug，形成依赖
- `env_vars`：列出运行所需环境变量
- `examples`：1-3 条示范对话片段，列表卡片用第一条做预览

**安装产物**：可粘贴到 Claude Code agent 配置或 Anthropic SDK 代码片段。前端提供两种格式：
- **Claude Code 配置**：写到 `~/.claude/agents/{slug}.md`（带 frontmatter）
- **SDK 代码片段**：TypeScript / Python 两种语言

---

## 4. MCP App manifest

新增字段：

```json
{
  "mcp_app": {
    "runtime": "node",
    "install": {
      "method": "npm",
      "package": "@org/mcp-rust-analyzer",
      "version": "^0.3.0"
    },
    "mcp_servers": {
      "rust-analyzer": {
        "command": "npx",
        "args": ["-y", "@org/mcp-rust-analyzer"],
        "env": {
          "RUST_LOG": "info"
        }
      }
    },
    "exposes": {
      "tools": ["analyze_file", "find_unused"],
      "resources": ["rust-doc://{crate}/{symbol}"],
      "prompts": ["explain-error"]
    },
    "size_bytes": 1234567,
    "asset_url": null
  }
}
```

`runtime` ∈ `{node, python, docker, binary, git}`：
- `node`：`install.method = npm`，`mcp_servers.command` 用 `npx`
- `python`：`install.method = pip` 或 `uvx`
- `docker`：`install.method = docker`，提供 image:tag
- `binary`：`asset_url` 指向二进制 zip / tarball
- `git`：`install.method = git`，提供 repo URL

**安装产物**：
- 输出可粘贴到 `~/.claude/mcp.json` 的片段
- 输出 install 命令（npm / pip / docker pull）

---

## 5. 三类共用：依赖

```json
{
  "dependencies": [
    { "type": "mcp_app", "slug": "mcp-rust-analyzer", "version": "^0.3.0" },
    { "type": "skill",   "slug": "awesome-rust-skill", "optional": true }
  ]
}
```

- 前端在 Install 按钮显示"还需要安装这些"
- 后端 v0.5 可做依赖图分析（暂不强制）

---

## 6. Manifest schema 校验

- 后端 pydantic models 严格校验，未知字段 reject（`extra = "forbid"`）
- 前端用 zod 同步校验（保持单一 schema 源 → 用 [datamodel-code-generator](https://github.com/koxudaxi/datamodel-code-generator) 从 pydantic 生成 TS 类型 + zod schema）
- 上传向导按 type 切换字段表单

---

## 7. 版本演进与兼容性

- manifest 顶层加 `manifest_version` 字段（当前 `1`）
- 重大变更（如新增必填字段）→ 升 `manifest_version` 到 `2`，后端同时支持读两个版本
- 所有写操作只能写最新版本

---

## 8. 例子

### 例：完整 Skill manifest

```json
{
  "manifest_version": 1,
  "name": "awesome-rust-skill",
  "version": "1.2.0",
  "type": "skill",
  "title": "Awesome Rust Skill",
  "description": "Idiomatic Rust review for Claude Code",
  "author": { "handle": "alice", "wallet": "0xabc..." },
  "license": "MIT",
  "repository": "https://github.com/alice/awesome-rust-skill",
  "tags": ["rust", "code-review"],
  "screenshots": [],
  "skill": {
    "skill_md_url": "https://agentmarket.xxx/assets/awesome-rust-skill/1.2.0/skill.md",
    "frontmatter": {
      "name": "rust-reviewer",
      "description": "Review Rust code with idiomatic patterns"
    },
    "size_bytes": 8132,
    "checksum_sha256": "..."
  }
}
```

### 例：完整 Agent manifest

```json
{
  "manifest_version": 1,
  "name": "rust-pair-programmer",
  "version": "0.1.0",
  "type": "agent",
  "title": "Rust Pair Programmer",
  "description": "Pair-programs Rust with you",
  "author": { "handle": "alice", "wallet": "0xabc..." },
  "license": "MIT",
  "tags": ["rust", "pair-programming"],
  "agent": {
    "system_prompt": "You are an expert Rust pair programmer...",
    "model": "claude-sonnet-4-6",
    "tools": [
      { "type": "builtin", "name": "Read" },
      { "type": "builtin", "name": "Edit" },
      { "type": "mcp_server", "ref": "mcp-rust-analyzer" }
    ],
    "env_vars": [],
    "temperature": 0.3
  },
  "dependencies": [
    { "type": "mcp_app", "slug": "mcp-rust-analyzer", "version": "^0.3.0" }
  ]
}
```

### 例：完整 MCP App manifest

```json
{
  "manifest_version": 1,
  "name": "mcp-rust-analyzer",
  "version": "0.3.1",
  "type": "mcp_app",
  "title": "MCP Rust Analyzer",
  "description": "Expose rust-analyzer as MCP tools",
  "author": { "handle": "alice", "wallet": "0xabc..." },
  "license": "Apache-2.0",
  "tags": ["rust", "lsp", "code-intelligence"],
  "mcp_app": {
    "runtime": "node",
    "install": {
      "method": "npm",
      "package": "@alice/mcp-rust-analyzer",
      "version": "^0.3.0"
    },
    "mcp_servers": {
      "rust-analyzer": {
        "command": "npx",
        "args": ["-y", "@alice/mcp-rust-analyzer"],
        "env": { "RUST_LOG": "info" }
      }
    },
    "exposes": {
      "tools": ["analyze_file", "find_unused"],
      "resources": ["rust-doc://{crate}/{symbol}"]
    }
  }
}
```
