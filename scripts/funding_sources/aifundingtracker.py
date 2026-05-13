"""AI Funding Tracker parser (https://aifundingtracker.com)

页面结构：
  <h2> May 7-8, 2026 </h2>
  <div> N deals · Company1 $XB · Company2 $YM (Lead) · Company3 $ZM context </div>

每个日期下一个 <div>，里面用 " · " 分隔每笔 deal。
"""
from __future__ import annotations
import re
import logging
import httpx
from bs4 import BeautifulSoup
from .common import FundingEvent, parse_amount, parse_round, parse_date, infer_region

log = logging.getLogger(__name__)

URL = "https://aifundingtracker.com/ai-startup-funding-news-today/"
SOURCE_NAME = "AI Funding Tracker"


def fetch_aifundingtracker(timeout: float = 30.0) -> list[FundingEvent]:
    """爬取 AI Funding Tracker，返回 FundingEvent list."""
    log.info(f"fetching {URL}")
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 agentmarket-crawler/1.0"}
    with httpx.Client(headers=headers, timeout=timeout, follow_redirects=True) as c:
        r = c.get(URL)
        r.raise_for_status()
        html = r.text
    return parse_aifundingtracker_html(html)


def parse_aifundingtracker_html(html: str) -> list[FundingEvent]:
    soup = BeautifulSoup(html, "lxml")
    article = soup.find("article") or soup.find("main")
    if not article:
        log.warning("no article tag found")
        return []

    events: list[FundingEvent] = []
    for h2 in article.find_all("h2"):
        date_text = h2.get_text(strip=True)
        date_iso = parse_date(date_text)
        if not date_iso:
            continue
        sib = h2.find_next_sibling()
        if not sib:
            continue
        full = sib.get_text(" ", strip=True)
        # split by middle dot " · "
        parts = [p.strip() for p in full.split("·")]
        if len(parts) < 2:
            continue
        # 第一项是 "N deals" / "N signals" / "N market signals" 之类，跳过
        for piece in parts[1:]:
            event = _parse_deal_piece(piece, date_iso)
            if event:
                events.append(event)

    log.info(f"parsed {len(events)} events from AI Funding Tracker")
    return events


def _parse_deal_piece(text: str, date_iso: str) -> FundingEvent | None:
    """从一段 deal 字符串提取 event。
    例：
      "Moonshot AI $2B"
      "Prior Labs $1.16B (SAP)"
      "Ineffable Intelligence $1.1B seed"
      "Wayve $60M chip extension"
      "OpenAI acquires Hiro Finance"  (无金额)
      "LatAm Q1 crosses $1B" (信号类，跳过)
    """
    text = text.strip()
    if not text or len(text) < 4:
        return None

    # 信号类（"Q1"、"crosses"、"funding"、"momentum" 等关键词），跳过
    signal_kw = ["crosses", "funding bifurcation", "momentum", "signal", "milestone", "ytd", "regional"]
    lo = text.lower()
    if any(kw in lo for kw in signal_kw) and not re.search(r'series|seed', lo):
        return None

    amt_display, amt_m = parse_amount(text)
    if not amt_display or not amt_m:
        # 没金额 → 跳过（acquire 类暂不入库）
        return None

    # 抽公司名：第一个 "$" 之前 + 去掉 "raises/acquires" 等
    dollar_idx = text.find("$")
    company_raw = text[:dollar_idx].strip().rstrip(",")
    # 去掉常见连接词后缀
    company_raw = re.sub(r'\s+(raises?|secures?|lands?|closes?|hits|gets|kicks|emerges|wraps|raised|raises a|to raise|valued at|acquires?|with).*$',
                          '', company_raw, flags=re.IGNORECASE)
    company = company_raw.strip()
    if not company or len(company) < 2:
        return None

    # 抽 lead 投资方：（xxx）
    lead = None
    investors = []
    m = re.search(r'\(([^)]+)\)', text)
    if m:
        lead = m.group(1).strip()
        investors = [lead]

    # 抽轮次：text 整体里找 series/seed
    round_type = parse_round(text)

    # description：去掉公司 + 金额 + 投资方括号后剩余
    desc = text
    if lead:
        desc = re.sub(r'\([^)]+\)', '', desc).strip()
    desc = desc.replace(amt_display, '').strip()
    if desc.startswith(company):
        desc = desc[len(company):].strip()

    region = infer_region(company + " " + desc)

    return FundingEvent(
        company=company,
        product=None,
        round=round_type,
        amount=amt_display,
        amount_usd_m=amt_m,
        date=date_iso,
        region=region,
        description=desc[:200] if desc else f"{company} 完成 {round_type} {amt_display}",
        source={"name": SOURCE_NAME, "url": URL},
        investors=investors,
        lead_investor=lead,
        industry_tags=[],
        detail={"full_description": desc[:500] if desc else ""},
    )
