/* CATEGORIES · 万象集 · 行业分类 + Agent 卡片库 */
const { useState: useStateCat, useMemo: useMemoCat } = React;

function Categories() {
  const cats = [
    { id: "all", cn: "全部", en: "ALL", ic: "✦", c: "#B19FFF" },
    { id: "code", cn: "软件工程", en: "ENGINEERING", ic: "{/}", c: "#7DF9FF" },
    { id: "design", cn: "视觉创作", en: "VISUAL", ic: "◇", c: "#FF6EC7" },
    { id: "write", cn: "内容营销", en: "CONTENT", ic: "✱", c: "#9EF8E2" },
    { id: "data", cn: "金融数据", en: "FINANCE", ic: "▤", c: "#FFD27A" },
    { id: "edu", cn: "教育辅导", en: "EDUCATION", ic: "◎", c: "#FFB6E1" },
    { id: "ops", cn: "客服运营", en: "OPERATIONS", ic: "❍", c: "#B19FFF" },
    { id: "hr", cn: "招聘管理", en: "HR", ic: "△", c: "#7DF9FF" },
    { id: "med", cn: "医疗咨询", en: "HEALTH", ic: "✚", c: "#FF6EC7" },
    { id: "law", cn: "法律咨询", en: "LEGAL", ic: "§", c: "#9EF8E2" },
    { id: "game", cn: "游戏 NPC", en: "GAMING", ic: "◈", c: "#FFD27A" },
    { id: "trans", cn: "翻译同传", en: "TRANSLATE", ic: "文", c: "#FFB6E1" },
  ];

  const agents = [
    { name: "AlphaCoder", cn: "全栈代码体", cat: "code", ic: "{/}", c: "#7DF9FF", price: "Pro", calls: "284K", rating: 4.92, tags: ["代码生成","调试","重构"], rare: "Legendary", desc: "理解整个代码库，跨文件重构，一人即一支前端组。" },
    { name: "Lumen", cn: "视觉构图师", cat: "design", ic: "◇", c: "#FF6EC7", price: "Free", calls: "198K", rating: 4.88, tags: ["排版","海报","品牌"], rare: "Epic", desc: "把一个 brief 翻译成 24 套视觉提案，从概念到高保真。" },
    { name: "Stellar", cn: "文案策划体", cat: "write", ic: "✱", c: "#B19FFF", price: "Pro", calls: "176K", rating: 4.81, tags: ["文案","策划","SEO"], rare: "Epic", desc: "一句话品牌主张，到三万字白皮书，皆能驾驭。" },
    { name: "Quanta", cn: "数据观测员", cat: "data", ic: "▤", c: "#9EF8E2", price: "Pro", calls: "143K", rating: 4.93, tags: ["数据","分析","报告"], rare: "Legendary", desc: "实时市场数据，自动生成研究报告与异常预警。" },
    { name: "Nova", cn: "多语翻译官", cat: "trans", ic: "文", c: "#FFD27A", price: "Free", calls: "118K", rating: 4.76, tags: ["翻译","本地化"], rare: "Rare", desc: "27 种语言，文化语境校准，电影字幕级地道翻译。" },
    { name: "Echo", cn: "客服守夜人", cat: "ops", ic: "❍", c: "#FFB6E1", price: "Pro", calls: "96K", rating: 4.65, tags: ["客服","对话","工单"], rare: "Rare", desc: "二十四小时不眠，在客户开口之前就理解问题。" },
    { name: "Atlas", cn: "调研航海家", cat: "data", ic: "⊕", c: "#7DF9FF", price: "Pro", calls: "84K", rating: 4.79, tags: ["调研","行业","竞品"], rare: "Epic", desc: "搜遍开放网络，整理成可信赖的行业地图。" },
    { name: "Cipher", cn: "代码审计员", cat: "code", ic: "▣", c: "#B19FFF", price: "Pro", calls: "72K", rating: 4.84, tags: ["安全","审计","漏洞"], rare: "Epic", desc: "在恶意代码到达前，识破它的伪装。" },
    { name: "Sage", cn: "教学引导师", cat: "edu", ic: "◎", c: "#9EF8E2", price: "Free", calls: "61K", rating: 4.72, tags: ["辅导","习题","拆解"], rare: "Common", desc: "每一道难题都有它的解法，每一个学生都有它的节奏。" },
    { name: "Helix", cn: "医疗咨询助手", cat: "med", ic: "✚", c: "#FF6EC7", price: "Pro", calls: "43K", rating: 4.81, tags: ["问诊","导诊","健康"], rare: "Rare", desc: "结构化问诊与导诊，连接医院真实数据。" },
    { name: "Verdict", cn: "法务速览", cat: "law", ic: "§", c: "#FFD27A", price: "Pro", calls: "38K", rating: 4.77, tags: ["合同","审阅","法规"], rare: "Rare", desc: "合同审阅、争议焦点提炼、判例检索一气呵成。" },
    { name: "Aria", cn: "招聘读心术", cat: "hr", ic: "△", c: "#7DF9FF", price: "Free", calls: "32K", rating: 4.58, tags: ["简历","JD","面试"], rare: "Common", desc: "解码简历背后的真实信号，写出无可挑剔的 JD。" },
  ];

  const [active, setActive] = useStateCat("all");
  const [view, setView] = useStateCat("grid"); // grid | list
  const [q, setQ] = useStateCat("");

  const filtered = useMemoCat(() => {
    return agents.filter(a =>
      (active === "all" || a.cat === active) &&
      (q === "" || a.name.toLowerCase().includes(q.toLowerCase()) || a.cn.includes(q) || a.tags.some(t => t.includes(q)))
    );
  }, [active, q]);

  return (
    <div className="lib">
      <div className="lib-bg">
        <div className="aurora" style={{ opacity: 0.18 }} />
        <div className="starfield" style={{ opacity: 0.4 }} />
      </div>

      <div className="lib-head">
        <div>
          <div className="dh-eyebrow">
            <span className="hud-dot" />
            <span className="mono">CATALOG / 行业分类 · {filtered.length} / {agents.length} 个 AGENT</span>
          </div>
          <h1 className="dh-title">
            <span className="chrome-text">万象集</span>
            <span className="dh-sub holo-text">LIBRARY</span>
          </h1>
        </div>
        <div className="lib-tools">
          <div className="search">
            <span className="mono">⌕</span>
            <input
              placeholder="召唤一个 Agent · 名字、能力或标签"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <span className="mono dim">⌘ F</span>
          </div>
          <div className="view-toggle">
            <button className={view==="grid"?"on":""} onClick={() => setView("grid")}>▦</button>
            <button className={view==="list"?"on":""} onClick={() => setView("list")}>≡</button>
          </div>
        </div>
      </div>

      {/* Category rail */}
      <div className="cat-rail">
        {cats.map(c => {
          const count = c.id === "all" ? agents.length : agents.filter(a => a.cat === c.id).length;
          return (
            <button
              key={c.id}
              className={"cat-chip " + (active === c.id ? "active" : "")}
              onClick={() => setActive(c.id)}
              style={{ "--c": c.c }}
            >
              <span className="cc-ic" style={{ color: c.c }}>{c.ic}</span>
              <span className="cc-cn">{c.cn}</span>
              <span className="cc-en mono">{c.en}</span>
              <span className="cc-count mono">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className={"cards " + view}>
        {filtered.map((a, i) => (
          <AgentCard key={a.name} a={a} i={i} view={view} />
        ))}
        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-orb" />
            <div className="empty-text">未找到匹配的 Agent</div>
            <div className="empty-sub mono">TRY A DIFFERENT QUERY</div>
          </div>
        )}
      </div>

      <div className="noise" />
      <style>{libCss}</style>
    </div>
  );
}

function AgentCard({ a, i, view }) {
  const rareC = { Legendary: "#FFD27A", Epic: "#FF6EC7", Rare: "#7DF9FF", Common: "#9EF8E2" }[a.rare];

  return (
    <div
      className={"agent " + view + " rare-" + a.rare.toLowerCase()}
      style={{ "--c": a.c, "--rc": rareC, animationDelay: (i*0.04)+"s" }}
    >
      <div className="ag-foil" />
      <div className="ag-head">
        <div className="ag-ic-wrap">
          <div className="ag-ic" style={{ color: a.c }}>{a.ic}</div>
        </div>
        <div className="ag-rare mono" style={{ color: rareC, borderColor: rareC+"55" }}>
          ◆ {a.rare}
        </div>
      </div>

      <div className="ag-body">
        <div className="ag-name">
          <span className="ag-cn">{a.cn}</span>
          <span className="ag-en mono">{a.name.toUpperCase()}</span>
        </div>
        <p className="ag-desc">{a.desc}</p>
        <div className="ag-tags">
          {a.tags.map(t => <span key={t} className="ag-tag">#{t}</span>)}
        </div>
      </div>

      <div className="ag-foot">
        <div className="ag-meta">
          <div className="ag-stat"><span className="mono dim">★</span><span>{a.rating}</span></div>
          <div className="ag-stat"><span className="mono dim">↻</span><span>{a.calls}</span></div>
          <div className={"ag-price " + (a.price==="Free"?"free":"pro")}>{a.price}</div>
        </div>
        <button className="ag-cta">
          <span>召唤</span>
          <span>→</span>
        </button>
      </div>

      <div className="ag-glow" />
    </div>
  );
}

const libCss = `
.lib { position: absolute; inset: 0; padding: 110px 36px 36px; overflow-y: auto; }
.lib-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

.lib-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 28px;
  position: relative; z-index: 2;
}

.lib-tools { display: flex; gap: 10px; align-items: center; }
.search {
  display: flex; gap: 12px; align-items: center;
  padding: 12px 18px;
  width: 380px;
  border-radius: 99px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}
.search input {
  flex: 1; background: none; border: none; outline: none;
  color: white; font-size: 13px; font-family: var(--f-sans);
}
.search input::placeholder { color: rgba(255,255,255,0.4); }

.view-toggle {
  display: flex; gap: 4px;
  padding: 4px;
  border-radius: 99px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
}
.view-toggle button {
  width: 36px; height: 36px;
  border-radius: 99px;
  color: rgba(255,255,255,0.5);
  font-size: 16px;
}
.view-toggle button.on {
  background: linear-gradient(180deg, #fff, #c5ccdf);
  color: #1a1626;
}

/* Category rail */
.cat-rail {
  display: flex; gap: 8px; flex-wrap: wrap;
  margin-bottom: 28px;
  position: relative; z-index: 2;
}
.cat-chip {
  display: flex; gap: 10px; align-items: center;
  padding: 10px 16px;
  border-radius: 99px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 13px;
  transition: all 0.4s cubic-bezier(.25,.8,.25,1);
  position: relative;
  overflow: hidden;
}
.cat-chip::before {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 50%, var(--c), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}
.cat-chip:hover { border-color: var(--c); transform: translateY(-1px); }
.cat-chip:hover::before { opacity: 0.15; }
.cat-chip.active {
  background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
  border-color: rgba(255,255,255,0.3);
  box-shadow: 0 0 24px var(--c), inset 0 1px 0 rgba(255,255,255,0.4);
}
.cat-chip.active::before { opacity: 0.25; }
.cc-ic { font-family: var(--f-mono); font-weight: 700; text-shadow: 0 0 8px currentColor; position: relative; z-index: 1; }
.cc-cn { position: relative; z-index: 1; font-weight: 500; }
.cc-en { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 0.2em; position: relative; z-index: 1; }
.cc-count {
  font-size: 10px; padding: 2px 8px;
  border-radius: 99px;
  background: rgba(255,255,255,0.08);
  position: relative; z-index: 1;
}

/* Cards grid */
.cards { display: grid; gap: 16px; position: relative; z-index: 2; padding-bottom: 40px; }
.cards.grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.cards.list { grid-template-columns: 1fr; }

.agent {
  position: relative;
  border-radius: 22px;
  padding: 22px;
  background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015));
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.3);
  display: flex; flex-direction: column; gap: 16px;
  overflow: hidden;
  isolation: isolate;
  animation: cardIn 0.6s cubic-bezier(.25,.8,.25,1) backwards;
  transition: transform 0.4s cubic-bezier(.25,.8,.25,1), box-shadow 0.4s;
  cursor: pointer;
  min-height: 280px;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
}
.agent:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 30px var(--c), 0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.18);
}

.ag-foil {
  position: absolute; inset: 0;
  background: conic-gradient(
    from var(--angle, 0deg),
    transparent 0deg,
    var(--rc) 60deg,
    transparent 120deg,
    var(--c) 200deg,
    transparent 260deg,
    var(--rc) 320deg,
    transparent 360deg
  );
  opacity: 0.06;
  animation: angle 12s linear infinite;
  pointer-events: none;
  z-index: -1;
}
.agent.rare-legendary .ag-foil { opacity: 0.18; }
.agent.rare-epic .ag-foil { opacity: 0.12; }
.agent:hover .ag-foil { opacity: 0.25; }

.ag-glow {
  position: absolute;
  bottom: -40%; left: 50%;
  width: 80%; height: 80%;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at 50% 100%, var(--c), transparent 60%);
  opacity: 0;
  filter: blur(30px);
  pointer-events: none;
  transition: opacity 0.4s;
}
.agent:hover .ag-glow { opacity: 0.45; }

.ag-head { display: flex; justify-content: space-between; align-items: flex-start; }
.ag-ic-wrap {
  width: 56px; height: 56px;
  border-radius: 16px;
  display: grid; place-items: center;
  background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.3);
}
.ag-ic {
  font-family: var(--f-mono);
  font-size: 22px; font-weight: 700;
  text-shadow: 0 0 14px currentColor;
}
.ag-rare {
  font-size: 10px; letter-spacing: 0.2em;
  padding: 4px 10px;
  border: 1px solid;
  border-radius: 99px;
  background: rgba(0,0,0,0.3);
}

.ag-body { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.ag-name { display: flex; flex-direction: column; gap: 4px; }
.ag-cn { font-size: 22px; font-weight: 700; letter-spacing: 0.02em; }
.ag-en { font-size: 9px; color: var(--ink-faint); letter-spacing: 0.3em; }
.ag-desc { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.6; }
.ag-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.ag-tag {
  font-size: 10px; padding: 3px 9px;
  border-radius: 99px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.06);
}

.ag-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.ag-meta { display: flex; gap: 10px; align-items: center; }
.ag-stat { display: flex; gap: 4px; align-items: center; font-size: 11px; font-family: var(--f-mono); color: rgba(255,255,255,0.7); }
.ag-price {
  font-size: 10px; font-family: var(--f-mono);
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.2em;
}
.ag-price.free { background: rgba(158,248,226,0.12); color: #9EF8E2; }
.ag-price.pro { background: rgba(255,210,122,0.12); color: #FFD27A; }
.ag-cta {
  display: flex; gap: 8px; align-items: center;
  padding: 8px 14px;
  border-radius: 99px;
  background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.18);
  font-size: 12px;
  transition: all 0.3s;
}
.ag-cta:hover {
  background: linear-gradient(180deg, #fff, #c5ccdf);
  color: #1a1626;
  border-color: transparent;
}

/* List view */
.agent.list { flex-direction: row; align-items: center; gap: 24px; min-height: auto; padding: 18px 22px; }
.agent.list .ag-head { flex-direction: row; gap: 16px; align-items: center; flex: 0 0 auto; }
.agent.list .ag-body { flex-direction: row; gap: 18px; flex: 1; align-items: center; }
.agent.list .ag-name { flex: 0 0 200px; }
.agent.list .ag-desc { flex: 1; }
.agent.list .ag-tags { flex: 0 0 auto; }
.agent.list .ag-foot { flex: 0 0 auto; padding-top: 0; border: none; gap: 14px; }

/* Empty */
.empty {
  grid-column: 1 / -1;
  display: flex; flex-direction: column; gap: 14px; align-items: center;
  padding: 80px 0;
}
.empty-orb {
  width: 120px; height: 120px;
  border-radius: 50%;
  background: conic-gradient(from var(--angle,0deg), #FF6EC7, #B19FFF, #7DF9FF, #FF6EC7);
  animation: angle 6s linear infinite;
  opacity: 0.4;
  filter: blur(2px);
}
.empty-text { font-size: 16px; color: rgba(255,255,255,0.7); }
.empty-sub { font-size: 10px; letter-spacing: 0.3em; color: var(--ink-faint); }
`;

window.Categories = Categories;
