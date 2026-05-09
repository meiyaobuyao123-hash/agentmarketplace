# 07 — 部署

> 沿用用户既有部署模式：**Linux VPS + systemd + nginx**，**不用 Docker**。

---

## 1. 目标拓扑（v0.1）

单台 VPS 跑全部：

```
[用户] ─HTTPS─> nginx ─┬──> Next.js (3000)   [agentmarket-web.service]
                       └──> FastAPI (8000)   [agentmarket-api.service]
                                  │
                                  ├─> SQLite 文件
                                  └─> Redis (6379)

(v0.2 加:)
                                       agentmarket-worker.service ──> Sepolia RPC
```

---

## 2. 服务器规格

| 阶段 | 配置 | 月成本估算 |
|------|------|-----------|
| v0.1 | 4C 8G 80GB SSD | ~$20-40 |
| v0.2 | 同上 | 同上 |
| v0.5 | 8C 16G 200GB + Postgres 拆机 | ~$80-120 |

操作系统：**Ubuntu 22.04 LTS** 或 **Debian 12**。

---

## 3. 系统初始化（基础包）

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential git curl wget \
  python3.12 python3.12-venv \
  nodejs npm \
  redis-server \
  nginx certbot python3-certbot-nginx \
  sqlite3 \
  ufw fail2ban
```

Node 用 [nodesource](https://github.com/nodesource/distributions) 装 20.x；pnpm `npm i -g pnpm`。
Python 3.12 系统装好后，项目用 venv 隔离。

防火墙：
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 4. 用户与目录

```
/opt/agentmarket/
├── api/            # 后端代码（git checkout）
├── web/            # 前端构建产物
├── data/
│   ├── agentmarket.sqlite
│   └── uploads/
├── logs/
└── .env            # 环境变量（mode 600，systemd EnvironmentFile）
```

```bash
sudo useradd -r -s /bin/bash -d /opt/agentmarket agentmarket
sudo mkdir -p /opt/agentmarket/{api,web,data/uploads,logs}
sudo chown -R agentmarket:agentmarket /opt/agentmarket
```

---

## 5. 后端部署

```bash
sudo -u agentmarket bash <<'EOF'
cd /opt/agentmarket/api
git clone https://github.com/meiyaobuyao123-hash/agentmarketplace.git .
cd api  # 假设后端代码在 repo 的 api/ 子目录
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
EOF
```

### systemd unit `/etc/systemd/system/agentmarket-api.service`

```ini
[Unit]
Description=AgentMarketplace API
After=network.target redis.service
Wants=redis.service

[Service]
Type=simple
User=agentmarket
Group=agentmarket
WorkingDirectory=/opt/agentmarket/api/api
EnvironmentFile=/opt/agentmarket/.env
ExecStart=/opt/agentmarket/api/api/.venv/bin/uvicorn app.main:app \
    --host 127.0.0.1 --port 8000 \
    --workers 2 --proxy-headers
Restart=on-failure
RestartSec=3
StandardOutput=append:/opt/agentmarket/logs/api.log
StandardError=append:/opt/agentmarket/logs/api.err

[Install]
WantedBy=multi-user.target
```

启动：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now agentmarket-api
```

---

## 6. 前端部署

```bash
sudo -u agentmarket bash <<'EOF'
cd /opt/agentmarket/api/web
pnpm install --frozen-lockfile
pnpm build
EOF
```

### systemd unit `/etc/systemd/system/agentmarket-web.service`

```ini
[Unit]
Description=AgentMarketplace Web
After=network.target

[Service]
Type=simple
User=agentmarket
Group=agentmarket
WorkingDirectory=/opt/agentmarket/api/web
EnvironmentFile=/opt/agentmarket/.env
ExecStart=/usr/bin/node .next/standalone/server.js
Environment=PORT=3000
Restart=on-failure
RestartSec=3
StandardOutput=append:/opt/agentmarket/logs/web.log
StandardError=append:/opt/agentmarket/logs/web.err

[Install]
WantedBy=multi-user.target
```

---

## 7. Worker（v0.2）

`/etc/systemd/system/agentmarket-worker.service`

