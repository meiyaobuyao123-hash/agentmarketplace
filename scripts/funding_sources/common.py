"""共享工具：金额规范化、区域推断、id 生成、去重"""
from __future__ import annotations
import re
import hashlib
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Optional

# ---- 金额规范化 ----

_AMT_RE = re.compile(
    r'\$\s*([\d,]+(?:\.\d+)?)\s*([BbMmKk])(?:illion)?',
    re.IGNORECASE,
)


def parse_amount(s: str) -> tuple[Optional[str], Optional[float]]:
    """从字符串提取金额。
    返回 (display, amount_usd_m)，比如 ("$10B", 10000.0)。
    找不到返回 (None, None)。
    """
    if not s:
        return None, None
    m = _AMT_RE.search(s)
    if not m:
        # 也可能写成 "10 billion"
        m2 = re.search(r'\$?([\d,]+(?:\.\d+)?)\s*(billion|million|thousand)', s, re.IGNORECASE)
        if not m2:
            return None, None
        num = float(m2.group(1).replace(",", ""))
        unit = m2.group(2).lower()
        mult = {"billion": 1000, "million": 1, "thousand": 0.001}[unit]
        usd_m = num * mult
        display = _format_display(num, unit[0].upper())
        return display, usd_m

    num = float(m.group(1).replace(",", ""))
    unit = m.group(2).upper()
    if unit == "B":
        usd_m = num * 1000
    elif unit == "M":
        usd_m = num
    elif unit == "K":
        usd_m = num / 1000
    else:
        return None, None
    return _format_display(num, unit), usd_m


def _format_display(num: float, unit: str) -> str:
    """格式化为短显示，比如 10 → '$10B'，1.16 → '$1.16B'"""
    if num == int(num):
        return f"${int(num)}{unit}"
    return f"${num:g}{unit}"


# ---- 区域推断 ----

_REGION_KEYWORDS = {
    "CN": ["china", "chinese", "shanghai", "beijing", "shenzhen", "hangzhou",
           "字节", "百度", "腾讯", "阿里", "moonshot", "deepseek", "kimi", "doubao",
           "zhipu", "minimax", "stepfun", "01.ai"],
    "UK": ["uk", "british", "london", "england", "scotland",
           "wayve", "elevenlabs", "stability"],
    "EU": ["europe", "european", "germany", "german", "berlin", "munich",
           "france", "french", "paris", "netherlands", "dutch", "amsterdam",
           "sweden", "stockholm", "spain", "italian", "prior labs", "mistral",
           "legora", "quantware"],
    "JP": ["japan", "japanese", "tokyo"],
    "IN": ["india", "indian", "bangalore", "mumbai"],
    "IL": ["israel", "israeli", "tel aviv"],
    "SG": ["singapore"],
    "KR": ["korea", "korean", "seoul"],
}


def infer_region(text: str) -> str:
    """从公司名 / 描述推断 region。默认 US。"""
    lo = (text or "").lower()
    for region, keywords in _REGION_KEYWORDS.items():
        for kw in keywords:
            if kw in lo:
                return region
    return "US"


# ---- 轮次规范化 ----

_ROUND_PATTERNS = [
    (re.compile(r'series\s+([a-h])\b.{0,30}extension', re.IGNORECASE), lambda m: f"Series {m.group(1).upper()} 扩展"),
    (re.compile(r'series\s+([a-h])\b', re.IGNORECASE), lambda m: f"Series {m.group(1).upper()}"),
    (re.compile(r'\bseed\b', re.IGNORECASE), lambda m: "Seed"),
    (re.compile(r'pre[-\s]?seed', re.IGNORECASE), lambda m: "Pre-seed"),
    (re.compile(r'strategic', re.IGNORECASE), lambda m: "战略投资"),
    (re.compile(r'corporate\s+invest', re.IGNORECASE), lambda m: "企业投资"),
    (re.compile(r'm&a|acqui[-\s]?hire|acquisition', re.IGNORECASE), lambda m: "并购"),
    (re.compile(r'\bipo\b', re.IGNORECASE), lambda m: "IPO"),
    (re.compile(r'fund\s+(launch|raise|close)', re.IGNORECASE), lambda m: "基金募集"),
    (re.compile(r'late\s+stage', re.IGNORECASE), lambda m: "晚期"),
    (re.compile(r'tender\s+offer|secondary', re.IGNORECASE), lambda m: "二级市场"),
    (re.compile(r'mega[-\s]round|mega[-\s]funding', re.IGNORECASE), lambda m: "巨型融资"),
    (re.compile(r'merger', re.IGNORECASE), lambda m: "合并"),
]


