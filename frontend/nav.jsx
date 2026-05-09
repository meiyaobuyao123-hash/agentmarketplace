/* Nav · minimal hairline · top frame */
const { useState: useStateN, useEffect: useEffectN } = React;

function Nav({ tab, onTransition }) {
  const tabs = [
    { id: "home", cn: "首页", en: "Home" },
    { id: "dashboard", cn: "看板", en: "Console" },
    { id: "library", cn: "万象集", en: "Library" },
  ];

  return (
    <nav className="nav">
      <div className="n-brand">
        <div className="n-mark"><div className="n-mark-i" /></div>
        <div className="n-brand-text">
          <div className="zh n-brand-zh">万象</div>
          <div className="cap n-brand-en">Marketplace · v2.6</div>
        </div>
      </div>

      <div className="n-tabs">
        {tabs.map((t,i) => (
          <button key={t.id} className={"n-tab " + (tab===t.id?"on":"")} onClick={() => onTransition(t.id)}>
            <span className="cap n-tab-num">0{i+1}</span>
            <span className="zh n-tab-cn">{t.cn}</span>
            <span className="cap n-tab-en">{t.en}</span>
            {tab===t.id && <span className="n-tab-mark" />}
          </button>
        ))}
      </div>

      <div className="n-right">
        <div className="n-status">
          <span className="dot-live" />
          <span className="cap">All systems · 1,247 agents</span>
        </div>
        <button className="n-key">
          <span className="zh">召唤</span>
          <kbd className="cap">⌘ K</kbd>
        </button>
      </div>

      <div className="n-rule" />

      <style>{navCss}</style>
    </nav>
  );
}

const navCss = `
.nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 22px 36px 22px;
  gap: 32px;
  background: transparent;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.n-rule {
  position: absolute; left: 36px; right: 36px; bottom: 0;
  height: 1px; background: var(--line);
}

.n-brand { display: flex; gap: 14px; align-items: center; }
.n-mark {
  width: 28px; height: 28px;
  border: 1px solid var(--line-strong);
  display: grid; place-items: center;
  position: relative;
}
.n-mark::before, .n-mark::after {
  content: ""; position: absolute;
  background: var(--ink);
}
.n-mark::before { left: -2px; right: -2px; top: 50%; height: 1px; }
.n-mark::after  { top: -2px; bottom: -2px; left: 50%; width: 1px; }
.n-mark-i {
  width: 8px; height: 8px;
  background: var(--ink);
  border-radius: 50%;
}
.n-brand-zh { font-size: 18px; font-weight: 500; letter-spacing: 0.08em; line-height: 1; }
.n-brand-en { margin-top: 4px; font-size: 9px; }

.n-tabs {
  display: flex; gap: 0;
  border: 1px solid var(--line);
  border-radius: 0;
}
.n-tab {
  position: relative;
  display: flex; gap: 10px; align-items: baseline;
  padding: 12px 22px;
  white-space: nowrap;
  border-right: 1px solid var(--line);
  color: var(--ink-40);
  transition: color 0.3s, background 0.3s;
}
.n-tab:last-child { border-right: none; }
.n-tab:hover { color: var(--ink-70); background: rgba(244,242,238,0.02); }
.n-tab.on { color: var(--ink); background: rgba(244,242,238,0.04); }
.n-tab-num { color: inherit; opacity: 0.5; white-space: nowrap; }
.n-tab-cn { font-size: 14px; font-weight: 500; letter-spacing: 0.04em; white-space: nowrap; }
.n-tab-en { color: inherit; opacity: 0.5; font-size: 9px; white-space: nowrap; }
.n-status .cap, .n-key .zh, .n-key kbd { white-space: nowrap; }
.n-tab-mark {
  position: absolute; left: 14px; right: 14px; bottom: -1px;
  height: 1px; background: var(--ink);
}

.n-right { display: flex; gap: 18px; align-items: center; justify-self: end; }
.n-status { display: flex; gap: 10px; align-items: center; }
.n-key {
  display: flex; gap: 10px; align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--line-strong);
  font-size: 13px;
  transition: all 0.3s;
}
.n-key:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.n-key kbd {
  padding: 2px 6px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: rgba(244,242,238,0.05);
  font-size: 9px;
}
.n-key:hover kbd { color: var(--bg); border-color: rgba(0,0,0,0.2); background: rgba(0,0,0,0.08); }
`;

/* Page transition · single hairline draw */
function Transition({ active, target, onComplete }) {
  useEffectN(() => {
    if (!active) return;
    const t = setTimeout(() => onComplete && onComplete(), 900);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;
  const labels = { home: "首页 / Home", dashboard: "看板 / Console", library: "万象集 / Library" };
  return (
    <div className="t-overlay">
      <div className="t-mask" />
      <div className="t-line t-line-h" />
      <div className="t-line t-line-v" />
      <div className="t-label">
        <div className="cap t-step">→ Jump</div>
        <div className="zh t-tgt">{labels[target]}</div>
      </div>
      <style>{`
        .t-overlay { position: fixed; inset: 0; z-index: 200; pointer-events: none; }
        .t-mask {
          position: absolute; inset: 0;
          background: var(--bg);
          clip-path: polygon(0 50%, 100% 50%, 100% 50%, 0 50%);
          animation: tMaskIn 0.45s cubic-bezier(.7,0,.3,1) forwards, tMaskOut 0.45s cubic-bezier(.7,0,.3,1) 0.45s forwards;
        }
        @keyframes tMaskIn { to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
        @keyframes tMaskOut { from { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); } }
        .t-line {
          position: absolute;
          background: var(--ink);
        }
        .t-line-h { left: 0; right: 0; top: 50%; height: 1px; transform: scaleX(0); animation: tLineH 0.9s cubic-bezier(.7,0,.3,1) forwards; transform-origin: 50% 50%; }
        @keyframes tLineH { 0% { transform: scaleX(0); } 35% { transform: scaleX(1); } 100% { transform: scaleX(1); opacity: 0; } }
        .t-line-v { top: 0; bottom: 0; left: 50%; width: 1px; transform: scaleY(0); animation: tLineV 0.9s cubic-bezier(.7,0,.3,1) 0.05s forwards; transform-origin: 50% 50%; }
        @keyframes tLineV { 0% { transform: scaleY(0); } 35% { transform: scaleY(1); } 100% { transform: scaleY(1); opacity: 0; } }
        .t-label {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          display: flex; flex-direction: column; gap: 14px; align-items: center;
          animation: tLabel 0.9s cubic-bezier(.7,0,.3,1);
        }
        @keyframes tLabel {
          0%, 20% { opacity: 0; }
          40%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .t-step { letter-spacing: 0.4em; }
        .t-tgt { font-size: 56px; font-weight: 300; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );
}

window.Nav = Nav;
window.Transition = Transition;
