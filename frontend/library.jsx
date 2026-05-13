/* Library · 万象集 · catalogue grid + 投融资 funding tracker */
const { useState: useStateL, useMemo: useMemoL, useEffect: useEffectL } = React;

const INDUSTRIES = [
  { id:"all", zh:"全部", en:"All", n:1247, c:"#E8DFC9" },
  { id:"eng", zh:"软件工程", en:"Engineering", n:186, c:"#6E96A0" },
  { id:"vis", zh:"视觉创作", en:"Visual", n:214, c:"#BD7E82" },
  { id:"fin", zh:"金融数据", en:"Finance", n:128, c:"#84A684" },
  { id:"mkt", zh:"内容营销", en:"Marketing", n:172, c:"#C99858" },
  { id:"edu", zh:"教育辅导", en:"Education", n:96,  c:"#9489B4" },
  { id:"law", zh:"法律咨询", en:"Legal", n:54,      c:"#C99858" },
  { id:"med", zh:"医疗咨询", en:"Medical", n:71,    c:"#BD8268" },
  { id:"sci", zh:"科研助理", en:"Research", n:88,   c:"#6E96A0" },
  { id:"trn", zh:"翻译同传", en:"Translation", n:62,c:"#9489B4" },
  { id:"cs",  zh:"客服支持", en:"Support", n:104,   c:"#84A684" },
];

const AGENTS = [
  { id:"a01", n:"AlphaCoder", zh:"全栈代码体", ind:"eng", indZh:"软件工程", desc:"全栈工程的合作者。读懂、重构、提交、回滚。", calls:"284.6K", rate:"97.8%", lat:"312ms", tag:"Premier", v:"v4.2", glyph:"亖" },
  { id:"a02", n:"Lumen",      zh:"视觉构图师", ind:"vis", indZh:"视觉创作", desc:"画面、版式、配图、动画原型。", calls:"198.2K", rate:"98.4%", lat:"1.2s",  tag:"Featured", v:"v3.1", glyph:"彡" },
  { id:"a03", n:"Stellar",    zh:"文案策划体", ind:"mkt", indZh:"内容营销", desc:"长短文、Slogan、品牌口吻校对。", calls:"176.9K", rate:"96.5%", lat:"284ms", tag:"Premier", v:"v2.7", glyph:"言" },
  { id:"a04", n:"Quanta",     zh:"数据观测员", ind:"fin", indZh:"金融数据", desc:"行情、研报、结算与异常检测。", calls:"143.0K", rate:"99.1%", lat:"196ms", tag:"Featured", v:"v5.0", glyph:"○" },
  { id:"a05", n:"Sage",       zh:"教学辅导员", ind:"edu", indZh:"教育辅导", desc:"陪练、答疑、作业批改。", calls:"118.3K", rate:"95.2%", lat:"428ms", tag:"Standard", v:"v2.0", glyph:"师" },
  { id:"a06", n:"Cipher",     zh:"代码审计师", ind:"eng", indZh:"软件工程", desc:"漏洞扫描、依赖审查、合规报告。", calls:"94.7K",  rate:"99.6%", lat:"542ms", tag:"Premier", v:"v3.4", glyph:"密" },
  { id:"a07", n:"Atlas",      zh:"调研报告员", ind:"sci", indZh:"科研助理", desc:"论文综述、行业图谱、引用核对。", calls:"86.2K",  rate:"94.8%", lat:"1.8s",  tag:"Featured", v:"v2.9", glyph:"图" },
  { id:"a08", n:"Nova",       zh:"多语翻译官", ind:"trn", indZh:"翻译同传", desc:"实时同传、本地化、术语库。", calls:"118.0K", rate:"97.0%", lat:"168ms", tag:"Featured", v:"v4.0", glyph:"译" },
  { id:"a09", n:"Echo",       zh:"客服会话员", ind:"cs",  indZh:"客服支持", desc:"工单分流、知识库回复、多渠道。", calls:"172.4K", rate:"96.1%", lat:"246ms", tag:"Standard", v:"v3.0", glyph:"応" },
  { id:"a10", n:"Marble",     zh:"法律审阅员", ind:"law", indZh:"法律咨询", desc:"合同条款、风险标注、判例检索。", calls:"42.1K",  rate:"98.9%", lat:"724ms", tag:"Premier", v:"v2.5", glyph:"律" },
  { id:"a11", n:"Vita",       zh:"医疗咨询员", ind:"med", indZh:"医疗咨询", desc:"症状询问、用药参考、就诊建议。", calls:"58.4K",  rate:"94.4%", lat:"612ms", tag:"Standard", v:"v1.8", glyph:"医" },
  { id:"a12", n:"Pixel",      zh:"图标设计师", ind:"vis", indZh:"视觉创作", desc:"图标系统、矢量草图、品牌符号。", calls:"68.0K",  rate:"97.5%", lat:"892ms", tag:"Standard", v:"v2.1", glyph:"◆" },
];

