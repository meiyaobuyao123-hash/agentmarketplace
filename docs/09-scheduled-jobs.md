# 09 — 定时任务

> 调度选型：**系统级用 systemd timer**（不引入额外组件、和 systemd 日志一体），**应用级用 arq**（基于 Redis，v0.2 已经有 worker 进程，复用即可）。
> 不引入 Celery / cron daemon / 第三方调度器。

---

## 1. 总览

| 任务 | 周期 | 调度方式 | 引入版本 |
|------|------|---------|---------|
| DB 备份 | 每天 03:00 | systemd timer | v0.1 |
| 上传 / 备份目录 rsync | 每天 03:30 | systemd timer | v0.1 |
| 日志归档清理 | 每天 04:00 | systemd timer（logrotate） | v0.1 |
| 过期 install draft / 临时文件清理 | 每周日 04:30 | systemd timer | v0.1 |
| 全量搜索索引兜底重建 | 每天 05:00 | systemd timer | v0.1 |
| trending 排行榜重算 | 每 60s | arq cron | v0.1 |
| rating_avg / rating_count 兜底重算 | 每小时 :17 | arq cron | v0.1 |
| 健康自检上报外部 monitor | 每 60s | arq cron | v0.1 |
| 链事件索引器 reconcile | 每 30min | arq cron | v0.2 |
| token_holders 全量快照校准 | 每天 02:00 | arq cron | v0.2 |
| 通知积压重试 | 每 5min | arq cron | v0.2 |
| Merkle tree 周期重生成（空投批次） | 每周日 02:30 | arq cron | v0.2 |
| 推荐算法预计算 | 每天 02:30 | arq cron | v0.3 |
| 数据看板物化视图刷新 | 每小时 :07 | arq cron | v0.3 |

注：链事件索引器**本身**是常驻 worker，不在此表（详见 [05-token-design.md §7](05-token-design.md)）；这里只列它的周期性 reconcile。

---

## 2. 系统级任务（systemd timer）

### 2.1 模式

每个任务两个文件：`{name}.service`（一次性 oneshot）+ `{name}.timer`（触发器）。
所有任务用同一个 user：`agentmarket`。

### 2.2 DB 备份

`/etc/systemd/system/agentmarket-backup-db.service`

```ini
[Unit]
Description=AgentMarket DB backup
After=network.target

[Service]
Type=oneshot
User=agentmarket
Group=agentmarket
ExecStart=/opt/agentmarket/scripts/backup-db.sh
StandardOutput=append:/opt/agentmarket/logs/backup-db.log
StandardError=append:/opt/agentmarket/logs/backup-db.err
```

`/etc/systemd/system/agentmarket-backup-db.timer`

```ini
[Unit]
Description=Daily AgentMarket DB backup

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

`/opt/agentmarket/scripts/backup-db.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%Y%m%d-%H%M)
DIR=/opt/agentmarket/backups
mkdir -p "$DIR"

# v0.1 SQLite
sqlite3 /opt/agentmarket/data/agentmarket.sqlite ".backup '$DIR/db-$DATE.sqlite'"
gzip "$DIR/db-$DATE.sqlite"

# 保留 30 天
find "$DIR" -name 'db-*.sqlite.gz' -mtime +30 -delete

# v0.5 Postgres：替换为
# pg_dump -Fc agentmarket > "$DIR/db-$DATE.dump"
```

启动：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now agentmarket-backup-db.timer
```

### 2.3 上传目录增量备份

`agentmarket-backup-uploads.{service,timer}`，OnCalendar `03:30:00`。

```bash
#!/usr/bin/env bash
set -euo pipefail
rsync -a --delete /opt/agentmarket/data/uploads/ /opt/agentmarket/backups/uploads/
# v0.5 起 rsync 到远程 R2（rclone 或 aws s3 sync）
```

### 2.4 日志归档

直接用系统 `logrotate`，不用 systemd timer。

`/etc/logrotate.d/agentmarket`

```
/opt/agentmarket/logs/*.log /opt/agentmarket/logs/*.err {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    su agentmarket agentmarket
}
```

### 2.5 过期临时文件清理

`agentmarket-cleanup.{service,timer}`，OnCalendar `Sun *-*-* 04:30:00`（每周日）。

```bash
#!/usr/bin/env bash
set -euo pipefail
# 上传过程中产生但未 commit 的临时文件（>7 天）
find /opt/agentmarket/data/uploads/.tmp -type f -mtime +7 -delete 2>/dev/null || true
# 旧的 audit log
find /opt/agentmarket/logs/audit -name '*.log' -mtime +90 -delete 2>/dev/null || true
```

### 2.6 全量搜索索引兜底重建

`agentmarket-reindex.{service,timer}`，OnCalendar `*-*-* 05:00:00`。

