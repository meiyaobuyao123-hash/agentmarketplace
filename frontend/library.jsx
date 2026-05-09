/* Library · 万象集 · catalogue grid */
const { useState: useStateL, useMemo: useMemoL } = React;

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
    <div className="lib">
      <div className="grid-bg" />

      <div className="l-head">
        <div className="l-head-l">
          <div className="l-eyebrow">
            <span className="cap s">No. III · catalogue</span>
            <span className="hr-line" style={{maxWidth:60}} />
            <span className="cap">{AGENTS.length.toString().padStart(4,"0")} entries</span>
          </div>
          <h1 className="l-title">
            <span className="zh l-zh">万象集</span>
            <span className="serif l-serif">— a catalogue of one&nbsp;thousand&nbsp;agents</span>
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

      <style>{libCss}</style>
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

const libCss = `
.lib { position: absolute; inset: 0; padding: 110px 36px 36px; overflow-y: auto; }

.l-head { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: end; padding-bottom: 24px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
.l-eyebrow { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.l-title { display: flex; gap: 18px; align-items: baseline; line-height: 1; margin-bottom: 14px; }
.l-zh {
  font-size: 88px; font-weight: 200; letter-spacing: 0.16em; padding-left: 0.16em;
  color: var(--ink);
}
.l-serif { font-size: 28px; color: var(--ink-70); }
.l-lede { font-size: 14px; color: var(--ink-70); max-width: 540px; line-height: 1.7; }

.l-head-r { display: flex; gap: 12px; align-items: center; }
.l-search { display: flex; gap: 10px; align-items: center; padding: 10px 14px; border: 1px solid var(--line-strong); min-width: 280px; }
.l-search input { flex: 1; background: transparent; border: none; color: var(--ink); font-size: 13px; outline: none; }
.l-search input::placeholder { color: var(--ink-40); }
.l-search kbd { padding: 2px 6px; border: 1px solid var(--line); border-radius: 3px; background: rgba(244,242,238,0.05); font-size: 9px; }
.l-view { display: flex; border: 1px solid var(--line); }
.l-view button { padding: 10px 14px; border-right: 1px solid var(--line); transition: all 0.2s; }
.l-view button:last-child { border-right: none; }
.l-view button.on { background: var(--ink); color: var(--bg); }

/* Industry tabs */
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

.ag-glyph-row { position: relative; height: 110px; display: grid; place-items: center; }
.ag-glyph {
  font-family: var(--f-serif);
  font-size: 96px;
  font-weight: 300;
  color: var(--ink);
  line-height: 1;
  position: relative; z-index: 2;
  transition: transform 0.6s cubic-bezier(.4,0,.2,1);
}
.agent:hover .ag-glyph { transform: rotate(-3deg) scale(1.04); }

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
.ag-rings { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.ag-ring { position: absolute; border: 1px solid var(--line); border-radius: 50%; transition: transform 0.6s, border-color 0.6s; }
.ag-ring.r1 { width: 86px; height: 86px; }
.ag-ring.r2 { width: 116px; height: 116px; }
.agent:hover .ag-ring.r1 { transform: scale(1.1); border-color: var(--line-strong); }
.agent:hover .ag-ring.r2 { transform: scale(1.06); }

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
`;

window.Library = Library;
