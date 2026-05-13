"""Crescendo AI parser (https://www.crescendo.ai/news/latest-vc-investment-deals-in-ai-startups)

页面结构：
  <h3> Company Story Title with $XB amount </h3>
  <ul>
    <li>When: April 3, 2026</li>
    <li>Recipient Company: ...</li>
    <li>Investors: ...</li>
    <li>Details: ...</li>
  </ul>
"""
from __future__ import annotations
import re
import logging
import httpx
from bs4 import BeautifulSoup
from .common import FundingEvent, parse_amount, parse_round, parse_date, infer_region

log = logging.getLogger(__name__)

URL = "https://www.crescendo.ai/news/latest-vc-investment-deals-in-ai-startups"
SOURCE_NAME = "Crescendo AI"


def fetch_crescendo(timeout: float = 30.0) -> list[FundingEvent]:
    log.info(f"fetching {URL}")
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 agentmarket-crawler/1.0"}
    with httpx.Client(headers=headers, timeout=timeout, follow_redirects=True) as c:
        r = c.get(URL)
        r.raise_for_status()
        html = r.text
    return parse_crescendo_html(html)


def parse_crescendo_html(html: str) -> list[FundingEvent]:
    soup = BeautifulSoup(html, "lxml")
    events: list[FundingEvent] = []

    for h3 in soup.find_all("h3"):
        title = h3.get_text(strip=True)
        # 必须含 $ amount 才视为 deal
        if "$" not in title and "€" not in title:
            continue
        # 找下一个 <ul>
        ul = h3.find_next("ul")
        if not ul:
            continue
        meta = _parse_ul(ul)
        # 必须有 When（日期），否则丢
        if not meta.get("when"):
            continue
        date_iso = parse_date(meta["when"])
        if not date_iso:
            continue

        event = _build_event(title, meta, date_iso)
        if event:
            events.append(event)

    log.info(f"parsed {len(events)} events from Crescendo AI")
    return events


def _parse_ul(ul) -> dict:
    """从 <ul> 提取 When / Recipient Company / Investors / Details"""
    meta = {}
    for li in ul.find_all("li"):
        t = li.get_text(strip=True)
        for key in ("When", "Recipient Company", "Investors", "Details", "Date"):
            if t.startswith(key + ":") or t.startswith(key + " :"):
                meta[key.lower().replace(" ", "_")] = t.split(":", 1)[1].strip()
                break
    return meta


def _build_event(title: str, meta: dict, date_iso: str) -> FundingEvent | None:
    # 抽金额：标题里第一个 $XX
    amt_display, amt_m = parse_amount(title)
    if not amt_display or not amt_m:
        return None

    # 抽公司名：从 recipient 字段最好；否则从标题第一个动词前
    company = None
    recipient = meta.get("recipient_company", "")
    if recipient:
        # "OpenAI (San Francisco-based AI research company)" → "OpenAI"
        company = re.split(r'\s*[\(（]', recipient, 1)[0].strip()
    if not company or len(company) < 2:
        # 从标题里取：第一个动词之前
        m = re.match(r'([A-Z][A-Za-z0-9\.\s&\-]+?)\s+(Plants|Raises?|Closes?|Lands?|Secures?|Hits|Gets|Kicks|Emerges|Is|Turns|Wants|Goes|Wraps|Adds|Beat|Announces?)\b',
                     title)
        if m:
            company = m.group(1).strip()
        else:
            return None

    # 投资方 list
    investors_raw = meta.get("investors", "")
    investors = []
    lead = None
    if investors_raw:
        # 处理 "(direct corporate investment)" 这类描述
        clean = re.sub(r'\([^)]*\)', '', investors_raw).strip()
        # 多个用逗号或 and 分
        parts = re.split(r',\s*|\s+and\s+', clean)
        investors = [p.strip() for p in parts if p.strip() and len(p.strip()) < 60]
        if investors:
            lead = investors[0]

    # 轮次
    round_type = parse_round(title + " " + meta.get("details", ""))

    # description
    desc_full = meta.get("details", "").strip()
    short_desc = desc_full[:200] if desc_full else title

    # region
    region = infer_region(company + " " + desc_full + " " + recipient)

    # 估值：标题或描述里"valuation $X"
    val_m = re.search(r'(?:valuation|valued at|\$\s*[\d.,]+[BMK])\s+\$?([\d.,]+\s*[BMK])', desc_full, re.IGNORECASE)
    valuation = None
    val_m2 = re.search(r'\$([\d.,]+\s*[BMK])\s+valuation', desc_full + " " + title, re.IGNORECASE)
    if val_m2:
        valuation = f"${val_m2.group(1).replace(' ','')}"

    return FundingEvent(
        company=company,
        product=None,
        round=round_type,
        amount=amt_display,
        amount_usd_m=amt_m,
        valuation=valuation,
        date=date_iso,
        region=region,
        description=short_desc,
        source={"name": SOURCE_NAME, "url": URL},
        investors=investors,
        lead_investor=lead,
        industry_tags=[],
        detail={
            "full_description": desc_full[:800] if desc_full else "",
            "company_website": "",
        },
    )