调用后端管理命令：
```bash
ExecStart=/opt/agentmarket/api/api/.venv/bin/python -m app.cli reindex --all
```

实现位置：`app/cli.py`，调用 `app.search.rebuild_index()`。
失败兜底：写入 `app.log`，下次再试；不发告警（每天兜底，漏一次没事）。

---

## 3. 应用级任务（arq）

### 3.1 选型理由

- v0.2 起已经有 worker 进程，arq 复用 Redis，不用再装新组件
- arq 原生支持 cron 风格周期任务（`cron(...)`），写在 Python 里好审、好测试
- 与 FastAPI 共用 pydantic / settings / logger

### 3.2 worker 进程拓扑

| 进程 | 职责 |
|------|------|
| `agentmarket-api.service` | FastAPI HTTP |
| `agentmarket-worker.service` | arq worker（v0.1 跑应用级 cron；v0.2 加链事件索引） |

v0.1 起就跑 worker.service（即使没有链事件索引），让所有应用级 cron 任务有家。

### 3.3 worker 主入口

`app/worker.py`

```python
from arq import cron
from app.tasks import (
    refresh_trending,
    backfill_rating_aggregates,
    selfcheck_report,
)

class WorkerSettings:
    redis_settings = ...
    functions = []   # 主要靠 cron_jobs；如有 enqueue 任务可在此加
    cron_jobs = [
        cron(refresh_trending, second={0, 30}),                 # 每 30s 触发，正好覆盖 60s 窗口
        cron(backfill_rating_aggregates, minute=17),            # 每小时 :17 跑
        cron(selfcheck_report, second={0, 30}),                 # 每 30s 一次
        # v0.2 加：
        # cron(reconcile_chain_index, minute={0, 30}),
        # cron(snapshot_token_holders, hour=2, minute=0),
        # cron(retry_pending_notifications, minute={0, 5, 10, ...}),
        # cron(rebuild_airdrop_merkle, day_of_week='sun', hour=2, minute=30),
        # v0.3 加：
        # cron(precompute_recommendations, hour=2, minute=30),
        # cron(refresh_dashboard_views, minute=7),
    ]
    max_jobs = 10
```

### 3.4 任务实现

#### `refresh_trending`

```python
async def refresh_trending(ctx):
    """重算 trending 排行榜，写入 Redis（TTL 90s 容错）。"""
    async with db_session() as s:
        rows = await s.execute(text("""
            SELECT id, slug, type, title, owner_id, rating_avg, install_count, published_at
            FROM packages
            WHERE status = 'published'
        """))
        scored = [
            (r, score(r)) for r in rows
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
    await ctx['redis'].setex('trending:all', 90, serialize(scored[:100]))
    await ctx['redis'].setex('trending:skill', 90, serialize([r for r in scored if r[0].type=='skill'][:50]))
    await ctx['redis'].setex('trending:agent', 90, serialize([r for r in scored if r[0].type=='agent'][:50]))
    await ctx['redis'].setex('trending:mcp_app', 90, serialize([r for r in scored if r[0].type=='mcp_app'][:50]))
```

`score()` 公式见 [v0.1-spec.md §B4](v0.1-spec.md)。

#### `backfill_rating_aggregates`

```python
async def backfill_rating_aggregates(ctx):
    """评分写入时已经增量更新；这里是兜底全量重算，防漂移。"""
    async with db_session() as s:
        await s.execute(text("""
            UPDATE packages
            SET rating_avg = COALESCE((SELECT AVG(rating) FROM reviews WHERE package_id = packages.id), 0),
                rating_count = (SELECT COUNT(*) FROM reviews WHERE package_id = packages.id)
        """))
        await s.commit()
```

#### `selfcheck_report`

```python
async def selfcheck_report(ctx):
    """检查 DB / Redis 连通，上报到外部 monitor。"""
    ok = True
    try:
        await ctx['db'].execute(text('SELECT 1'))
        await ctx['redis'].ping()
    except Exception:
        ok = False
    if MONITOR_PING_URL:
        async with httpx.AsyncClient(timeout=5) as c:
            await c.get(MONITOR_PING_URL + ('' if ok else '/fail'))
```

