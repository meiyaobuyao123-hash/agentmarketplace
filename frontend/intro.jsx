/* Intro · quiet 3-stage cinematic · ~3.4s */
const { useState: useStateI, useEffect: useEffectI } = React;

function Intro({ onDone }) {
  const [stage, setStage] = useStateI(0);

  useEffectI(() => {
    const t = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 2900),
      setTimeout(() => onDone && onDone(), 3600),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const skip = () => { setStage(3); setTimeout(() => onDone && onDone(), 500); };

  return (
    <div className={"intro stage-" + stage}>
      <div className="i-meridian" />
      <div className="i-rule top" />
      <div className="i-rule bot" />

      <div className="i-tl">
        <span className="cap">N 31°14′ · E 121°28′</span>
      </div>
      <div className="i-tr">
        <span className="cap">v2.6 · 0x7A3F</span>
      </div>
      <div className="i-bl">
        <span className="dot-live" />
        <span className="cap s">Booting · holographic stream</span>
      </div>

      <div className="i-content">
        <div className="i-pre cap s">— A marketplace of agents —</div>
        <h1 className="i-title">
          <span className="zh i-zh">万象</span>
        </h1>
        <div className="i-sub">
          <span className="serif i-serif">a quiet workshop</span>
        </div>
        <div className="i-meta">
          <span className="cap">1,247 agents</span>
          <span className="i-dot" />
          <span className="cap">38 industries</span>
          <span className="i-dot" />
          <span className="cap">89 capabilities</span>
        </div>
      </div>

      <button className="i-skip" onClick={skip}>
        <span className="cap">skip</span>
        <span className="cap">↗</span>
      </button>

      <style>{introCss}</style>
    </div>
  );
}

const introCss = `
.intro {
  position: fixed; inset: 0;
  background: var(--bg);
  z-index: 9999;
  display: grid; place-items: center;
  transition: opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1);
}
.intro.stage-3 { opacity: 0; transform: scale(1.015); pointer-events: none; }

.i-meridian {
  position: absolute; left: 50%; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--line-strong), transparent);
  transform: scaleY(0); transform-origin: 50% 50%;
  transition: transform 1.2s cubic-bezier(.7,0,.3,1);
}
.intro.stage-1 .i-meridian, .intro.stage-2 .i-meridian, .intro.stage-3 .i-meridian { transform: scaleY(1); }

.i-rule {
  position: absolute; left: 0; right: 0; height: 1px;
  background: var(--line);
  transform: scaleX(0); transform-origin: 50% 50%;
  transition: transform 1.2s cubic-bezier(.7,0,.3,1);
}
.i-rule.top { top: 64px; }
.i-rule.bot { bottom: 64px; }
.intro.stage-1 .i-rule, .intro.stage-2 .i-rule, .intro.stage-3 .i-rule { transform: scaleX(1); }

.i-tl, .i-tr, .i-bl {
  position: absolute;
  display: flex; gap: 8px; align-items: center;
  opacity: 0; transition: opacity 0.6s 0.4s;
}
.intro.stage-1 .i-tl, .intro.stage-2 .i-tl, .intro.stage-3 .i-tl,
.intro.stage-1 .i-tr, .intro.stage-2 .i-tr, .intro.stage-3 .i-tr,
.intro.stage-1 .i-bl, .intro.stage-2 .i-bl, .intro.stage-2 .i-bl, .intro.stage-3 .i-bl { opacity: 1; }
.i-tl { top: 36px; left: 36px; }
.i-tr { top: 36px; right: 36px; }
.i-bl { bottom: 36px; left: 36px; }

.i-content {
  display: flex; flex-direction: column; align-items: center;
  gap: 28px; text-align: center;
}
.i-pre { opacity: 0; transition: opacity 0.6s 0.5s; letter-spacing: 0.4em; }
.intro.stage-1 .i-pre, .intro.stage-2 .i-pre { opacity: 1; }

.i-zh {
  font-size: 200px;
  font-weight: 200;
  letter-spacing: 0.16em;
  padding-left: 0.16em;
  line-height: 0.95;
  opacity: 0;
  filter: blur(24px);
  transform: translateY(8px);
  transition: opacity 1.1s 0.5s cubic-bezier(.4,0,.2,1),
              filter 1.1s 0.5s cubic-bezier(.4,0,.2,1),
              transform 1.1s 0.5s cubic-bezier(.4,0,.2,1);
}
.intro.stage-1 .i-zh, .intro.stage-2 .i-zh, .intro.stage-3 .i-zh {
  opacity: 1; filter: blur(0); transform: translateY(0);
}

.i-serif {
  font-size: 42px;
  color: var(--ink-70);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.8s 1s, transform 0.8s 1s;
}
.intro.stage-2 .i-serif, .intro.stage-3 .i-serif { opacity: 1; transform: translateY(0); }

.i-meta {
  display: flex; gap: 18px; align-items: center;
  opacity: 0; transition: opacity 0.6s 1.4s;
}
.intro.stage-2 .i-meta, .intro.stage-3 .i-meta { opacity: 1; }
.i-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-40); }

.i-skip {
  position: absolute; bottom: 36px; right: 36px;
  display: flex; gap: 10px; align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--line);
  color: var(--ink-70);
  transition: all 0.3s;
  opacity: 0;
}
.intro.stage-1 .i-skip, .intro.stage-2 .i-skip { opacity: 1; transition-delay: 0.6s; }
.i-skip:hover { color: var(--ink); border-color: var(--line-strong); }
`;

window.Intro = Intro;
