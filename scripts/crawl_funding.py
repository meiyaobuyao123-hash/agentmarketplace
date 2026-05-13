#!/usr/bin/env python3
"""AgentMarketplace · 投融资爬虫主入口

Run:
  python crawl_funding.py             # 真正爬 + 写 funding.json
  python crawl_funding.py --dry-run   # 只爬不写
  python crawl_funding.py --output PATH

调度：systemd timer，每月 1/11/21 日 03:00 跑（≈ 10 天）。
依赖：httpx, beautifulsoup4, lxml, python-dateutil
"""
from __future__ import annotations
import argparse
import json
import logging
import os
import shutil
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

# 确保可以 import funding_sources（无论从哪儿调用）
sys.path.insert(0, str(Path(__file__).resolve().parent))

from funding_sources import fetch_aifundingtracker, fetch_crescendo, FundingEvent  # noqa: E402

DEFAULT_OUTPUT = "/var/www/agentmarketplace/data/funding.json"
DEFAULT_BACKUP_DIR = "/var/lib/agentmarket/funding-backups"
MIN_EVENTS_GUARD = 5  # 解析到 < 此数 → 视为页面坏了，skip 写入
BACKUP_KEEP = 10

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s · %(message)s",
)
log = logging.getLogger("crawl_funding")


def crawl_all() -> list[FundingEvent]:
    """从所有 source 爬取，合并 + 去重。"""
    all_events: list[FundingEvent] = []

    for fetcher in (fetch_aifundingtracker, fetch_crescendo):
        try:
            events = fetcher()
            all_events.extend(events)
        except Exception as e:
            log.error(f"{fetcher.__name__} failed: {e}", exc_info=True)

    # 去重：按 dedup_key 取第一个出现的
    seen = {}
    for e in all_events:
        key = e.dedup_key()
        if key not in seen:
            seen[key] = e
        else:
            # 已存在：用更详细的（描述更长 / 字段更全）替换
            old = seen[key]
            if len(e.description or "") > len(old.description or ""):
                seen[key] = e
    return list(seen.values())


def load_existing(path: str) -> dict:
    """读现有 funding.json，没文件返回空骨架。"""
    if not os.path.exists(path):
        return {
            "meta": {
                "updated_at": "",
                "next_crawl_due": "",
                "sources": [],
                "events_count": 0,
                "methodology": "AI 投融资事件聚合（免费源，10 天一爬）",
            },
            "events": [],
        }
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def merge(existing: dict, new_events: list[FundingEvent]) -> dict:
    """合并新事件到现有 JSON。
    - 以 (company.lower(), round.lower(), date) 为 key 去重
    - 现有 events 保留（含手工详细描述）
    - 新事件：key 不在 existing → 加进去
    """
    existing_keys = set()
    for e in existing.get("events", []):
        # 与 FundingEvent.dedup_key() 一致：(company, date)
        key = (e.get("company", "").lower().strip(), e.get("date", ""))
        existing_keys.add(key)

    merged_events = list(existing.get("events", []))
    added = 0
    for ev in new_events:
        if ev.dedup_key() not in existing_keys:
            merged_events.append(ev.to_dict())
            existing_keys.add(ev.dedup_key())
            added += 1

    # 按 date 倒序
    merged_events.sort(key=lambda x: x.get("date", ""), reverse=True)

    today = datetime.now().strftime("%Y-%m-%d")
    next_due = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")

    return {
        "meta": {
            "updated_at": today,
            "next_crawl_due": next_due,
            "sources": [
                {"name": "AI Funding Tracker", "url": "https://aifundingtracker.com/ai-startup-funding-news-today/"},
                {"name": "Crescendo AI VC Deals", "url": "https://www.crescendo.ai/news/latest-vc-investment-deals-in-ai-startups"},
            ],
            "events_count": len(merged_events),
            "methodology": existing.get("meta", {}).get(
                "methodology",
                "AI 投融资事件聚合（免费源，10 天一爬）。amount_usd_m 单位为百万美元；日期为公开宣布日",
            ),
            "last_crawl_added": added,
        },
        "events": merged_events,
    }


def backup_existing(path: str, backup_dir: str) -> None:
    """备份当前 funding.json 到 backup_dir。"""
    if not os.path.exists(path):
        return
    os.makedirs(backup_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    dst = os.path.join(backup_dir, f"funding-{ts}.json")
    shutil.copy2(path, dst)
    log.info(f"backup → {dst}")
    # 清理只保留最近 N 份
    backups = sorted(
        (f for f in os.listdir(backup_dir) if f.startswith("funding-") and f.endswith(".json")),
        reverse=True,
    )
    for old in backups[BACKUP_KEEP:]:
        try:
            os.remove(os.path.join(backup_dir, old))
        except OSError:
            pass


def write_atomic(path: str, data: dict) -> None:
    """原子写入：先 tmp 后 rename"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default=DEFAULT_OUTPUT, help=f"funding.json 输出路径（默认 {DEFAULT_OUTPUT})")
    ap.add_argument("--merge-from", default=None,
                     help="先从这个路径读取现有 events 做 merge（保留旧数据）。默认 = --output 路径")
    ap.add_argument("--backup-dir", default=DEFAULT_BACKUP_DIR)
    ap.add_argument("--dry-run", action="store_true", help="只爬不写文件")
    ap.add_argument("--min-events", type=int, default=MIN_EVENTS_GUARD)
    args = ap.parse_args()

    log.info("=== crawl_funding START ===")
    t0 = time.time()
    new_events = crawl_all()
    elapsed = time.time() - t0
    log.info(f"crawled {len(new_events)} events in {elapsed:.1f}s")

    if len(new_events) < args.min_events:
        log.error(f"only {len(new_events)} events parsed (< {args.min_events}) — page structure changed? aborting write")
        sys.exit(2)

    if args.dry_run:
        log.info("--dry-run: skipping write. Sample of new events:")
        for e in new_events[:5]:
            d = e.to_dict()
            log.info(f"  · {d['date']} {d['company']:30} {d['round']:15} {d['amount']}")
        return

    merge_source = args.merge_from or args.output
    existing = load_existing(merge_source)
    log.info(f"merging with {merge_source} ({len(existing.get('events', []))} existing events)")
    merged = merge(existing, new_events)
    added = merged["meta"]["last_crawl_added"]

    backup_existing(args.output, args.backup_dir)
    write_atomic(args.output, merged)
    log.info(f"wrote {len(merged['events'])} events to {args.output} ({added} new)")
    log.info("=== crawl_funding DONE ===")


if __name__ == "__main__":
    main()