外部 monitor 用 [healthchecks.io](https://healthchecks.io) 免费 tier 或自托管，每个任务对应一个 ping URL。**60s 内没收到 ping 就告警**——这是用户最先感知到的"东西挂了"通道。

#### `reconcile_chain_index`（v0.2）

```python
async def reconcile_chain_index(ctx):
    """从 last_indexed_block - RECONCILE_DEPTH 起扫描所有 Transfer / Claimed 事件，
    与 token_holders / airdrop_claims 表对账，缺的补、多的删。"""
    last = await get_last_indexed_block()
    from_block = max(0, last - 1000)  # 回扫 1000 block ≈ 3.3 小时
    events = await fetch_events(from_block, 'latest')
    for ev in events:
        await reconcile_event(ev)
```

#### `snapshot_token_holders`（v0.2）

```python
async def snapshot_token_holders(ctx):
    """全量校准每个 token 的持有者余额（防止增量索引漏事件累积漂移）。"""
    for token in await all_deployed_tokens():
        await rebuild_holders_for(token)
```

#### `retry_pending_notifications`（v0.2）

```python
async def retry_pending_notifications(ctx):
    """从 notifications_outbox 表取 status='pending' 且 attempts < 5 的项，重发。"""
    ...
```

#### `rebuild_airdrop_merkle`（v0.2）

```python
async def rebuild_airdrop_merkle(ctx):
    """每周日凌晨：为每个已发射 token 的"激励池"部分按最新 reviewer/installer 名单重生成 merkle root，
    生成新一批 airdrop_claims 记录。作者可在面板里手动 push 到链上更新空投合约 root。"""
    ...
```

详见 [05-token-design.md §6](05-token-design.md)。

#### `precompute_recommendations`（v0.3）

每天 02:30 跑：协同过滤 + tag-based + 持仓相似度，结果写入 `recommendations` 表。

#### `refresh_dashboard_views`（v0.3）

刷新数据看板用的物化视图（如 `mv_top_authors_30d`、`mv_dau`）。Postgres 用 `REFRESH MATERIALIZED VIEW CONCURRENTLY`。

### 3.5 worker 部署

systemd unit 已在 [07-deployment.md §7](07-deployment.md) 列出，启动方式：

```ini
ExecStart=/opt/agentmarket/api/api/.venv/bin/arq app.worker.WorkerSettings
```

v0.1 阶段就要把 worker.service 起起来，跑 §3.4 前 3 个 cron 任务。

---

## 4. 失败处理与告警

| 任务类型 | 失败行为 | 告警阈值 |
|---------|---------|---------|
| systemd timer（备份等） | systemd 自动重试下次触发；`OnFailure=` 钩子推 healthcheck 失败 ping | 连续 2 次失败 |
| arq cron（应用级） | arq 内置 try/except + retry（默认 5 次指数退避）；超出后写 outbox 表 | 单个任务 1 小时内 > 3 次失败 |
| 链事件 reconcile | 单次失败仅 log；连续 6 次（3 小时）失败发告警 | 防止 RPC 抖动误报 |
| 通知重试 | attempts 达 5 后标记 `permanent_fail`，人工查 | 每天积压 > 10 条 |

`OnFailure=` 钩子模板：

```ini
[Unit]
OnFailure=agentmarket-alert@%n.service
```

`/etc/systemd/system/agentmarket-alert@.service`

```ini
[Service]
Type=oneshot
ExecStart=/opt/agentmarket/scripts/alert.sh "%i"
```

`alert.sh` 内容：往 healthchecks.io 对应 ping URL POST，或简单调一个 webhook（v0.2 起接 Telegram bot）。

---

## 5. 测试

- arq 任务：用 `pytest-asyncio` + `fakeredis` 直接调函数；不真起 worker
- systemd timer：本地用 `systemd-run --on-active=10s` 验证 unit 写法
- 全链路：v0.2 末期手动跑一遍"挂掉某依赖（停 redis）"演练，验证：
  - 系统级任务能在依赖恢复后 catch up（systemd `Persistent=true`）
  - 应用级任务积压不丢（arq 默认走 Redis 持久化）

---

## 6. 调试与运维

| 操作 | 命令 |
|------|------|
| 查看 timer 状态 | `systemctl list-timers 'agentmarket-*'` |
| 查看某任务最近运行日志 | `journalctl -u agentmarket-backup-db.service` |
| 手动触发一次 timer 任务 | `systemctl start agentmarket-backup-db.service` |
| 查看 arq worker 日志 | `journalctl -u agentmarket-worker.service -f` |
| 临时禁用某 timer | `systemctl disable --now agentmarket-X.timer` |
| 查看 arq 队列里待处理任务 | `redis-cli -n 0 ZRANGE arq:queue 0 -1` |

---

## 7. 不做的事

- ❌ 引入 Celery（用户偏好简单栈，arq 够用）
- ❌ 引入独立 cron daemon（systemd timer 已经够）
- ❌ 自己写"分布式定时锁"——v0.1 / v0.2 单 worker 进程不需要；v0.5 worker 多机时用 Redis SETNX 加 TTL 即可，arq 也内置了同名任务并发限制
- ❌ 做 Web UI 看板看 cron（v0.3 之前先靠 healthchecks.io + journalctl）
