/* AgentMarketplace · 全球大模型观测数据
 * 月度更新一次，下次更新 due: 2026-06
 * 更新流程见同目录 README.md
 *
 * 数据收集自公开新闻 / 财报 / 第三方统计；不是各公司官方 API。
 * 单位约定：MAU/DAU 用 M（百万），ARR/估值用 B（十亿美元），
 * 数字带 ~ 表示非官方公开估算。
 */
window.GLOBAL_STATS = {
  meta: {
    updated_at: "2026-05",
    next_update_due: "2026-06",
    note: "手工收集，月度刷新一次"
  },

  // ─────────────────────────────────────
  // Top 10 国家（按 AI / LLM 用户基数；中国合并本土模型）
  // 主要源：ChatGPT 国家用户数 + 中国本土模型 DAU
  // 注意：国家维度的"token 消耗"没有公开数据，此为代理指标
  // ─────────────────────────────────────
  countries: [
    { rank: 1,  code: "CN", cn: "中国",     en: "China",          metric: "本土模型综合", value: "DeepSeek 130M MAU · 豆包 100M+ DAU · 文心 50M+ DAU", trend: "↑↑" },
    { rank: 2,  code: "US", cn: "美国",     en: "United States",  metric: "ChatGPT 用户", value: "205M",       trend: "↑"   },
    { rank: 3,  code: "IN", cn: "印度",     en: "India",          metric: "ChatGPT 用户", value: "198M",       trend: "↑↑"  },
    { rank: 4,  code: "BR", cn: "巴西",     en: "Brazil",         metric: "ChatGPT 用户", value: "69.6M",      trend: "↑"   },
    { rank: 5,  code: "CA", cn: "加拿大",   en: "Canada",         metric: "ChatGPT 用户", value: "64.8M",      trend: "→"   },
    { rank: 6,  code: "FR", cn: "法国",     en: "France",         metric: "ChatGPT 用户", value: "51.6M",      trend: "↑"   },
    { rank: 7,  code: "DE", cn: "德国",     en: "Germany",        metric: "ChatGPT 用户", value: "~45M",       trend: "↑"   },
    { rank: 8,  code: "GB", cn: "英国",     en: "United Kingdom", metric: "ChatGPT 用户", value: "~42M",       trend: "→"   },
    { rank: 9,  code: "JP", cn: "日本",     en: "Japan",          metric: "ChatGPT 用户", value: "~35M",       trend: "→"   },
    { rank: 10, code: "ID", cn: "印尼",     en: "Indonesia",      metric: "ChatGPT 用户", value: "~30M",       trend: "↑↑"  }
  ],

  // ─────────────────────────────────────
  // Top 10 大模型 / 公司
  // MAU 单位 M=百万；ARR/估值单位 B=十亿美元
  // estimate=非官方公开估算；na=未披露
  // ─────────────────────────────────────
  models: [
    {
      rank: 1, company: "OpenAI",    product: "ChatGPT",
      country: "🇺🇸",
      mau: "320M", aux: "WAU 900M",
      arr: "$25B",  valuation: "$500B",
      note: "用户量 + 收入综合第一",
      asof: "2026-02"
    },
    {
      rank: 2, company: "Google",    product: "Gemini",
      country: "🇺🇸",
      mau: "750M", aux: "AI Overviews 触达 2B",
      arr: "$1.2B (订阅)", valuation: "Alphabet ~$2T",
      note: "MAU 第一；走 Google 全家桶分发",
      asof: "2026-Q1"
    },
    {
      rank: 3, company: "Anthropic", product: "Claude",
      country: "🇺🇸",
      mau: "18.9M", aux: "App MAU 12.5M",
      arr: "$44B+", valuation: "$380B (G 轮)",
      note: "ARR 增长率最猛（半年 ×3）",
      asof: "2026-05"
    },
    {
      rank: 4, company: "ByteDance", product: "豆包 Doubao",
      country: "🇨🇳",
      mau: "—", aux: "DAU 100M+",
      arr: "未披露", valuation: "字节估 ~$300B+",
      note: "中国市场 49% 份额，日处理 63 万亿 token",
      asof: "2026-Q1"
    },
    {
      rank: 5, company: "DeepSeek",  product: "DeepSeek",
      country: "🇨🇳",
      mau: "130M", aux: "Web 350M visits/月",
      arr: "$220M", valuation: "$3.4B (C 轮)",
      note: "开源 + 极致性价比；海外存在感最强的中国模型",
      asof: "2025-mid"
    },
    {
      rank: 6, company: "xAI",       product: "Grok",
      country: "🇺🇸",
      mau: "64M", aux: "App $12M/月",
      arr: "$350M", valuation: "$230B (E 轮)",
      note: "增长最快（一年 ~9×）；与 SpaceX 合并 combined $1.25T",
      asof: "2026-01"
    },
    {
      rank: 7, company: "Microsoft", product: "Copilot",
      country: "🇺🇸",
      mau: "—", aux: "365 集成深",
      arr: "未单列", valuation: "MSFT 市值 ~$3.7T",
      note: "AI 收入并入 Microsoft Cloud；不单列",
      asof: "2026-Q1"
    },
    {
      rank: 8, company: "百度 Baidu", product: "文心 ERNIE",
      country: "🇨🇳",
      mau: "—", aux: "DAU 50M+",
      arr: "未披露", valuation: "百度市值 ~$30B",
      note: "依托百度搜索分发",
      asof: "2026-02"
    },
    {
      rank: 9, company: "腾讯 Tencent", product: "元宝 Yuanbao",
      country: "🇨🇳",
      mau: "—", aux: "DAU 50M+",
      arr: "未披露", valuation: "腾讯市值 ~$500B",
      note: "微信生态加持",
      asof: "2026-Q1"
    },
    {
      rank: 10, company: "Moonshot AI", product: "Kimi",
      country: "🇨🇳",
      mau: "tens of M", aux: "—",
      arr: "未披露", valuation: "$3B+ (2024)",
      note: "长上下文卡位；BAT 阴影下挣扎",
      asof: "2025-Q4"
    }
  ],

  // ─────────────────────────────────────
  // 数据使用注意（脚注用）
  // ─────────────────────────────────────
  notes: [
    "国家维度基于 ChatGPT 用户基数估算；中国维度合并本土模型，未含翻墙因素",
    "估值：上市公司用整体市值（Alphabet/MSFT/百度/腾讯），私有公司用最近一轮 post-money",
    "ARR = 年化运营收入（run-rate），不等于实际财年收入",
    "MAU 口径不统一：OpenAI/Google 报月活、Anthropic 多报周活、字节多报日活，不完全可比",
    "数据每月手工更新一次；下次更新时刷新 meta.updated_at 与各 asof"
  ],

  // ─────────────────────────────────────
  // 数据来源（用于脚注引用）
  // ─────────────────────────────────────
  sources: [
    { id: "openai-stats",     name: "OpenAI Statistics 2026",          url: "https://searchlab.nl/en/statistics/openai-statistics-2026" },
    { id: "anthropic-claude", name: "Claude Statistics / Reuters",      url: "https://www.businessofapps.com/data/claude-statistics/" },
    { id: "gemini-techcrunch", name: "TechCrunch Gemini 750M MAU",       url: "https://techcrunch.com/2026/02/04/googles-gemini-app-has-surpassed-750m-monthly-active-users/" },
    { id: "deepseek-stats",   name: "DeepSeek AI Statistics 2026",      url: "https://www.demandsage.com/deepseek-statistics/" },
    { id: "grok-sq",          name: "Grok AI Statistics SQ Magazine",   url: "https://sqmagazine.co.uk/grok-ai-statistics/" },
    { id: "country-rank",     name: "Top 10 Countries Using ChatGPT",   url: "https://fineducke.com/articles/1046/ranking-chatgpt-usage-by-country" },
    { id: "cn-rank-tencent",  name: "2026 中国 AI 大模型排行榜（腾讯）", url: "https://news.qq.com/rain/a/20260305A0668M00" },
    { id: "cn-rank-36kr",     name: "Kimi 们活在 BAT 阴影下（36氪）",    url: "https://36kr.com/p/3666029611099010" }
  ]
};