function Library() {
  const [section, setSection] = useStateL("catalogue"); // catalogue | funding

  return (
    <div className="lib">
      <div className="grid-bg" />

      {/* Section tabs · 万象集 / 投融资 */}
      <div className="l-sections">
        <button className={"l-sec " + (section==="catalogue"?"on":"")} onClick={() => setSection("catalogue")}>
          <span className="cap l-sec-num">01</span>
          <span className="zh l-sec-zh">万象集</span>
        </button>
        <button className={"l-sec " + (section==="funding"?"on":"")} onClick={() => setSection("funding")}>
          <span className="cap l-sec-num">02</span>
          <span className="zh l-sec-zh">投融资</span>
        </button>
      </div>

      {section === "catalogue" ? <Catalogue /> : <Funding />}

      <style>{libCss}</style>
    </div>
  );
}

/* ─────────────────────────────────────
 * Catalogue · 万象集（原有 agents 网格）
 * ───────────────────────────────────── */

function Catalogue() {
  const [filter, setFilter] = useStateL("all");
  const [q, setQ] = useStateL("");
  const [view, setView] = useStateL("grid");
  const [hover, setHover] = useStateL(null);

  const list = useMemoL(() => AGENTS.filter(a => {
    if (filter !== "all" && a.ind !== filter) return false;
    if (q && !(a.n.toLowerCase().includes(q.toLowerCase()) || a.zh.includes(q))) return false;
    return true;
  }), [filter, q]);

  return (
    <div className="l-section">
      <div className="l-head">
        <div className="l-head-l">
          <div className="l-eyebrow">
            <span className="cap s">No. III · catalogue</span>
            <span className="hr-line" style={{maxWidth:60}} />
            <span className="cap">{AGENTS.length.toString().padStart(4,"0")} entries</span>
          </div>
          <h1 className="l-title">
            <span className="zh l-zh">万象集</span>
          </h1>
          <p className="l-lede">按行业、能力、版本检索。每一卡片记一位 Agent 的常态、称号与近况。</p>
        </div>
        <div className="l-head-r">
          <div className="l-search">
            <span className="cap s">⌕</span>
            <input className="zh" placeholder="名称 / Name" value={q} onChange={e => setQ(e.target.value)} />
            <kbd className="cap">/</kbd>
          </div>
          <div className="l-view">
            {["grid","list"].map(v => (
              <button key={v} className={view===v?"on":""} onClick={() => setView(v)}>
                <span className="cap">{v === "grid" ? "▦" : "≡"} {v}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="l-tabs">
        {INDUSTRIES.map(t => (
          <button key={t.id} className={"l-tab " + (filter===t.id?"on":"")} onClick={() => setFilter(t.id)}>
            <span className="zh">{t.zh}</span>
            <span className="cap dim">{t.n}</span>
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="l-grid">
          {list.map((a, i) => {
            const ic = (INDUSTRIES.find(x => x.id === a.ind) || {}).c || "#F4F2EE";
            return <AgentCard key={a.id} a={a} idx={i} hover={hover===a.id} color={ic}
                              onHover={() => setHover(a.id)} onLeave={() => setHover(null)} />;
          })}
          {list.length === 0 && <div className="l-empty zh">无结果。试着换个行业或词。</div>}
        </div>
      ) : (
        <div className="l-list">
          <div className="ll-head">
            <span className="cap">No.</span>
            <span className="cap">Agent</span>
            <span className="cap">Industry</span>
            <span className="cap">Version</span>
            <span className="cap">Calls</span>
            <span className="cap">Success</span>
            <span className="cap">Latency</span>
            <span className="cap" />
          </div>
          {list.map((a, i) => {
            const ic = (INDUSTRIES.find(x => x.id === a.ind) || {}).c || "#F4F2EE";
            return (
              <div key={a.id} className="ll-row" style={{animationDelay:(i*0.03)+"s"}}>
                <span className="cap">{String(i+1).padStart(3,"0")}</span>
                <div className="ll-name">
                  <div className="ll-glyph" style={{color: ic, borderColor: ic + "55", boxShadow: `0 0 12px ${ic}33`}}>{a.glyph}</div>
                  <div>
                    <div className="zh ll-zh">{a.zh}</div>
                    <div className="cap dim">{a.n}</div>
                  </div>
                </div>
                <span className="zh" style={{color: ic}}>● {a.indZh}</span>
                <span className="cap">{a.v}</span>
                <span className="cap">{a.calls}</span>
                <span className="cap">{a.rate}</span>
                <span className="cap">{a.lat}</span>
                <button className="ll-go cap">召唤 →</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="l-foot">
        <span className="cap s">显示 {list.length} / {AGENTS.length} 项</span>
        <span className="hr-line" />
        <span className="cap s">第二卷 · 第 III 章</span>
      </div>
    </div>
  );
}

function AgentCard({ a, idx, hover, color, onHover, onLeave }) {
  return (
    <article className={"agent " + (hover ? "hover" : "")}
             style={{animationDelay:(idx*0.04)+"s", "--ic": color}}
             onMouseEnter={onHover} onMouseLeave={onLeave}>
      <div className="ag-aura" />
      <header className="ag-head">
        <span className="cap">No. {String(idx+1).padStart(3,"0")}</span>
        <span className={"ag-tag cap " + a.tag.toLowerCase()}>{a.tag}</span>
      </header>

      <div className="ag-glyph-row">
        <div className="ag-glyph">{a.glyph}</div>
        <div className="ag-rings">
          <div className="ag-ring r1" />
          <div className="ag-ring r2" />
        </div>
      </div>

      <div className="ag-id">
        <h3 className="zh ag-zh">{a.zh}</h3>
        <div className="ag-en">
          <span className="serif ag-name">{a.n}</span>
          <span className="cap dim">{a.v}</span>
        </div>
      </div>

      <p className="zh ag-desc">{a.desc}</p>

      <div className="ag-meta">
        <div className="ag-meta-row"><span className="cap s">行业</span><span className="zh" style={{color:color}}>● {a.indZh}</span></div>
        <div className="ag-meta-row"><span className="cap s">调用</span><span className="cap">{a.calls}</span></div>
        <div className="ag-meta-row"><span className="cap s">成功率</span><span className="cap">{a.rate}</span></div>
        <div className="ag-meta-row"><span className="cap s">响应</span><span className="cap">{a.lat}</span></div>
      </div>

      <footer className="ag-foot">
        <button className="ag-cta">
          <span className="zh">召唤</span>
          <span className="cap">↗</span>
        </button>
      </footer>
    </article>
  );
}

/* ─────────────────────────────────────
 * Funding · 投融资 list + detail
 * ───────────────────────────────────── */

const REGION_META = {
  US: { flag: "🇺🇸", name: "美国" },
  CN: { flag: "🇨🇳", name: "中国" },
  UK: { flag: "🇬🇧", name: "英国" },
  EU: { flag: "🇪🇺", name: "欧盟" },
  JP: { flag: "🇯🇵", name: "日本" },
  IN: { flag: "🇮🇳", name: "印度" },
  Other: { flag: "🌐", name: "其他" }
};

function Funding() {
  const [data, setData] = useStateL(null);
  const [error, setError] = useStateL(null);
  const [activeId, setActiveId] = useStateL(null);
  const [filterRegion, setFilterRegion] = useStateL("all");
  const [filterTier, setFilterTier] = useStateL("all");

  useEffectL(() => {
    fetch("data/funding.json", { cache: "no-cache" })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(setData)
      .catch(e => setError(String(e)));
  }, []);

  if (error) {
    return <div className="l-section l-empty zh">数据加载失败：{error}</div>;
  }
  if (!data) {
    return <div className="l-section l-empty cap dim">LOADING DATA · funding.json …</div>;
  }

  const events = data.events;

  // 找当前 active event
  const active = activeId ? events.find(e => e.id === activeId) : null;

  // 筛选
  const filtered = events.filter(e => {
    if (filterRegion !== "all" && e.region !== filterRegion) return false;
    if (filterTier !== "all") {
      const amt = e.amount_usd_m || 0;
      if (filterTier === ">10000" && amt < 10000) return false;
      if (filterTier === ">1000" && amt < 1000) return false;
      if (filterTier === ">100" && amt < 100) return false;
    }
    return true;
  });

  // 区域计数
  const regionCounts = {};
  events.forEach(e => { regionCounts[e.region] = (regionCounts[e.region] || 0) + 1; });

  if (active) {
    return <FundingDetail event={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className="l-section">
      <div className="l-head">
        <div className="l-head-l">
          <div className="l-eyebrow">
            <span className="cap s">No. IV · funding</span>
            <span className="hr-line" style={{maxWidth:60}} />
            <span className="cap">{events.length.toString().padStart(4,"0")} events</span>
            <span className="hr-line" style={{maxWidth:30}} />
            <span className="cap dim">updated · {data.meta.updated_at}</span>
          </div>
          <h1 className="l-title">
            <span className="zh l-zh">投融资</span>
          </h1>
          <p className="l-lede">{data.meta.methodology}。每条事件含轮次、金额、估值、领投方、日期与一手来源。</p>
        </div>
      </div>

      {/* 筛选 */}
      <div className="fund-filters">
        <div className="fund-filter-group">
          <span className="cap dim fund-filter-label">REGION</span>
          <button className={"fund-fbtn " + (filterRegion==="all"?"on":"")} onClick={() => setFilterRegion("all")}>
            <span className="cap">全部</span><span className="cap dim">{events.length}</span>
          </button>
          {Object.keys(REGION_META).filter(k => regionCounts[k]).map(k => (
            <button key={k} className={"fund-fbtn " + (filterRegion===k?"on":"")} onClick={() => setFilterRegion(k)}>
              <span className="fund-fflag">{REGION_META[k].flag}</span>
              <span className="zh">{REGION_META[k].name}</span>
              <span className="cap dim">{regionCounts[k]}</span>
            </button>
          ))}
        </div>
        <div className="fund-filter-group">
          <span className="cap dim fund-filter-label">AMOUNT</span>
          {[
            { id: "all",     label: "全部" },
            { id: ">100",    label: "≥ $100M" },
            { id: ">1000",   label: "≥ $1B" },
            { id: ">10000",  label: "≥ $10B" }
          ].map(t => (
            <button key={t.id} className={"fund-fbtn " + (filterTier===t.id?"on":"")} onClick={() => setFilterTier(t.id)}>
              <span className="cap">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div className="fund-list">
        <div className="fund-head">
          <span className="cap">No.</span>
          <span className="cap">Region · Date</span>
          <span className="cap">Company</span>
          <span className="cap">Round</span>
          <span className="cap fund-amt-h">Amount</span>
          <span className="cap">Lead</span>
        </div>
        {filtered.map((e, i) => (
          <FundingRow key={e.id} e={e} idx={i} onClick={() => setActiveId(e.id)} />
        ))}
        {filtered.length === 0 && <div className="l-empty zh">没有符合筛选条件的事件。</div>}
      </div>

      <div className="l-foot">
        <span className="cap s">显示 {filtered.length} / {events.length} 项</span>
        <span className="hr-line" />
        <span className="cap s">下次抓取 · {data.meta.next_crawl_due}</span>
      </div>
    </div>
  );
}

function FundingRow({ e, idx, onClick }) {
  const region = REGION_META[e.region] || REGION_META.Other;
  const tags = (e.industry_tags || []).slice(0, 3);
  // 金额量级颜色
  const amt = e.amount_usd_m || 0;
  const amtClass = amt >= 10000 ? "fund-amt-mega" : amt >= 1000 ? "fund-amt-large" : amt >= 100 ? "fund-amt-mid" : "fund-amt-small";

  return (
    <div className="fund-row" style={{animationDelay:(idx*0.03)+"s"}} onClick={onClick}>
      <span className="cap fund-rk">{String(idx+1).padStart(2,"0")}</span>
      <div className="fund-region-date">
        <span className="fund-flag">{region.flag}</span>
        <div>
          <div className="zh fund-region-name">{region.name}</div>
          <div className="cap dim fund-date">{e.date}</div>
        </div>
      </div>
      <div className="fund-company-block">
        <div className="fund-name-row">
          <span className="zh fund-name">{e.company}</span>
          {e.product && <span className="cap dim fund-product">/ {e.product}</span>}
        </div>
        <div className="fund-desc zh dim">{e.description}</div>
        <div className="fund-tags">
          {tags.map((t, ti) => <span key={ti} className="cap fund-tag">{t}</span>)}
        </div>
      </div>
      <div className="fund-round-block">
        <span className="cap fund-round">{e.round}</span>
        {e.valuation && <span className="cap dim fund-val">估 {e.valuation}</span>}
      </div>
      <div className={"fund-amt " + amtClass}>
        <span className="fund-amt-num">{e.amount}</span>
      </div>
      <div className="fund-lead">
        <span className="cap dim fund-lead-label">LEAD</span>
        <span className="zh fund-lead-name">{e.lead_investor || "未披露"}</span>
      </div>
    </div>
  );
}

function FundingDetail({ event: e, onBack }) {
  const region = REGION_META[e.region] || REGION_META.Other;
  const amt = e.amount_usd_m || 0;
  const amtClass = amt >= 10000 ? "fund-amt-mega" : amt >= 1000 ? "fund-amt-large" : amt >= 100 ? "fund-amt-mid" : "fund-amt-small";

  return (
    <div className="l-section fund-detail">
      <button className="fund-back" onClick={onBack}>
        <span className="cap">← BACK TO FUNDING LIST</span>
      </button>

      <div className="fund-detail-head">
        <div className="fund-detail-l">
          <div className="fund-detail-meta">
            <span className="fund-detail-flag">{region.flag}</span>
            <span className="zh">{region.name}</span>
            <span className="cap dim">·</span>
            <span className="cap">{e.date}</span>
            <span className="cap dim">·</span>
            <span className="cap">{e.round}</span>
          </div>
          <h1 className="fund-detail-name">
            <span className="zh">{e.company}</span>
          </h1>
          {e.product && <div className="serif fund-detail-product">{e.product}</div>}
          <p className="zh fund-detail-desc">{e.description}</p>
        </div>
        <div className="fund-detail-r">
          <div className="fund-detail-amount">
            <span className="cap dim">RAISED</span>
            <span className={"fund-detail-amt-num " + amtClass}>{e.amount}</span>
          </div>
          {e.valuation && (
            <div className="fund-detail-val">
              <span className="cap dim">VALUATION</span>
              <span className="fund-detail-val-num">{e.valuation}</span>
            </div>
          )}
        </div>
      </div>

      {/* 投资方 */}
      <div className="fund-detail-section">
        <div className="fund-detail-shead">
          <span className="cap">A · INVESTORS</span>
          <span className="zh dim fund-detail-shead-zh">投资方</span>
        </div>
        <div className="fund-detail-investors">
          {e.lead_investor && e.lead_investor !== "—" && (
            <div className="fund-investor fund-investor-lead">
              <span className="cap dim fund-investor-label">LEAD</span>
              <span className="zh fund-investor-name">{e.lead_investor}</span>
            </div>
          )}
          {(e.investors || []).filter(i => i !== e.lead_investor).map((inv, idx) => (
            <div key={idx} className="fund-investor">
              <span className="zh fund-investor-name">{inv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 详细描述 */}
      {e.detail && e.detail.full_description && (
        <div className="fund-detail-section">
          <div className="fund-detail-shead">
            <span className="cap">B · CONTEXT</span>
            <span className="zh dim fund-detail-shead-zh">背景</span>
          </div>
          <p className="zh fund-detail-full">{e.detail.full_description}</p>
        </div>
      )}

      {/* 历史轮次 */}
      {e.detail && e.detail.previous_rounds && e.detail.previous_rounds.length > 0 && (
        <div className="fund-detail-section">
          <div className="fund-detail-shead">
            <span className="cap">C · PREVIOUS ROUNDS</span>
            <span className="zh dim fund-detail-shead-zh">历史轮次</span>
          </div>
          <div className="fund-prev-rounds">
            {e.detail.previous_rounds.map((p, idx) => (
              <div key={idx} className="fund-prev-row">
                <span className="cap dim">{String(idx+1).padStart(2,"0")}</span>
                <span className="cap fund-prev-round">{p.round}</span>
                <span className="fund-prev-amt">{p.amount}</span>
                {p.valuation && <span className="cap dim">@ {p.valuation}</span>}
                <span className="cap dim fund-prev-date">{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 标签 */}
      {e.industry_tags && e.industry_tags.length > 0 && (
        <div className="fund-detail-section">
          <div className="fund-detail-shead">
            <span className="cap">D · TAGS</span>
          </div>
          <div className="fund-tags">
            {e.industry_tags.map((t, ti) => <span key={ti} className="cap fund-tag">{t}</span>)}
          </div>
        </div>
      )}

      {/* 来源 */}
      <div className="fund-detail-section fund-detail-source">
        <div className="fund-detail-shead">
          <span className="cap">SOURCE · 数据来源</span>
        </div>
        <div className="fund-detail-source-list">
          {e.source && e.source.url && (
            <a href={e.source.url} target="_blank" rel="noopener" className="fund-detail-source-link cap">
              {e.source.name} ↗
            </a>
          )}
          {e.detail && e.detail.company_website && (
            <a href={e.detail.company_website} target="_blank" rel="noopener" className="fund-detail-source-link cap">
              公司主页 ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const libCss = `
.lib { position: absolute; inset: 0; padding: 110px 36px 36px; overflow-y: auto; }

/* ── Section tabs (catalogue / funding) ── */
.l-sections {
  display: flex; gap: 0;
  border-bottom: 1px solid var(--line);
  margin-bottom: 28px;
}
.l-sec {
  display: flex; gap: 12px; align-items: baseline;
  padding: 16px 24px;
  border: 1px solid transparent;
  border-bottom: none;
  margin-bottom: -1px;
  color: var(--ink-40);
  transition: all 0.2s;
}
.l-sec:hover { color: var(--ink-70); }
.l-sec.on {
  color: var(--ink);
  border-color: var(--line);
  background: rgba(244,242,238,0.02);
  border-bottom-color: var(--bg);
}
.l-sec-num { font-variant-numeric: tabular-nums; }
.l-sec-zh { font-size: 18px; font-weight: 500; letter-spacing: 0.06em; }
.l-sec-en { letter-spacing: 0.24em; }

.l-section { display: flex; flex-direction: column; }

.l-head { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: end; padding-bottom: 24px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
.l-eyebrow { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.l-title { display: flex; gap: 18px; align-items: baseline; line-height: 1; margin-bottom: 14px; }
.l-zh {
  font-size: 88px; font-weight: 200; letter-spacing: 0.16em; padding-left: 0.16em;
  color: var(--ink);
}
.l-serif { font-size: 28px; color: var(--ink-70); }
.l-lede { font-size: 14px; color: var(--ink-70); max-width: 640px; line-height: 1.7; }

.l-head-r { display: flex; gap: 12px; align-items: center; }
.l-search { display: flex; gap: 10px; align-items: center; padding: 10px 14px; border: 1px solid var(--line-strong); min-width: 280px; }
.l-search input { flex: 1; background: transparent; border: none; color: var(--ink); font-size: 13px; outline: none; }
.l-search input::placeholder { color: var(--ink-40); }
.l-search kbd { padding: 2px 6px; border: 1px solid var(--line); border-radius: 3px; background: rgba(244,242,238,0.05); font-size: 9px; }
.l-view { display: flex; border: 1px solid var(--line); }
.l-view button { padding: 10px 14px; border-right: 1px solid var(--line); transition: all 0.2s; }
.l-view button:last-child { border-right: none; }
.l-view button.on { background: var(--ink); color: var(--bg); }

.l-tabs { display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 32px; border-bottom: 1px solid var(--line); }
.l-tab {
  display: flex; gap: 10px; align-items: baseline;
  padding: 14px 18px;
  border: 1px solid transparent;
  border-bottom: none;
  margin-bottom: -1px;
  color: var(--ink-40);
  transition: all 0.2s;
}
.l-tab:hover { color: var(--ink-70); }
.l-tab.on {
  color: var(--ink);
  border-color: var(--line);
  background: var(--bg);
}
.l-tab .zh { font-size: 14px; font-weight: 500; }

/* Grid */
.l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
.l-empty { padding: 60px; text-align: center; color: var(--ink-40); grid-column: 1 / -1; }

.agent {
  position: relative;
  border: 1px solid var(--line);
  margin: -1px 0 0 -1px;
  padding: 22px;
  display: flex; flex-direction: column; gap: 18px;
  transition: background 0.3s, transform 0.3s, border-color 0.3s;
  animation: agIn 0.6s cubic-bezier(.4,0,.2,1) backwards;
  overflow: hidden;
}
@keyframes agIn { from { opacity: 0; transform: translateY(6px); } }
.agent:hover { background: rgba(244,242,238,0.02); z-index: 2; border-color: var(--ic); }
.agent.hover { border-color: var(--ic); }
.ag-aura {
  position: absolute; inset: -40%;
  background: radial-gradient(ellipse at 30% 20%, var(--ic), transparent 60%);
  opacity: 0; transition: opacity 0.5s; pointer-events: none; filter: blur(40px);
  mix-blend-mode: screen;
}
.agent:hover .ag-aura { opacity: 0.18; }

.ag-glyph {
  font-family: var(--f-serif);
  font-size: 96px;
  font-weight: 300;
  color: var(--ic);
  line-height: 1;
  position: relative; z-index: 2;
  transition: transform 0.6s cubic-bezier(.4,0,.2,1), text-shadow 0.4s;
  text-shadow: 0 0 24px color-mix(in srgb, var(--ic) 35%, transparent);
}
.agent:hover .ag-glyph { transform: rotate(-3deg) scale(1.04); text-shadow: 0 0 36px var(--ic); }

.ag-glyph-row { position: relative; height: 110px; display: grid; place-items: center; }
.ag-rings { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.ag-ring { position: absolute; border: 1px solid var(--line); border-radius: 50%; transition: transform 0.6s, border-color 0.6s; }
.ag-ring.r1 { width: 86px; height: 86px; border-color: color-mix(in srgb, var(--ic) 35%, transparent); }
.ag-ring.r2 { width: 116px; height: 116px; border-color: color-mix(in srgb, var(--ic) 18%, transparent); }
.agent:hover .ag-ring.r1 { transform: scale(1.1); border-color: var(--ic); }
.agent:hover .ag-ring.r2 { transform: scale(1.06); border-color: color-mix(in srgb, var(--ic) 50%, transparent); }

.ag-head { display: flex; justify-content: space-between; align-items: center; }
.ag-tag { padding: 3px 8px; border: 1px solid var(--line); font-size: 9px; }
.ag-tag.premier {
  background: linear-gradient(95deg, #8B7FE8 0%, #E26B8C 55%, #E8946A 100%);
  color: #FFFFFF; border-color: transparent;
}
.ag-tag.featured { color: var(--c-cyan); border-color: rgba(74,107,114,0.3); background: rgba(74,107,114,0.05); }
.ag-tag.standard { color: var(--ink-70); }

.ag-id { display: flex; flex-direction: column; gap: 4px; }
.ag-zh { font-size: 22px; font-weight: 500; letter-spacing: 0.04em; }
.ag-en { display: flex; gap: 10px; align-items: baseline; }
.ag-name { font-size: 14px; color: var(--ink-70); }

.ag-desc { font-size: 13px; color: var(--ink-70); line-height: 1.65; min-height: 42px; }

.ag-meta { display: flex; flex-direction: column; gap: 6px; padding: 14px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.ag-meta-row { display: flex; justify-content: space-between; align-items: baseline; }
.ag-meta-row .zh { font-size: 12px; }
.ag-meta-row .cap { color: var(--ink); }

.ag-foot { display: flex; }
.ag-cta {
  flex: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--line-strong);
  transition: all 0.3s;
}
.ag-cta:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.ag-cta .zh { font-size: 13px; font-weight: 500; letter-spacing: 0.06em; }

/* List view */
.l-list { display: flex; flex-direction: column; }
.ll-head, .ll-row { display: grid; grid-template-columns: 60px 2fr 1fr 0.8fr 1fr 0.8fr 0.8fr 80px; gap: 18px; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.ll-head { color: var(--ink-40); border-bottom: 1px solid var(--line-strong); }
.ll-row { animation: agIn 0.5s cubic-bezier(.4,0,.2,1) backwards; transition: background 0.2s; }
.ll-row:hover { background: rgba(244,242,238,0.02); }
.ll-name { display: flex; gap: 12px; align-items: center; }
.ll-glyph { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--line-strong); font-family: var(--f-serif); font-size: 18px; }
.ll-zh { font-size: 14px; font-weight: 500; }
.ll-go { padding: 6px 10px; border: 1px solid var(--line-strong); transition: all 0.2s; }
.ll-go:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }

.l-foot { display: flex; gap: 18px; align-items: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid var(--line); color: var(--ink-40); }
.l-foot .hr-line { flex: 1; height: 1px; background: var(--line); }

/* ──────────────────────────────────────────────
 * Funding · 投融资模块
 * ────────────────────────────────────────────── */

.fund-filters {
  display: flex; gap: 36px; flex-wrap: wrap;
  padding: 16px 0 24px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 8px;
}
.fund-filter-group { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.fund-filter-label { letter-spacing: 0.32em; margin-right: 8px; }
.fund-fbtn {
  display: flex; gap: 8px; align-items: baseline;
  padding: 8px 14px;
  border: 1px solid var(--line);
  color: var(--ink-70);
  transition: all 0.2s;
}
.fund-fbtn:hover { color: var(--ink); border-color: var(--line-strong); }
.fund-fbtn.on { color: var(--ink); background: rgba(244,242,238,0.04); border-color: var(--line-strong); }
.fund-fbtn .zh { font-size: 13px; }
.fund-fflag { font-size: 13px; line-height: 1; }

/* List */
.fund-list { display: flex; flex-direction: column; }
.fund-head, .fund-row {
  display: grid;
  grid-template-columns: 40px 110px minmax(220px, 2fr) 1fr 1fr 1.2fr;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border-bottom: 1px solid var(--line);
}
.fund-head {
  color: var(--ink-40);
  border-bottom: 1px solid var(--line-strong);
  padding: 12px 18px;
}
.fund-row {
  animation: agIn 0.5s cubic-bezier(.4,0,.2,1) backwards;
  transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
}
.fund-row:hover { background: rgba(244,242,238,0.02); border-color: var(--line-strong); }
.fund-rk { font-variant-numeric: tabular-nums; color: var(--ink-40); }

.fund-region-date { display: flex; gap: 10px; align-items: center; }
.fund-flag { font-size: 22px; line-height: 1; }
.fund-region-name { font-size: 12px; font-weight: 500; }
.fund-date { font-variant-numeric: tabular-nums; }

.fund-company-block { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.fund-name-row { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.fund-name { font-size: 15px; font-weight: 500; letter-spacing: 0.02em; }
.fund-product { font-size: 11px; }
.fund-desc { font-size: 11px; line-height: 1.5; color: var(--ink-40); }
.fund-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.fund-tag {
  padding: 2px 8px;
  border: 1px solid var(--line);
  font-size: 9px;
  color: var(--ink-70);
  letter-spacing: 0.08em;
}

.fund-round-block { display: flex; flex-direction: column; gap: 4px; }
.fund-round { color: var(--ink); }
.fund-val { font-size: 9px; }

.fund-amt { display: flex; flex-direction: column; gap: 2px; }
.fund-amt-h { text-align: left; }
.fund-amt-num {
  font-family: var(--f-sans);
  font-size: 22px;
  font-weight: 300;
  letter-spacing: -0.01em;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.fund-amt-mega .fund-amt-num {
  background: linear-gradient(95deg, #8B7FE8 0%, #E26B8C 55%, #E8946A 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
}
.fund-amt-large .fund-amt-num { color: var(--c-magenta); }
.fund-amt-mid .fund-amt-num { color: var(--ink); }
.fund-amt-small .fund-amt-num { color: var(--ink-70); font-size: 18px; }

.fund-lead { display: flex; flex-direction: column; gap: 3px; }
.fund-lead-label { letter-spacing: 0.32em; }
.fund-lead-name { font-size: 12px; }

/* Detail */
.fund-detail { display: flex; flex-direction: column; gap: 28px; }
.fund-back {
  align-self: flex-start;
  padding: 8px 14px;
  border: 1px solid var(--line-strong);
  transition: all 0.2s;
  margin-bottom: 8px;
}
.fund-back:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.fund-back .cap { letter-spacing: 0.24em; }

.fund-detail-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 36px;
  align-items: flex-start;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--line);
}
.fund-detail-l { display: flex; flex-direction: column; gap: 14px; }
.fund-detail-meta { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
.fund-detail-flag { font-size: 16px; line-height: 1; }
.fund-detail-name { line-height: 1; }
.fund-detail-name .zh {
  font-size: 64px;
  font-weight: 200;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.fund-detail-product {
  font-size: 22px; font-style: italic; color: var(--ink-70);
}
.fund-detail-desc {
  font-size: 16px; color: var(--ink-70); line-height: 1.65;
  max-width: 720px;
  margin-top: 8px;
}

.fund-detail-r {
  display: flex; flex-direction: column; gap: 16px;
  min-width: 220px; align-items: flex-end;
}
.fund-detail-amount, .fund-detail-val {
  display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
}
.fund-detail-amt-num {
  font-family: var(--f-sans);
  font-size: 56px;
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.fund-amt-mega .fund-detail-amt-num,
.fund-detail-amt-num.fund-amt-mega {
  background: linear-gradient(95deg, #8B7FE8 0%, #E26B8C 55%, #E8946A 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
}
.fund-detail-val-num {
  font-family: var(--f-sans);
  font-size: 28px;
  font-weight: 300;
  color: var(--ink-70);
  font-variant-numeric: tabular-nums;
}

.fund-detail-section { display: flex; flex-direction: column; gap: 14px; }
.fund-detail-shead {
  display: flex; gap: 14px; align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}
.fund-detail-shead .cap { letter-spacing: 0.24em; }
.fund-detail-shead-zh { font-size: 12px; }

.fund-detail-investors { display: flex; flex-wrap: wrap; gap: 12px; }
.fund-investor {
  display: flex; gap: 10px; align-items: baseline;
  padding: 10px 16px;
  border: 1px solid var(--line);
  background: rgba(244,242,238,0.02);
}
.fund-investor-lead {
  border-color: var(--line-strong);
  background: rgba(226,107,140,0.06);
}
.fund-investor-label { letter-spacing: 0.32em; color: var(--c-magenta); }
.fund-investor-name { font-size: 14px; font-weight: 500; }

.fund-detail-full {
  font-size: 14px; color: var(--ink-70); line-height: 1.8;
  max-width: 820px;
}

.fund-prev-rounds { display: flex; flex-direction: column; gap: 0; }
.fund-prev-row {
  display: grid;
  grid-template-columns: 30px 1fr auto auto auto;
  gap: 18px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  align-items: baseline;
}
.fund-prev-row:last-child { border-bottom: none; }
.fund-prev-round { color: var(--ink); }
.fund-prev-amt { font-family: var(--f-sans); font-size: 18px; font-weight: 300; color: var(--ink); font-variant-numeric: tabular-nums; }
.fund-prev-date { font-variant-numeric: tabular-nums; }

.fund-detail-source-list { display: flex; gap: 14px; flex-wrap: wrap; }
.fund-detail-source-link {
  padding: 8px 14px;
  border: 1px solid var(--line-strong);
  color: var(--ink-70);
  text-decoration: none;
  transition: all 0.2s;
  letter-spacing: 0.12em;
}
.fund-detail-source-link:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }
`;

window.Library = Library;
