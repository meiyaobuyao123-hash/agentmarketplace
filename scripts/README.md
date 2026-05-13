# scripts · 投融资爬虫

10 天一次从公开免费源抓 AI 投融资事件，合并写入 `frontend/data/funding.json`。

## 文件

| 文件 | 作用 |
|------|------|
| `crawl_funding.py` | 主入口（CLI：`--dry-run` / `--output PATH`） |
| `funding_sources/common.py` | 共享工具：金额规范化、日期解析、区域推断、`FundingEvent` dataclass |
| `funding_sources/aifundingtracker.py` | [AI Funding Tracker](https://aifundingtracker.com) parser |
| `funding_sources/crescendo.py` | [Crescendo AI](https://www.crescendo.ai/news/latest-vc-investment-deals-in-ai-startups) parser |
| `requirements.txt` | Python 依赖 |

## 本地试跑

```bash
# 装依赖
python3.12 -m venv /tmp/venv
/tmp/venv/bin/pip install -r requirements.txt

# 不写文件，看抓到多少
/tmp/venv/bin/python crawl_funding.py --dry-run

# 真写，但写到 /tmp（不动生产）
/tmp/venv/bin/python crawl_funding.py --output /tmp/funding-test.json --backup-dir /tmp/funding-test-backups
```

## 部署到服务器

服务器：`ubuntu@43.156.207.26`

```bash
# 1. 打包脚本传上去
cd /Users/wenruiwei/Desktop/agentMarketPlace
COPYFILE_DISABLE=1 tar -czf /tmp/agentmarket-scripts.tgz scripts deploy
scp /tmp/agentmarket-scripts.tgz ubuntu@43.156.207.26:/tmp/

# 2. ssh 上去安装
ssh ubuntu@43.156.207.26 <<'REMOTE'
set -e
# 创建目录
sudo mkdir -p /opt/agentmarket /var/lib/agentmarket/funding-backups
sudo chown ubuntu:ubuntu /opt/agentmarket /var/lib/agentmarket/funding-backups

# 解开脚本
tar -xzf /tmp/agentmarket-scripts.tgz -C /opt/agentmarket
mv /opt/agentmarket/scripts/crawl_funding.py /opt/agentmarket/scripts/  # 已在原位
ls /opt/agentmarket/scripts/

# 装 Python venv
python3 -m venv /opt/agentmarket/venv
/opt/agentmarket/venv/bin/pip install -r /opt/agentmarket/scripts/requirements.txt

# 装 systemd unit
sudo install -m 644 /opt/agentmarket/deploy/agentmarket-funding-crawl.service /etc/systemd/system/
sudo install -m 644 /opt/agentmarket/deploy/agentmarket-funding-crawl.timer /etc/systemd/system/

# 允许 ubuntu 用 sudo 跑 install 命令（写 webroot）
echo 'ubuntu ALL=(root) NOPASSWD: /usr/bin/install -o www-data -g www-data -m 644 /tmp/agentmarket-funding-new.json /var/www/agentmarketplace/data/funding.json' | sudo tee /etc/sudoers.d/agentmarket-funding-crawl
sudo chmod 440 /etc/sudoers.d/agentmarket-funding-crawl

# 启动 timer
sudo systemctl daemon-reload
sudo systemctl enable --now agentmarket-funding-crawl.timer
sudo systemctl list-timers agentmarket-funding-crawl.timer

# 手工 trigger 一次验证
sudo systemctl start agentmarket-funding-crawl.service
sleep 5
sudo systemctl status agentmarket-funding-crawl.service --no-pager
journalctl -u agentmarket-funding-crawl.service -n 20 --no-pager
REMOTE
```

## 调度

```
OnCalendar=*-*-1,11,21 03:00:00
Persistent=true
RandomizedDelaySec=15min
```

每月 1 / 11 / 21 日凌晨 3 点跑（约 10 天一次）。错过会补跑。

## 运维

### 看上次执行结果

```bash
# 看 timer 下次触发时间
systemctl list-timers agentmarket-funding-crawl.timer

# 看上次执行日志
journalctl -u agentmarket-funding-crawl.service -n 100 --no-pager

# 看 funding.json 当前事件数与更新时间
curl -s "https://www.ai100trading.cn/agentmarketplace/data/funding.json?v=$(date +%s)" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);print('events',len(d['events']),'updated',d['meta']['updated_at'])"
```

### 手动触发

```bash
sudo systemctl start agentmarket-funding-crawl.service
```

### 回滚

```bash
# 看最近 10 份备份
ls -lt /var/lib/agentmarket/funding-backups/

# 选一份恢复
sudo cp /var/lib/agentmarket/funding-backups/funding-YYYYMMDD-HHMMSS.json \
        /var/www/agentmarketplace/data/funding.json
```

### 暂停 timer

```bash
sudo systemctl disable --now agentmarket-funding-crawl.timer
```

## 失败兜底

| 情况 | 行为 |
|------|------|
| 任一源 fetch 失败 | log 错误，跳过该源；另一源仍写 |
| 解析 < 5 条 events | exit 2，不写文件，保留旧 funding.json |
| 文件写失败 | tmp + rename，失败留 backup |
| 重复 events | (company, date) 复合 key 去重，旧 events 优先保留 |

## 数据规约

每条 event 字段同 `frontend/data/funding.json` 已有 schema：

```json
{
  "id": "moonshot-ai-2026-05-strategic-abc123",
  "company": "Moonshot AI",
  "product": null,
  "round": "战略投资",
  "amount": "$2B",
  "amount_usd_m": 2000,
  "valuation": "$20B",
  "date": "2026-05-08",
  "region": "CN",
  "investors": ["Long-Z Investment"],
  "lead_investor": "Long-Z Investment",
  "description": "...",
  "source": { "name": "...", "url": "..." },
  "detail": { "full_description": "..." },
  "crawled_at": "2026-05-13T..."
}
```

参考 `frontend/data/funding.json` 头部 36 条手工 seed 作为字段完整性范本（爬虫产物字段可能稍少，详细描述等需要 manual 补）。
