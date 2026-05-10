/* AgentMarketplace · 全球大模型观测台
 * 月度更新一次，下次更新 due: 2026-06
 * 更新流程见同目录 README.md
 *
 * 字段约定：
 *   stats[].label  口径：MAU / WAU / DAU / ARR / 估值 / 市值 / 份额 / 订阅 / Tokens / day
 *   stats[].value  数值（带单位的字符串）
 *   stats[].asof   截止时间（YYYY-MM 或 YYYY-Qn）；含融资轮次说明
 *   "~" 表示估算 · "未披露" / "—" 表示数据缺失
 *
 * 单位约定：
 *   M = 百万 · B = 十亿美元 · T = 万亿（token 量）
 *
 * 注意 MAU/WAU 口径不同公司不一致：
 *   - OpenAI / Anthropic 偏报 WAU
 *   - Google / Meta / 字节 偏报 MAU
 *   - 国内公司偏报 DAU
 *   不要硬换算，本表保留各家原始口径
 */
window.GLOBAL_STATS = {
  meta: {
    updated_at: "2026-05",
    next_update_due: "2026-06",
    note: "数据收集自 TechCrunch / CNBC / Bloomberg / The Information / SCMP 等一手源",
    methodology: "MAU/WAU/DAU 各家口径不同，保留原始口径；中国维度合并多家本土模型；国家维度只有印度有官方公开数字"
  },

  // ─────────────────────────────────────
  // Top 10 国家（按 AI 工具用户基数 / 流量代理）
  // 注意：除印度外，其他国家数据是流量代理估算
  // ─────────────────────────────────────
  countries: [
    {
      rank: 1, code: "CN", cn: "中国", en: "China", trend: "↑↑",
      metric_label: "本土模型聚合（合并 ByteDance/Alibaba/DeepSeek/百度）",
      value: "豆包 155M WAU · Quark 150M MAU · DeepSeek 131M MAU",
      asof: "2026-Q1"
    },
    {
      rank: 2, code: "US", cn: "美国", en: "United States", trend: "↑",
      metric_label: "ChatGPT 第一大市场（OpenAI 未披露各国 WAU 具体数）",
      value: "占 ChatGPT 全球流量 ~18-20%，估 ~160-180M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 3, code: "IN", cn: "印度", en: "India", trend: "↑↑",
      metric_label: "ChatGPT WAU（Sam Altman 2026-02 直接公布）",
      value: "100M",
      asof: "2026-02"
    },
    {
      rank: 4, code: "BR", cn: "巴西", en: "Brazil", trend: "↑",
      metric_label: "ChatGPT 流量份额代理",
      value: "~3-4% · 估 ~30M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 5, code: "ID", cn: "印尼", en: "Indonesia", trend: "↑↑",
      metric_label: "ChatGPT 流量份额代理",
      value: "~2-3% · 估 ~20M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 6, code: "JP", cn: "日本", en: "Japan", trend: "→",
      metric_label: "ChatGPT 流量份额代理（采用率较低）",
      value: "~1.5-2% · 估 ~15M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 7, code: "DE", cn: "德国", en: "Germany", trend: "↑",
      metric_label: "ChatGPT 流量份额代理",
      value: "~1.5-2% · 估 ~15M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 8, code: "GB", cn: "英国", en: "United Kingdom", trend: "→",
      metric_label: "ChatGPT 流量份额代理",
      value: "~1.5% · 估 ~13M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 9, code: "FR", cn: "法国", en: "France", trend: "↑",
      metric_label: "ChatGPT 流量份额代理",
      value: "~1.5% · 估 ~13M WAU",
      asof: "2026-Q1"
    },
    {
      rank: 10, code: "PH", cn: "菲律宾", en: "Philippines", trend: "↑↑",
      metric_label: "ChatGPT 流量份额代理（亚太新兴）",
      value: "~1-1.5% · 估 ~10M WAU",
      asof: "2026-Q1"
    }
  ],

  // ─────────────────────────────────────
  // Top 10 大模型 / 公司（按消费产品规模）
  // ─────────────────────────────────────
  models: [
    {
      rank: 1, country: "🇺🇸", company: "Meta", product: "Meta AI",
      note: "通过 WhatsApp / Instagram / Messenger 分发；规模最大",
      stats: [
        { label: "MAU",       value: "1B",     asof: "2025-05" },
        { label: "ARR",       value: "未单披", asof: "—" },
        { label: "Meta 市值", value: "~$1.7T", asof: "2026-04" }
      ]
    },
    {
      rank: 2, country: "🇺🇸", company: "OpenAI", product: "ChatGPT",
      note: "AI 定调者；ARR、企业市场、付费用户三项领先",
      stats: [
        { label: "WAU",   value: "900M",   asof: "2026-02" },
        { label: "ARR",   value: "$25B",   asof: "2026-03" },
        { label: "估值",  value: "$500B",  asof: "2025-10 · 二级市场" }
      ]
    },
    {
      rank: 3, country: "🇺🇸", company: "Google", product: "Gemini",
      note: "走 Google 全家桶分发；API 处理 10B tokens/分钟",
      stats: [
        { label: "MAU",          value: "750M",  asof: "2026-Q1" },
        { label: "订阅 ARR",     value: "$1.2B", asof: "2025" },
        { label: "Alphabet 市值", value: "~$2T",  asof: "2026-04" }
      ]
    },
    {
      rank: 4, country: "🇨🇳", company: "ByteDance · 字节跳动", product: "豆包 Doubao",
      note: "中国 AI 应用第一；逾 700 万车辆集成",
      stats: [
        { label: "WAU",        value: "155M",    asof: "2026-Q1 · Chozan" },
        { label: "MAU",        value: "157M",    asof: "2025-08 · SCMP" },
        { label: "字节估值",   value: "~$300B+", asof: "2026" }
      ]
    },
    {
      rank: 5, country: "🇨🇳", company: "Alibaba · 阿里巴巴", product: "Quark 夸克",
      note: "搜索 + AI 一体化；曾短暂超越豆包居中国第一",
      stats: [
        { label: "MAU",         value: "~150M", asof: "2025-Q1" },
        { label: "ARR",         value: "未单披", asof: "—" },
        { label: "阿里市值",    value: "~$300B", asof: "2026-04" }
      ]
    },
    {
      rank: 6, country: "🇨🇳", company: "DeepSeek", product: "DeepSeek",
      note: "开源 + 极致性价比；首轮融资中估值飙升",
      stats: [
        { label: "MAU",   value: "131.5M", asof: "2025-12" },
        { label: "估值",  value: "~$50B",  asof: "2026-05 · 首轮谈判中" },
        { label: "ARR",   value: "$220M",  asof: "2025-中" }
      ]
    },
    {
      rank: 7, country: "🇺🇸", company: "xAI", product: "Grok",
      note: "增长最快（一年 9×）；SpaceX 收购合并 combined $1.25T",
      stats: [
        { label: "MAU",   value: "64M",   asof: "2026-01" },
        { label: "ARR",   value: "$350M", asof: "2025" },
        { label: "估值",  value: "$250B", asof: "2026-02 · SpaceX 合并" }
      ]
    },
    {
      rank: 8, country: "🇺🇸", company: "Anthropic", product: "Claude",
      note: "ARR 增速史上最猛（半年 ×3）；谈判 $900B 估值",
      stats: [
        { label: "MAU",   value: "18.9M",  asof: "2026-01" },
        { label: "ARR",   value: "$30B+",  asof: "2026-04 · 趋 $40B" },
        { label: "估值",  value: "$380B",  asof: "2026-02 · G 轮" }
      ]
    },
    {
      rank: 9, country: "🇺🇸", company: "Microsoft", product: "Copilot",
      note: "365 套件深度集成；AI 收入并入 Microsoft Cloud",
      stats: [
        { label: "MAU",       value: "未单披", asof: "—" },
        { label: "Cloud Q1",  value: "$20B",   asof: "2026-Q1" },
        { label: "MSFT 市值", value: "~$3.7T", asof: "2026-04" }
      ]
    },
    {
      rank: 10, country: "🇨🇳", company: "Baidu · 百度", product: "文心 ERNIE",
      note: "依托百度搜索分发；春节红包后 MAU ×4",
      stats: [
        { label: "DAU",       value: "50M+",   asof: "2026-02" },
        { label: "ARR",       value: "未披露", asof: "—" },
        { label: "百度市值",  value: "~$30B",  asof: "2026-04" }
      ]
    }
  ],

  // ─────────────────────────────────────
  // 数据使用注意
  // ─────────────────────────────────────
  notes: [
    "MAU/WAU/DAU 口径不同公司不一致；不要硬换算（OpenAI/Anthropic 多报 WAU，Google/Meta/字节多报 MAU，国内多报 DAU）",
    "国家维度只有印度（100M WAU）是 OpenAI 官方公布；其他用 ChatGPT 流量份额代理估算",
    "估值：上市公司用整体市值（Meta/Alphabet/MSFT/Alibaba/百度），私有公司用最近一轮 post-money",
    "ARR = 年化运营收入（run-rate），不等于实际财年收入",
    "DeepSeek 此前未融资，2026-05 谈判中估值已从 $20B 涨到 $50B"
  ],

  // ─────────────────────────────────────
  // 数据来源
  // ─────────────────────────────────────
  sources: [
    { name: "ChatGPT 900M WAU · TechCrunch 2026-02",            url: "https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users/" },
    { name: "India 100M WAU · TechCrunch 2026-02",               url: "https://techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/" },
    { name: "OpenAI $25B ARR · The Information 2026-03",         url: "https://www.theinformation.com/articles/openai-tops-25-billion-annualized-revenue-anthropic-narrows-gap" },
    { name: "OpenAI $500B 二级市场 · Bloomberg 2025-10",         url: "https://www.bloomberg.com/news/articles/2025-10-02/openai-completes-share-sale-at-record-500-billion-valuation" },
    { name: "Anthropic $30B ARR · Bloomberg 2026-04",            url: "https://www.bloomberg.com/news/articles/2026-04-06/broadcom-confirms-deal-to-ship-google-tpu-chips-to-anthropic" },
    { name: "Anthropic G 轮 $380B · TechCrunch 2026-02",         url: "https://techcrunch.com/2026/02/12/anthropic-raises-another-30-billion-in-series-g-with-a-new-value-of-380-billion/" },
    { name: "Anthropic 谈判 $900B · TechCrunch 2026-04",         url: "https://techcrunch.com/2026/04/29/sources-anthropic-could-raise-a-new-50b-round-at-a-valuation-of-900b/" },
    { name: "Gemini 750M MAU · TechCrunch 2026-02",              url: "https://techcrunch.com/2026/02/04/googles-gemini-app-has-surpassed-750m-monthly-active-users/" },
    { name: "Meta AI 1B MAU · TechCrunch 2025-05",               url: "https://techcrunch.com/2025/05/29/meta-ai-now-has-1b-monthly-active-users/" },
    { name: "xAI / SpaceX 合并 $1.25T · CNBC 2026-02",            url: "https://www.cnbc.com/2026/02/03/musk-xai-spacex-biggest-merger-ever.html" },
    { name: "DeepSeek 首轮 $50B · TechCrunch 2026-05",            url: "https://techcrunch.com/2026/05/06/deepseek-could-hit-45b-valuation-from-its-first-investment-round/" },
    { name: "Doubao 155M WAU · SCMP 2026-Q1",                    url: "https://www.scmp.com/tech/big-tech/article/3325858/bytedance-chatbot-doubao-still-chinas-most-popular-ai-app-rival-deepseek-loses-users" },
    { name: "Alibaba Quark 150M · SCMP",                          url: "https://www.scmp.com/tech/big-tech/article/3306270/alibabas-quark-surpasses-bytedances-doubao-deepseek-chinas-top-ai-app" }
  ]
};
