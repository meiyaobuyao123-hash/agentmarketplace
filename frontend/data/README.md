# Global Stats — 月度数据更新 SOP

这一目录存放 dashboard 末尾"全球大模型观测台"用的静态数据（`global-stats.js`）。

数据来源**没有官方 API**，所以走**月度手工更新**：每月第一个工作日花 30 分钟把下面的源浏览一遍，新数刷进 `global-stats.js`，commit + 部署。

---

## 1. 更新频率

- **每月第一个工作日** 刷一次
- 紧急：如果某家公司刚出大新闻（IPO / 大额融资 / 财报），可临时刷
- 字段 `meta.updated_at` = 本次更新月份（`YYYY-MM`）
- 字段 `meta.next_update_due` = 下个月

---

## 2. 数据源 checklist

按这个顺序刷，每条 2-5 分钟：

### 国家维度（top 10 countries）

| 源 | 看什么 |
|----|--------|
| [Similarweb top sites — AI category](https://www.similarweb.com/top-websites/) | chat.openai.com / claude.ai / gemini.google.com 全球流量与国家分布 |
| [First Page Sage ChatGPT Usage Stats](https://firstpagesage.com/seo-blog/chatgpt-usage-statistics/) | top countries by users（绝对数） |
| [Visual Capitalist Country Rankings](https://www.visualcapitalist.com/ranked-countries-that-use-chatgpt-the-most/) | snapshot 排名 |
| 中国本土：[36 氪 / 腾讯新闻搜索 "国内大模型 MAU"](https://36kr.com/) | 字节 / 百度 / 腾讯 / 月之暗面 / 智谱 最新 DAU/MAU |

> 国家维度本身没法精确，记得保留 `metric` 字段说明这是"代理指标"。

### 模型 / 公司维度（top 10 models）

| 公司 | 主要源 | 关键字段 |
|------|--------|---------|
| OpenAI | [Reuters search](https://www.reuters.com/)、[OpenAI Newsroom](https://openai.com/news/) | MAU、ARR、估值（融资轮） |
| Anthropic | [Reuters search](https://www.reuters.com/)、[Sacra anthropic](https://sacra.com/c/anthropic/) | ARR（增长极快，重点刷新）、估值 |
| Google Gemini | [TechCrunch Gemini search](https://techcrunch.com/?s=gemini+monthly)、[Alphabet IR earnings call](https://abc.xyz/investor/) | MAU、订阅收入 |
| xAI Grok | [Sensor Tower app revenue](https://sensortower.com/)、[Reuters xAI](https://www.reuters.com/) | MAU、估值 |
| DeepSeek | [Business of Apps DeepSeek](https://www.businessofapps.com/data/deepseek-statistics/) | MAU、ARR |
| 字节豆包 / 百度文心 / 腾讯元宝 / 月之暗面 Kimi | [36氪](https://36kr.com/)、[腾讯科技](https://news.qq.com/) | DAU/MAU、份额 |
| Microsoft Copilot | [Microsoft FY 财报](https://www.microsoft.com/en-us/Investor/) | "AI" 提及（多数仍并入 Cloud） |

---

## 3. 字段约定

```js
{
  rank: 数字 1-10,
  company: "公司名（中英）",
  product: "产品名",
  country: "国旗 emoji",
  mau: "320M" | "—",      // 月活 (M = 百万)
  aux: "辅助说明",          // 如 "WAU 900M" / "DAU 100M+"
  arr: "$25B" | "未披露",   // 年化运营收入
  valuation: "$500B" | "未上市",
  note: "一句话特征",
  asof: "YYYY-MM" | "YYYY-Q1"
}
```

### 单位

- **M** = 百万（million）
- **B** = 十亿美元（billion USD）
- **`~`** 表示非官方公开估算
- **`—`** 表示未披露 / 不适用

### 国家维度

```js
{
  rank: 1,
  code: "ISO-2",         // CN / US / IN ...
  cn: "中文国名",
  en: "English name",
  metric: "ChatGPT 用户" | "本土模型综合",  // 主指标说明
  value: "数值字符串",
  trend: "↑" | "↑↑" | "→" | "↓"
}
```

---

## 4. 更新步骤（5 分钟内完成）

```bash
# 1. 编辑数据
$EDITOR frontend/data/global-stats.js

# 2. 自检（更新时间是否同步、所有 asof 是否还合理）
grep -E 'updated_at|asof' frontend/data/global-stats.js

# 3. 部署到服务器
scp frontend/data/global-stats.js ubuntu@43.156.207.26:/tmp/
ssh ubuntu@43.156.207.26 "sudo install -o www-data -g www-data -m 644 /tmp/global-stats.js /var/www/agentmarketplace/data/global-stats.js && rm /tmp/global-stats.js"

# 4. 验证（公网拉一次）
curl -s "https://www.ai100trading.cn/agentmarketplace/data/global-stats.js?v=$(date +%s)" | grep updated_at

# 5. commit + push
git add frontend/data/global-stats.js
git commit -m "data: 全球大模型观测台月度刷新（YYYY-MM）"
git push
```

> `.js` 文件已在 nginx 设为 `no-cache`，部署即生效；浏览器 Cmd+R 即可看到新数据。

---

## 5. 数据真实性原则

- **能引用就引用**：每个有疑问的数字在 `sources` 加 URL
- **估算标 `~`**：避免给读者"这是官方数字"的错觉
- **MAU 口径不统一**：OpenAI/Google 报月活、Anthropic 多报周活、字节多报日活——不要硬换算，直接用各自原始口径，加 `aux` 说明
- **过时就标 `asof`**：如果某家公司半年没出新数据，asof 写半年前的日期，让读者知道这是"陈数"

---

## 6. 不该出现在这里的数据

- ❌ 内部数据 / NDA 数据
- ❌ 未公开融资金额（除非 Reuters / Bloomberg / TechCrunch 公开报道）
- ❌ 个人猜测（除非明确标 `~`）
- ❌ 加密货币 token 数据（这是 LLM token 观测，不是币圈榜）
