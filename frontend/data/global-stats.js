/* AgentMarketplace · 全球大模型观测台
 * 月度更新一次，下次更新 due: 2026-06
 * 更新流程见同目录 README.md
 *
 * 字段约定：
 *   stats[].label  口径，如 MAU / DAU / WAU / ARR / 估值 / 市值 / 份额 / Tokens/day
 *   stats[].value  数值（带单位的字符串）
 *   stats[].asof   截止时间（YYYY-MM 或 YYYY-Q1 或 YYYY-末）
 *   "~" 表示非官方公开估算 · "未披露" / "—" 表示数据缺失
 *
 * 单位约定：
 *   M = 百万 · B = 十亿美元 · T = 万亿（token 量）
 */
window.GLOBAL_STATS = {
  meta: {
    updated_at: "2026-05",
    next_update_due: "2026-06",
    note: "数据手工收集自公开新闻 / 财报 / 第三方统计；非官方 API",
    methodology: "国家维度用 ChatGPT 用户基数为代理；中国维度合并本土模型，未含翻墙因素"
  },

  // ─────────────────────────────────────
  // Top 10 国家（按 AI / LLM 用户基数代理）
  // ─────────────────────────────────────
  countries: [
    {
      rank: 1,  code: "CN", cn: "中国",   en: "China",          trend: "↑↑",
      metric_label: "本土模型聚合",
      value: "豆包 DAU 100M+ · DeepSeek MAU 130M · 文心 DAU 50M+",
      asof: "2026-Q1"
    },
    {
      rank: 2,  code: "US", cn: "美国",   en: "United States",  trend: "↑",
      metric_label: "ChatGPT 用户",
      value: "205M",
      asof: "2026-04"
    },
    {
      rank: 3,  code: "IN", cn: "印度",   en: "India",          trend: "↑↑",
      metric_label: "ChatGPT 用户",
      value: "198M（DAU 36% 全球第一）",
      asof: "2026-04"
    },
    {
      rank: 4,  code: "BR", cn: "巴西",   en: "Brazil",         trend: "↑",
      metric_label: "ChatGPT 用户", value: "69.6M", asof: "2026-04"
    },
    {
      rank: 5,  code: "CA", cn: "加拿大", en: "Canada",         trend: "→",
      metric_label: "ChatGPT 用户", value: "64.8M", asof: "2026-04"
    },
    {
      rank: 6,  code: "FR", cn: "法国",   en: "France",         trend: "↑",
      metric_label: "ChatGPT 用户", value: "51.6M", asof: "2026-04"
    },
    {
      rank: 7,  code: "DE", cn: "德国",   en: "Germany",        trend: "↑",
      metric_label: "ChatGPT 用户", value: "~45M", asof: "2026-04"
    },
    {
      rank: 8,  code: "GB", cn: "英国",   en: "United Kingdom", trend: "→",
      metric_label: "ChatGPT 用户", value: "~42M", asof: "2026-04"
    },
    {
      rank: 9,  code: "JP", cn: "日本",   en: "Japan",          trend: "→",
      metric_label: "ChatGPT 用户", value: "~35M", asof: "2026-04"
    },
    {
      rank: 10, code: "ID", cn: "印尼",   en: "Indonesia",      trend: "↑↑",
      metric_label: "ChatGPT 用户", value: "~30M", asof: "2026-04"
    }
  ],

  // ─────────────────────────────────────
  // Top 10 大模型 / 公司
  // 每行 stats[] 含 3 个核心数据，每个带 label + value + asof
  // ─────────────────────────────────────
  models: [
    {
      rank: 1, country: "🇺🇸", company: "OpenAI", product: "ChatGPT",
      note: "用户量与收入综合第一；GPT 系列定调行业",
      stats: [
        { label: "MAU",  value: "320M",  asof: "2026-03" },
        { label: "ARR",  value: "$25B",  asof: "2026-02" },
        { label: "估值", value: "$500B", asof: "2025-Q1 · SoftBank F" }
      ]
    },
    {
      rank: 2, country: "🇺🇸", company: "Google", product: "Gemini",
      note: "走 Google 全家桶分发；AI Overviews 触达 2B",
      stats: [
        { label: "MAU",       value: "750M",  asof: "2026-Q1" },
        { label: "订阅 ARR",  value: "$1.2B", asof: "2025" },
        { label: "Alphabet 市值", value: "~$2T", asof: "2026-04" }
      ]
    },
    {
      rank: 3, country: "🇺🇸", company: "Anthropic", product: "Claude",
      note: "ARR 增长率全行业最猛（半年 ×3）",
      stats: [
        { label: "MAU",  value: "18.9M",  asof: "2026-01" },
        { label: "ARR",  value: "$44B+",  asof: "2026-05" },
        { label: "估值", value: "$380B",  asof: "2026-02 · G 轮" }
      ]
    },
    {
      rank: 4, country: "🇨🇳", company: "ByteDance · 字节跳动", product: "豆包 Doubao",
      note: "中国市场 49% 份额；日处理 63 万亿 token",
      stats: [
        { label: "DAU",         value: "100M+",   asof: "2026-Q1" },
        { label: "Tokens / 日", value: "63T",     asof: "2026-Q1" },
        { label: "字节估值",     value: "~$300B+", asof: "2026" }
      ]
    },
    {
      rank: 5, country: "🇨🇳", company: "DeepSeek", product: "DeepSeek",
      note: "开源 + 极致性价比；海外存在感最强的中国模型",
      stats: [
        { label: "MAU",  value: "130M",  asof: "2025-末" },
        { label: "ARR",  value: "$220M", asof: "2025-中" },
        { label: "估值", value: "$3.4B", asof: "2025-Q1 · C 轮" }
      ]
    },
    {
      rank: 6, country: "🇺🇸", company: "xAI", product: "Grok",
      note: "增长最快（一年 9×）；SpaceX 合并 combined $1.25T",
      stats: [
        { label: "MAU",  value: "64M",   asof: "2026-01" },
        { label: "ARR",  value: "$350M", asof: "2025" },
        { label: "估值", value: "$230B", asof: "2026-01 · E 轮" }
      ]
    },
    {
      rank: 7, country: "🇺🇸", company: "Microsoft", product: "Copilot",
      note: "365 套件深度集成；AI 收入并入 Microsoft Cloud",
      stats: [
        { label: "MAU",      value: "未单披",  asof: "—" },
        { label: "Cloud Q1", value: "$20B",    asof: "2026-Q1" },
        { label: "MSFT 市值", value: "~$3.7T", asof: "2026-04" }
      ]
    },
    {
      rank: 8, country: "🇨🇳", company: "Baidu · 百度", product: "文心 ERNIE",
      note: "依托百度搜索分发；春节红包后 MAU ×4",
      stats: [
        { label: "DAU",      value: "50M+",   asof: "2026-02" },
        { label: "ARR",      value: "未披露", asof: "—" },
        { label: "百度市值", value: "~$30B",  asof: "2026-04" }
      ]
    },
    {
      rank: 9, country: "🇨🇳", company: "Tencent · 腾讯", product: "元宝 Yuanbao",
      note: "微信生态加持；消费端 AI 助手",
      stats: [
        { label: "DAU",      value: "50M+",   asof: "2026-Q1" },
        { label: "ARR",      value: "未披露", asof: "—" },
        { label: "腾讯市值", value: "~$500B", asof: "2026-04" }
      ]
    },
    {
      rank: 10, country: "🇨🇳", company: "Moonshot AI · 月之暗面", product: "Kimi",
      note: "长上下文卡位；BAT 阴影下挣扎",
      stats: [
        { label: "MAU",  value: "数千万", asof: "2025-Q4" },
        { label: "ARR",  value: "未披露", asof: "—" },
        { label: "估值", value: "$3B+",   asof: "2024" }
      ]
    }
  ],

  // ─────────────────────────────────────
  // 数据使用注意
  // ─────────────────────────────────────
  notes: [
    "MAU/DAU/WAU 口径不同公司不一致（OpenAI 多报月活、字节多报日活）；不要硬换算",
    "国家维度本身没有公开 token 消耗数据，此为代理指标（ChatGPT 用户基数 + 中国本土模型聚合）",
    "估值：上市公司用整体市值（Alphabet/MSFT/百度/腾讯），私有公司用最近一轮 post-money",
    "ARR = run-rate 年化，不等于实际财年收入"
  ],

  // ─────────────────────────────────────
  // 数据来源
  // ─────────────────────────────────────
  sources: [
    { name: "OpenAI Statistics 2026",                   url: "https://searchlab.nl/en/statistics/openai-statistics-2026" },
    { name: "Claude Statistics — Business of Apps",     url: "https://www.businessofapps.com/data/claude-statistics/" },
    { name: "TechCrunch · Gemini 750M MAU",              url: "https://techcrunch.com/2026/02/04/googles-gemini-app-has-surpassed-750m-monthly-active-users/" },
    { name: "DeepSeek Statistics — Demandsage",          url: "https://www.demandsage.com/deepseek-statistics/" },
    { name: "Grok Statistics — SQ Magazine",             url: "https://sqmagazine.co.uk/grok-ai-statistics/" },
    { name: "Top Countries Using ChatGPT — Fineducke",   url: "https://fineducke.com/articles/1046/ranking-chatgpt-usage-by-country" },
    { name: "2026 中国 AI 大模型排行榜 · 腾讯新闻",      url: "https://news.qq.com/rain/a/20260305A0668M00" },
    { name: "Kimi 们活在 BAT 阴影下 · 36 氪",            url: "https://36kr.com/p/3666029611099010" }
  ]
};