```ini
[Unit]
Description=AgentMarketplace chain event indexer
After=network.target redis.service agentmarket-api.service
Wants=redis.service

[Service]
Type=simple
User=agentmarket
Group=agentmarket
WorkingDirectory=/opt/agentmarket/api/api
EnvironmentFile=/opt/agentmarket/.env
ExecStart=/opt/agentmarket/api/api/.venv/bin/python -m app.worker
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 8. nginx 配置 `/etc/nginx/sites-available/agentmarket`

```nginx
upstream agentmarket_api { server 127.0.0.1:8000; keepalive 16; }
upstream agentmarket_web { server 127.0.0.1:3000; keepalive 16; }

server {
    listen 80;
    server_name agentmarket.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name agentmarket.example.com;

    ssl_certificate     /etc/letsencrypt/live/agentmarket.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agentmarket.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 200m;       # MCP App 上传上限

    # 静态资产（uploads / 截图）
    location /assets/ {
        alias /opt/agentmarket/data/uploads/;
        expires 30d;
        access_log off;
    }

    # API
    location /api/ {
        proxy_pass http://agentmarket_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Web
    location / {
        proxy_pass http://agentmarket_web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/agentmarket /etc/nginx/sites-enabled/
sudo certbot --nginx -d agentmarket.example.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. 环境变量 `/opt/agentmarket/.env`

```
APP_ENV=production
APP_SECRET=<32 字节 hex>
DATABASE_URL=sqlite:////opt/agentmarket/data/agentmarket.sqlite
REDIS_URL=redis://127.0.0.1:6379/0
JWT_SECRET=<64 字节 hex>
JWT_TTL_HOURS=168

UPLOADS_DIR=/opt/agentmarket/data/uploads
MAX_UPLOAD_MB_SKILL=10
MAX_UPLOAD_MB_AGENT=50
MAX_UPLOAD_MB_MCP=200

# v0.2
CHAIN_ID=11155111
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<KEY>
FACTORY_ADDRESS=0x...
INDEXER_START_BLOCK=...
PLATFORM_TREASURY=0x...
```

权限：`chmod 600 .env && chown agentmarket: .env`。

---

## 10. 备份

> 完整定时任务清单见 [09-scheduled-jobs.md](09-scheduled-jobs.md)。本节只列备份。

每天凌晨 3 点：

```bash
# /etc/cron.d/agentmarket-backup
0 3 * * * agentmarket /opt/agentmarket/scripts/backup.sh
```

`backup.sh`：
```bash
#!/usr/bin/env bash
set -e
DATE=$(date +%Y%m%d)
DIR=/opt/agentmarket/backups
mkdir -p "$DIR"

# DB（SQLite 用 .backup 命令保证一致性）
sqlite3 /opt/agentmarket/data/agentmarket.sqlite ".backup '$DIR/db-$DATE.sqlite'"

# Uploads（增量 rsync 到第二盘 / 远程）
rsync -a --delete /opt/agentmarket/data/uploads/ /opt/agentmarket/backups/uploads/

# 保留 30 天
find "$DIR" -name 'db-*.sqlite' -mtime +30 -delete
```

v0.5 迁 Postgres 后：`pg_dump -Fc` + 远程 S3-compatible 储存（Cloudflare R2）。

---

## 11. 监控

- **应用层**：FastAPI 日志走 stdout → systemd journal；前端用 Sentry（v0.2 起）
- **系统**：`node_exporter` + Grafana Cloud 免费 tier 看 CPU / mem / disk
- **链事件索引**：worker 每次成功索引一批 block 后写入 prometheus counter
- **告警**：
  - 服务挂了：systemd `OnFailure=` 钩子发到自托管 healthcheck.io / 邮件
  - 磁盘 > 80%
  - DB 文件 > 1GB（提示该迁 Postgres 了）

---

## 12. 灾难恢复演练（v0.2 末期做一次）

- 从备份重建 → 拉新 VPS → 拉 git → 拉 db backup → 拉 uploads → 启服务 → 通过 healthz
- 链事件索引器从 last_indexed_block 续跑，最多漏一会的事件，自愈

---

## 13. 上线 checklist（v0.1）

- [ ] 域名 + DNS A 记录指向 VPS
- [ ] HTTPS 证书 OK
- [ ] systemd 三个 unit (api / web / redis) 都 enabled 且 active
- [ ] `.env` 权限 600，secrets 已设
- [ ] alembic 迁移已 head
- [ ] 备份 cron 已生效
- [ ] `/api/healthz` 返回 200
- [ ] 首页 / 详情页 / 上传向导都能正常打开
- [ ] 提交一个测试 package 走通流程
- [ ] 评分提交走通流程
- [ ] nginx 限流 / fail2ban 启用
