/* Dashboard · quiet editorial console */
const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD } = React;

function Dashboard() {
  const [tick, setTick] = useStateD(0);
  useEffectD(() => {
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const heat = useMemoD(() => Array.from({length: 7}, (_,d) =>
    Array.from({length: 24}, (_,h) => {
      const v = (Math.sin(h*0.4 + d*0.7) + Math.cos(h*0.3 - d*0.5))/2 + 0.5;
      return Math.max(0, Math.min(1, v + Math.random()*0.12));
    })
  ), []);

  const spark = useMemoD(() => Array.from({length: 64}, (_,i) => 50 + Math.sin(i*0.4)*22 + Math.random()*6), []);

  const top = [
    { r:"01", n:"AlphaCoder", zh:"全栈代码体", calls:"284.6K", trend:"+12.4%", t:"up", ind:"软件工程", c:"#6E96A0" },
    { r:"02", n:"Lumen",      zh:"视觉构图师", calls:"198.2K", trend:"+8.1%",  t:"up", ind:"视觉创作", c:"#BD7E82" },
    { r:"03", n:"Stellar",    zh:"文案策划体", calls:"176.9K", trend:"+5.6%",  t:"up", ind:"内容营销", c:"#C99858" },
    { r:"04", n:"Quanta",     zh:"数据观测员", calls:"143.0K", trend:"+22.8%", t:"up", ind:"金融数据", c:"#84A684" },
    { r:"05", n:"Nova",       zh:"多语翻译官", calls:"118.3K", trend:"−2.1%",  t:"dn", ind:"翻译同传", c:"#9489B4" },
  ];

  const feed = [
    { t:"00:14:22", who:"AlphaCoder", what:"执行 GitHub PR · #4821" },
    { t:"00:14:18", who:"Lumen",      what:"渲染 Banner · 1024×512" },
    { t:"00:13:51", who:"Stellar",    what:"生成营销文案 · 中→英" },
    { t:"00:13:34", who:"Quanta",     what:"结算季报 · Q1 数据校验" },
    { t:"00:12:47", who:"Nova",       what:"实时翻译 · 日↔中" },
    { t:"00:12:11", who:"Echo",       what:"客服会话 · 处理工单 #92K" },
    { t:"00:11:29", who:"Atlas",      what:"调研报告 · 行业分析中" },
    { t:"00:11:02", who:"Cipher",     what:"代码审计 · 漏洞扫描完成" },
    { t:"00:10:33", who:"Sage",       what:"教学辅导 · 高数·练习题集" },
  ];

  const ind = [
    { n:"软件工程", v:78, c:"#6E96A0" }, { n:"视觉创作", v:92, c:"#BD7E82" },
    { n:"金融数据", v:86, c:"#84A684" }, { n:"内容营销", v:71, c:"#C99858" },
    { n:"教育辅导", v:64, c:"#9489B4" }, { n:"客服支持", v:58, c:"#6E96A0" },
    { n:"医疗咨询", v:42, c:"#BD8268" }, { n:"法律咨询", v:38, c:"#C99858" },
  ];

  return (
    <div className="dash">
      <div className="grid-bg" />

      <div className="d-head">
        <div className="d-head-l">
          <div className="d-eyebrow">
            <span className="dot-live" />
            <span className="cap s">Real-time observatory · 实时观测</span>
            <span className="cap">Updated every 2s</span>
          </div>
          <h1 className="d-title">
            <span className="zh d-zh">看板</span>
            <span className="serif d-serif">— a quiet console</span>
          </h1>
        </div>
        <div className="d-head-r">
          <div className="d-filter">
            {["今日","本周","本月","本季"].map((f,i) => (
              <button key={f} className={i===0?"on":""}>{f}</button>
            ))}
          </div>
          <button className="d-export">
            <span className="cap">Export ↓</span>
          </button>
        </div>
      </div>

      <div className="d-grid">
        <KPI n="01" label="Total calls / 24h" zh="二十四小时调用" value="14.2M" delta="+18.4%" t="up" spark={spark} span={3} />
        <KPI n="02" label="Active agents" zh="活跃节点" value="1,247" delta="+24" t="up" />
        <KPI n="03" label="Success rate" zh="成功率" value="97.6" unit="%" delta="+0.3%" t="up" />
        <KPI n="04" label="Avg latency" zh="平均响应" value="284" unit="ms" delta="−12 ms" t="up" />

        <Card title="调用密度" en="Call density · 7D × 24H" cls="span-3 row-2">
          <Heatmap data={heat} />
        </Card>

        <Card title="人气榜" en="Top agents · this week" cls="span-3 row-2">
          <div className="top-list">
            {top.map((a,i) => (
              <div key={a.r} className="top-row">
                <span className="cap top-rank" style={{color: a.c}}>{a.r}</span>
                <div className="top-info">
                  <div className="top-name">
                    <span className="zh">{a.zh}</span>
                    <span className="cap dim">/ {a.n}</span>
                  </div>
                  <div className="top-meta">
                    <span className="cap s" style={{color: a.c}}>● {a.ind}</span>
                    <span className="cap">{a.calls} calls</span>
                  </div>
                </div>
                <div className={"top-trend " + a.t}>{a.trend}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="实时事件" en="Live stream" pulse cls="span-3 row-2">
          <div className="feed-list">
            {feed.map((f,i) => (
              <div key={i} className="feed-row" style={{animationDelay:(i*0.04)+"s"}}>
                <span className="cap feed-t">{f.t}</span>
                <span className="feed-bullet" />
                <span className="feed-who zh">{f.who}</span>
                <span className="feed-what zh">{f.what}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="行业渗透" en="Industry · activity" cls="span-3">
          <div className="ind-list">
            {ind.map((it,i) => (
              <div key={i} className="ind-row">
                <span className="cap ind-n">{String(i+1).padStart(2,"0")}</span>
                <span className="zh ind-name">{it.n}</span>
                <div className="ind-track"><div className="ind-fill" style={{width:it.v+"%", background: it.c, boxShadow: `0 0 8px ${it.c}88`}} /></div>
                <span className="cap ind-v" style={{color: it.c}}>{it.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="全球节点" en="Global · nodes" cls="span-3">
          <NetworkMap tick={tick} />
        </Card>

        <Card
          title="全球大模型观测台"
          en={"Global LLM observatory · monthly · " + (typeof window !== "undefined" && window.GLOBAL_STATS ? window.GLOBAL_STATS.meta.updated_at : "—")}
          cls="span-6">
          <Observatory />
        </Card>
      </div>

      <style>{dashCss}</style>
    </div>
  );
}

function Observatory() {
  const data = (typeof window !== "undefined") ? window.GLOBAL_STATS : null;
  if (!data) {
    return <div className="cap dim">data/global-stats.js 未加载，请检查 index.html</div>;
  }
  return (
    <div className="obs">
      {/* Methodology header — 数据口径 + 更新时间一目了然 */}
      <div className="obs-meta">
        <div className="obs-meta-l">
          <span className="cap obs-meta-tag">UPDATED · {data.meta.updated_at}</span>
          <span className="cap dim">next due · {data.meta.next_update_due}</span>
        </div>
        <div className="obs-meta-r">
          <span className="cap dim">{data.meta.methodology}</span>
        </div>
      </div>

      <div className="obs-cols">
        {/* 左：国家 */}
        <div className="obs-col">
          <div className="obs-col-head">
            <span className="cap">A · countries by AI usage</span>
            <span className="zh obs-h">Token 消耗 · 国家 Top 10</span>
          </div>
          <div className="obs-list">
            {data.countries.map(c => (
              <div key={c.rank} className="obs-row obs-row-country">
                <span className="cap obs-rk">{String(c.rank).padStart(2,"0")}</span>
                <span className="cap obs-cflag">{c.code}</span>
                <div className="obs-cbody">
                  <div className="obs-cline-1">
                    <span className="zh obs-name">{c.cn}</span>
                    <span className="cap dim obs-en">/ {c.en}</span>
                    <span className="obs-trend">{c.trend}</span>
                  </div>
                  <div className="obs-cline-2">
                    <span className="cap obs-c-label">{c.metric_label}</span>
                    <span className="obs-c-value">{c.value}</span>
                    <span className="cap dim obs-c-when">as of {c.asof}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右：模型 */}
        <div className="obs-col">
          <div className="obs-col-head">
            <span className="cap">B · models · MAU · ARR · valuation</span>
            <span className="zh obs-h">大模型 Top 10</span>
          </div>
          <div className="obs-list">
            {data.models.map(m => (
              <div key={m.rank} className="obs-row obs-row-model">
                <span className="cap obs-rk">{String(m.rank).padStart(2,"0")}</span>
                <span className="obs-flag">{m.country}</span>
                <div className="obs-mname-block">
                  <div className="obs-mname-l1">
                    <span className="zh obs-name">{m.product}</span>
                    <span className="cap dim obs-co">/ {m.company}</span>
                  </div>
                  <div className="obs-mnote cap dim">{m.note}</div>
                </div>
                <div className="obs-stats">
                  {m.stats.map((s, i) => (
                    <div key={i} className="obs-stat">
                      <span className="cap obs-stat-label">{s.label}</span>
                      <span className="obs-stat-value">{s.value}</span>
                      <span className="cap obs-stat-when">{s.asof}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数据来源脚注 */}
      <div className="obs-foot">
        <div className="cap obs-foot-h">SOURCES</div>
        <div className="obs-foot-list">
          {data.sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener" className="cap obs-foot-link">{s.name}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, en, pulse, cls, children }) {
  return (
    <div className={"card " + (cls||"")}>
      <div className="c-head">
        <div className="c-head-l">
          <span className="zh c-title">{title}</span>
          {pulse && <span className="dot-live" />}
        </div>
        <span className="cap">{en}</span>
      </div>
      <div className="c-body">{children}</div>
    </div>
  );
}

function KPI({ n, label, zh, value, unit, delta, t, spark, span }) {
  const path = spark ? sparkPath(spark, 320, 60) : null;
  return (
    <div className={"card kpi " + (span ? "span-"+span : "")}>
      <div className="c-head">
        <div className="c-head-l">
          <span className="cap">{n}</span>
          <span className="cap s">{label}</span>
        </div>
        <span className="cap dim">{zh}</span>
      </div>
      <div className="kpi-row">
        <div className="kpi-val">
          <span className="kpi-num">{value}</span>
          {unit && <span className="kpi-unit cap">{unit}</span>}
        </div>
        <div className={"kpi-delta " + t}>
          <span>{t === "up" ? "↑" : "↓"}</span>
          <span>{delta}</span>
        </div>
      </div>
      {spark && (
        <svg viewBox="0 0 320 60" preserveAspectRatio="none" className="kpi-spark">
          <path d={path.area} fill="rgba(244,242,238,0.04)" />
          <path d={path.line} fill="none" stroke="var(--ink)" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}

function sparkPath(arr, w, h) {
  const max = Math.max(...arr), min = Math.min(...arr);
  const pts = arr.map((v,i) => [i / (arr.length-1) * w, h - ((v-min)/(max-min||1)) * (h-6) - 3]);
  const line = "M " + pts.map(p => p.join(" ")).join(" L ");
  const area = line + ` L ${w} ${h} L 0 ${h} Z`;
  return { line, area };
}

function Heatmap({ data }) {
  const colorAt = (v) => {
    return `rgba(201,152,88, ${0.08 + v * 0.55})`;
  };
  return (
    <div className="hm">
      <div className="hm-y">
        {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d => <div key={d} className="cap hm-y-l">{d}</div>)}
      </div>
      <div className="hm-grid">
        {data.map((row, ri) => (
          <div key={ri} className="hm-row">
            {row.map((v, ci) => (
              <div key={ci} className="hm-cell" style={{ background: colorAt(v) }} />
            ))}
          </div>
        ))}
      </div>
      <div className="hm-x">
        {[0,4,8,12,16,20,24].map(h => <div key={h} className="cap">{String(h).padStart(2,"0")}:00</div>)}
      </div>
    </div>
  );
}

function NetworkMap({ tick }) {
  const cities = [
    { n:"BJ",  zh:"北京",  x:78, y:32 },
    { n:"TYO", zh:"东京",  x:86, y:36 },
    { n:"SF",  zh:"旧金山", x:12, y:34 },
    { n:"NYC", zh:"纽约",   x:28, y:32 },
    { n:"LDN", zh:"伦敦",   x:50, y:24 },
    { n:"BER", zh:"柏林",   x:53, y:26 },
    { n:"SIN", zh:"新加坡", x:76, y:55 },
    { n:"SYD", zh:"悉尼",   x:88, y:75 },
    { n:"MUM", zh:"孟买",   x:68, y:46 },
    { n:"SP",  zh:"圣保罗", x:32, y:65 },
  ];
  const links = [[0,2],[0,4],[2,3],[4,5],[3,9],[6,7],[6,8],[1,6],[0,1],[5,8]];
  return (
    <svg className="netmap" viewBox="0 0 100 80" preserveAspectRatio="none">
      {[10,20,30,40,50,60,70].map(y => <line key={"h"+y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(244,242,238,0.04)" strokeWidth="0.15" />)}
      {[10,20,30,40,50,60,70,80,90].map(x => <line key={"v"+x} x1={x} y1="10" x2={x} y2="70" stroke="rgba(244,242,238,0.04)" strokeWidth="0.15" />)}
      {links.map((l,i) => {
        const a = cities[l[0]], b = cities[l[1]];
        const mx = (a.x+b.x)/2, my = Math.min(a.y,b.y) - 8;
        return <path key={i} d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} stroke="rgba(244,242,238,0.18)" strokeWidth="0.18" fill="none" strokeDasharray="0.6 0.8" />;
      })}
      {cities.map((c,i) => {
        const live = (tick + i) % 4 === 0;
        return (
          <g key={i}>
            {live && (
              <circle cx={c.x} cy={c.y} r="2" fill="none" stroke="var(--live)" strokeWidth="0.18">
                <animate attributeName="r" from="0.6" to="3" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={c.x} cy={c.y} r="0.7" fill={live ? "var(--live)" : "var(--ink)"} />
            <text x={c.x + 1.5} y={c.y - 0.8} fill="var(--ink-70)" fontSize="1.6" fontFamily="var(--f-mono)">{c.n}</text>
          </g>
        );
      })}
    </svg>
  );
}

const dashCss = `
.dash { position: absolute; inset: 0; padding: 110px 36px 36px; overflow-y: auto; }

.d-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
.d-eyebrow { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
.d-title { display: flex; gap: 18px; align-items: baseline; line-height: 1; }
.d-zh {
  font-size: 88px; font-weight: 200; letter-spacing: 0.16em; padding-left: 0.16em;
  color: var(--ink);
}
.d-serif { font-size: 28px; color: var(--ink-70); }

.d-head-r { display: flex; gap: 14px; align-items: center; }
.d-filter { display: flex; gap: 0; border: 1px solid var(--line); }
.d-filter button { padding: 9px 16px; border-right: 1px solid var(--line); font-size: 12px; color: var(--ink-40); transition: all 0.2s; }
.d-filter button:last-child { border-right: none; }
.d-filter button:hover { color: var(--ink-70); }
.d-filter button.on { color: var(--bg); background: var(--ink); }
.d-export { padding: 9px 16px; border: 1px solid var(--line-strong); transition: all 0.2s; }
.d-export:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }

.d-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0; }

.card {
  border: 1px solid var(--line);
  margin: -1px 0 0 -1px; /* collapse borders */
  padding: 22px;
  display: flex; flex-direction: column; gap: 18px;
  min-height: 0;
  transition: background 0.2s;
}
.card:hover { background: rgba(244,242,238,0.015); }
.span-2 { grid-column: span 2; }
.span-3 { grid-column: span 3; }
.span-6 { grid-column: span 6; }
.row-2 { grid-row: span 2; }

.c-head { display: flex; justify-content: space-between; align-items: center; }
.c-head-l { display: flex; gap: 10px; align-items: center; }
.c-title { font-size: 16px; font-weight: 500; letter-spacing: 0.04em; }
.c-body { display: flex; flex-direction: column; gap: 16px; flex: 1; min-height: 0; }

/* KPI */
.kpi { gap: 14px; }
.kpi-row { display: flex; justify-content: space-between; align-items: baseline; }
.kpi-val { display: flex; align-items: baseline; gap: 4px; }
.kpi-num {
  font-family: var(--f-sans); font-size: 56px; font-weight: 300; letter-spacing: -0.02em; line-height: 1;
  color: var(--ink);
}
.kpi-unit { font-size: 14px; color: var(--ink-40); }
.kpi-delta { display: flex; gap: 4px; align-items: center; font-family: var(--f-mono); font-size: 11px; padding: 3px 8px; border: 1px solid var(--line); }
.kpi-delta.up { color: var(--live); border-color: rgba(111,227,240,0.3); }
.kpi-delta.dn { color: var(--warn); border-color: rgba(232,194,113,0.3); }
.kpi-spark { width: 100%; height: 36px; }

/* Heatmap */
.hm { display: grid; grid-template-columns: 38px 1fr; grid-template-rows: 1fr 18px; gap: 6px; flex: 1; }
.hm-y { display: flex; flex-direction: column; gap: 3px; }
.hm-y-l { flex: 1; display: flex; align-items: center; font-size: 9px; }
.hm-grid { display: flex; flex-direction: column; gap: 3px; }
.hm-row { display: flex; gap: 3px; flex: 1; }
.hm-cell { flex: 1; min-height: 14px; }
.hm-x { grid-column: 2; display: flex; justify-content: space-between; }

/* Top */
.top-list { display: flex; flex-direction: column; gap: 0; }
.top-row { display: grid; grid-template-columns: 32px 1fr auto; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line); align-items: center; }
.top-row:last-child { border-bottom: none; }
.top-rank { font-size: 11px; }
.top-info { display: flex; flex-direction: column; gap: 4px; }
.top-name { display: flex; gap: 8px; align-items: baseline; }
.top-name .zh { font-size: 14px; font-weight: 500; }
.top-meta { display: flex; gap: 14px; }
.top-trend { font-family: var(--f-mono); font-size: 11px; }
.top-trend.up { color: var(--live); }
.top-trend.dn { color: var(--warn); }

/* Feed */
.feed-list { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.feed-row { display: grid; grid-template-columns: 70px 8px auto 1fr; gap: 12px; align-items: baseline; animation: feedIn 0.5s cubic-bezier(.4,0,.2,1) backwards; }
@keyframes feedIn { from { opacity: 0; transform: translateX(6px); } }
.feed-t { font-size: 10px; }
.feed-bullet { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-70); margin-top: 6px; }
.feed-who { font-size: 13px; font-weight: 500; }
.feed-what { font-size: 12px; color: var(--ink-70); }

/* Industry */
.ind-list { display: flex; flex-direction: column; gap: 0; }
.ind-row { display: grid; grid-template-columns: 30px 90px 1fr 36px; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); }
.ind-row:last-child { border-bottom: none; }
.ind-name { font-size: 13px; }
.ind-track { height: 2px; background: var(--ink-20); }
.ind-fill { height: 100%; background: var(--ink); }
.ind-v { text-align: right; font-size: 11px; color: var(--ink-70); }

/* Network */
.netmap { width: 100%; height: 100%; min-height: 240px; }

/* Observatory · 月度大模型观测台 */
.obs { display: flex; flex-direction: column; gap: 18px; }

/* Methodology header */
.obs-meta {
  display: flex; justify-content: space-between; gap: 18px;
  flex-wrap: wrap;
  padding: 10px 0 12px;
  border-bottom: 1px solid var(--line);
}
.obs-meta-l { display: flex; gap: 14px; align-items: baseline; }
.obs-meta-r { color: var(--ink-40); font-size: 9px; }
.obs-meta-tag { color: var(--ink); }

/* Two columns */
.obs-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.obs-col { min-width: 0; }
.obs-col:first-child { padding-right: 22px; border-right: 1px solid var(--line); }
.obs-col + .obs-col { padding-left: 22px; }

.obs-col-head {
  display: flex; flex-direction: column; gap: 6px;
  padding-bottom: 12px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--line);
}
.obs-col-head .obs-h { font-size: 14px; font-weight: 500; letter-spacing: 0.04em; }

.obs-list { display: flex; flex-direction: column; }

/* ── Country row ────────────────────── */
.obs-row-country {
  display: grid;
  grid-template-columns: 26px 32px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  align-items: baseline;
}
.obs-row-country:last-child { border-bottom: none; }
.obs-cflag {
  font-size: 9px;
  color: var(--ink-70);
  letter-spacing: 0.18em;
  font-weight: 500;
}
.obs-cbody { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.obs-cline-1 { display: flex; gap: 8px; align-items: baseline; }
.obs-cline-2 {
  display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap;
  font-family: var(--f-mono);
  font-size: 10px;
  line-height: 1.4;
}
.obs-c-label { color: var(--ink-40); }
.obs-c-value {
  color: var(--ink); font-weight: 500;
  font-variant-numeric: tabular-nums;
  font-family: var(--f-sans);
  font-size: 12px;
}
.obs-c-when { font-size: 9px !important; color: var(--ink-40) !important; }

/* ── Model row · horizontal layout ───── */
.obs-row-model {
  display: grid;
  grid-template-columns: 26px 22px minmax(140px, 1.2fr) minmax(220px, 1.4fr);
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  align-items: center;
}
.obs-row-model:last-child { border-bottom: none; }
.obs-flag { font-size: 16px; line-height: 1; }
.obs-mname-block { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.obs-mname-l1 { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.obs-mnote { font-size: 9px; line-height: 1.5; color: var(--ink-40); }

.obs-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}
.obs-stat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 0 10px;
  border-left: 1px solid var(--line);
}
.obs-stat:first-child { padding-left: 0; border-left: none; }
.obs-stat:last-child  { padding-right: 0; }
.obs-stat-label {
  font-size: 9px;
  color: var(--ink-40);
  letter-spacing: 0.18em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.obs-stat-value {
  font-family: var(--f-sans);
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 0;
  line-height: 1.1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.obs-stat-when {
  font-size: 9px !important;
  color: var(--ink-40);
  white-space: nowrap;
}

/* Common */
.obs-rk { font-size: 10px; color: var(--ink-40); font-variant-numeric: tabular-nums; }
.obs-name { font-size: 14px; font-weight: 500; letter-spacing: 0.04em; }
.obs-en, .obs-co { font-size: 9px; letter-spacing: 0.04em; }
.obs-trend { font-size: 14px; color: var(--ink-70); margin-left: auto; line-height: 1; }

/* Footer · sources */
.obs-foot {
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
.obs-foot-h {
  letter-spacing: 0.32em;
  color: var(--ink-40);
}
.obs-foot-list { display: flex; flex-wrap: wrap; gap: 14px; }
.obs-foot-link {
  color: var(--ink-70);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
  font-size: 9px;
}
.obs-foot-link:hover {
  color: var(--ink);
  border-bottom-color: var(--ink-70);
}
`;

window.Dashboard = Dashboard;