def parse_round(text: str) -> str:
    """从字符串提取轮次，找不到返回 '未披露'"""
    if not text:
        return "未披露"
    for pat, repl in _ROUND_PATTERNS:
        m = pat.search(text)
        if m:
            return repl(m)
    return "未披露"


# ---- ID 生成 ----

def make_id(company: str, round_type: str, date: str) -> str:
    """生成稳定 id：company-slug + date + round suffix
    用 hash 兜底避免 slug 冲突。
    """
    slug = re.sub(r'[^a-z0-9]+', '-', company.lower()).strip('-')[:40]
    date_short = date[:7] if date else "xxxx-xx"
    round_short = re.sub(r'[^a-z0-9]+', '-', round_type.lower()).strip('-')[:20]
    h = hashlib.md5(f"{company}|{round_type}|{date}".encode()).hexdigest()[:6]
    return f"{slug}-{date_short}-{round_short}-{h}" if slug else f"event-{date_short}-{h}"


# ---- 日期解析 ----

_DATE_PATTERNS = [
    # ISO: 2026-05-08
    (re.compile(r'\b(\d{4})-(\d{2})-(\d{2})\b'), lambda m: f"{m.group(1)}-{m.group(2)}-{m.group(3)}"),
    # English: May 8, 2026 / May 8 2026
    (re.compile(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{4})\b', re.IGNORECASE),
     lambda m: _en_to_iso(m.group(1), m.group(2), m.group(3))),
    # "May 7-8, 2026" → 取后者
    (re.compile(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}[-–]\s*(\d{1,2})[,\s]+(\d{4})\b', re.IGNORECASE),
     lambda m: _en_to_iso(m.group(1), m.group(2), m.group(3))),
]

_MONTH_MAP = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
    "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}


def _en_to_iso(month: str, day: str, year: str) -> str:
    mm = _MONTH_MAP.get(month[:3].lower(), "01")
    dd = day.zfill(2)
    return f"{year}-{mm}-{dd}"


def parse_date(text: str) -> Optional[str]:
    """从字符串提取日期，返回 YYYY-MM-DD"""
    if not text:
        return None
    for pat, fmt in _DATE_PATTERNS:
        m = pat.search(text)
        if m:
            try:
                return fmt(m)
            except Exception:
                continue
    return None


# ---- Event dataclass ----

@dataclass
class FundingEvent:
    company: str
    round: str
    amount: str
    amount_usd_m: Optional[float]
    date: str
    region: str
    description: str
    source: dict
    id: str = ""
    product: Optional[str] = None
    valuation: Optional[str] = None
    investors: list = field(default_factory=list)
    lead_investor: Optional[str] = None
    industry_tags: list = field(default_factory=list)
    detail: dict = field(default_factory=dict)
    crawled_at: str = ""

    def __post_init__(self):
        if not self.id:
            self.id = make_id(self.company, self.round, self.date)
        if not self.crawled_at:
            self.crawled_at = datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%SZ")

    def dedup_key(self) -> tuple:
        # (company, date) — 不带 round 是因为不同源 round 名常不一致
        return (self.company.lower().strip(), self.date)

    def to_dict(self) -> dict:
        return asdict(self)
