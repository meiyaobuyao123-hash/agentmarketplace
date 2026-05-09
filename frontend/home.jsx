/* HOME · quiet centerpiece · wireframe network sphere */
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH, useMemo: useMemoH } = React;

function Home() {
  return (
    <div className="home">
      <div className="grid-bg" />
      <div className="vignette" />

      {/* Edge HUD */}
      <div className="h-edge tl">
        <div className="cap">N 31°14′22″ · E 121°28′41″</div>
        <div className="cap s">Beijing · 北京时间</div>
        <ChronoTime />
      </div>
      <div className="h-edge tr">
        <div className="cap s">Stream / 01</div>
        <div className="rec">
          <span className="dot-live" /> <span className="cap">Recording</span>
        </div>
        <div className="cap">Frame · 00:00:14</div>
      </div>
      <div className="h-edge bl">
        <div className="cap s">Catalogue · index</div>
        <div className="ix-list">
          <div className="ix-row"><span className="cap">01</span><span className="zh">软件工程</span><span className="cap">186</span></div>
          <div className="ix-row"><span className="cap">02</span><span className="zh">视觉创作</span><span className="cap">214</span></div>
          <div className="ix-row"><span className="cap">03</span><span className="zh">金融数据</span><span className="cap">128</span></div>
          <div className="ix-row"><span className="cap">04</span><span className="zh">内容营销</span><span className="cap">172</span></div>
          <div className="ix-row dim"><span className="cap">··</span><span className="zh">+34 个行业</span><span className="cap">547</span></div>
        </div>
      </div>
      <div className="h-edge br">
        <div className="cap s">Signal · uplink</div>
        <SignalBars />
      </div>

      {/* Center stage */}
      <div className="h-stage">
        <div className="h-pre">
          <span className="hr-line" />
          <span className="cap s">A marketplace of agents</span>
          <span className="hr-line" />
        </div>

        <WireSphere />

        <div className="h-headline">
          <h1 className="zh h-zh">
            <span className="hz-first">你</span>
            {'认为这个世界是数字化的吗'.split('').map((c, i) => (
              <span key={i} className="hz-char" style={{animationDelay: (0.69 + i * 0.11) + 's'}}>{c}</span>
            ))}
          </h1>
          <span className="serif h-serif">is the world we live in,&nbsp;digital?</span>
        </div>

        <p className="zh h-sub">
          一千两百四十七位 Agent，三十八个行业。
          <span className="dim"> 一句话即一项工程。</span>
        </p>

        <div className="h-cta-row">
          <button className="cta-primary">
            <span className="zh">开始召唤</span>
            <span className="cap">⌘ K</span>
          </button>
          <button className="cta-ghost">
            <span className="cap">观看影片</span>
            <span className="cta-arrow">↗</span>
          </button>
        </div>
      </div>

      {/* Bottom KPI ledger */}
      <div className="h-ledger">
        <div className="hr" />
        <div className="ledger-row">
          <Stat n="01" label="Agents online" zh="在线节点" value="1,247" delta="+24" />
          <Stat n="02" label="Calls / 24h" zh="二十四小时调用" value="14.2M" delta="+18.4%" />
          <Stat n="03" label="Industries" zh="覆盖行业" value="38" delta="—" />
          <Stat n="04" label="Avg latency" zh="平均响应" value="284" unit="ms" delta="−12 ms" />
        </div>
      </div>

      <style>{homeCss}</style>
    </div>
  );
}

function Stat({ n, label, zh, value, unit, delta }) {
  return (
    <div className="stat">
      <div className="stat-head">
        <span className="cap">{n}</span>
        <span className="cap s">{label}</span>
      </div>
      <div className="stat-val">
        <span className="stat-num">{value}</span>
        {unit && <span className="stat-unit cap">{unit}</span>}
      </div>
      <div className="stat-foot">
        <span className="zh dim">{zh}</span>
        <span className="cap s">{delta}</span>
      </div>
    </div>
  );
}

function ChronoTime() {
  const [now, setNow] = useStateH(new Date());
  useEffectH(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n) => String(n).padStart(2,'0');
  return (
    <div className="chrono">
      <span className="chrono-big">{p(now.getHours())}:{p(now.getMinutes())}</span>
      <span className="cap dim">:{p(now.getSeconds())}</span>
    </div>
  );
}

function SignalBars() {
  return (
    <div className="signal">
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <div key={i} className="sig-bar" style={{ animationDelay: (i*0.06)+"s", height: (4 + (i%3)*5)+"px" }} />
      ))}
    </div>
  );
}

/* WireSphere — fibonacci dots projected with rAF rotation */
function WireSphere() {
  const ref = useRefH(null);
  const dotsRef = useRefH(null);
  const N = 110;

  const dots = useMemoH(() => {
    const palette = ["#8B7FE8","#E26B8C","#E8946A","#6E96B8","#7AAE8C"];
    const arr = [];
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      arr.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
        live: i % 17 === 0,
        color: palette[i % palette.length],
      });
    }
    return arr;
  }, []);

  useEffectH(() => {
    let angle = 0;
    let raf;
    const loop = () => {
      angle += 0.0035;
      const tilt = -0.42;
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const r = 218;
      const cx = 320, cy = 320;
      const circles = dotsRef.current?.querySelectorAll(".w-dot");
      if (!circles) return;
      dots.forEach((d, i) => {
        // rotate around Y
        const x1 = d.x * cosA - d.z * sinA;
        const z1 = d.x * sinA + d.z * cosA;
        // tilt around X
        const y2 = d.y * ct - z1 * st;
        const z2 = d.y * st + z1 * ct;
        const c = circles[i];
        c.setAttribute("cx", cx + x1 * r);
        c.setAttribute("cy", cy + y2 * r);
        const depth = (z2 + 1) / 2; // 0 (back) to 1 (front)
        c.setAttribute("opacity", String(0.10 + depth * 0.9));
        c.setAttribute("r", String(0.7 + depth * 1.8));
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="wire-sphere" ref={ref} data-mouse-tilt="6">
      <svg viewBox="0 0 640 640" className="ws-svg">
        <defs>
          <radialGradient id="wsHaze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,127,232,0.30)" />
            <stop offset="60%" stopColor="rgba(226,107,140,0.20)" />
            <stop offset="100%" stopColor="rgba(10,9,16,0)" />
          </radialGradient>
          <linearGradient id="wsRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B7FE8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#E26B8C" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#E8946A" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {/* haze fill */}
        <circle cx="320" cy="320" r="218" fill="url(#wsHaze)" />
        {/* outer ring */}
        <circle cx="320" cy="320" r="218" fill="none" stroke="url(#wsRing)" strokeWidth="1.2" />
        {/* axial ellipses (stationary, decorative) */}
        {[0.95, 0.7, 0.42, 0.18].map((s, i) => (
          <ellipse key={"l"+i} cx="320" cy="320" rx="218" ry={218 * s * 0.42}
            fill="none" stroke="rgba(244,242,238,0.06)" strokeWidth="0.6" />
        ))}
        {/* meridian */}
        {[0, 30, 60, 90, 120, 150].map((deg, i) => (
          <ellipse key={"m"+i} cx="320" cy="320" rx={218 * Math.abs(Math.cos(deg * Math.PI/180))} ry="218"
            fill="none" stroke="rgba(244,242,238,0.04)" strokeWidth="0.4" />
        ))}
        {/* equator */}
        <line x1="100" y1="320" x2="540" y2="320" stroke="rgba(244,242,238,0.08)" strokeWidth="0.6" strokeDasharray="2 4" />
        {/* dots */}
        <g ref={dotsRef}>
          {dots.map((d, i) => (
            <circle key={i} className={"w-dot " + (d.live ? "live" : "")} cx="320" cy="320" r="1"
                    fill={d.color}
                    style={{filter: d.live ? `drop-shadow(0 0 6px ${d.color})` : `drop-shadow(0 0 3px ${d.color}88)`}} />
          ))}
        </g>
        {/* center crosshair */}
        <g stroke="rgba(244,242,238,0.18)" strokeWidth="0.8">
          <line x1="316" y1="320" x2="324" y2="320" />
          <line x1="320" y1="316" x2="320" y2="324" />
        </g>
      </svg>

      {/* Floating annotations */}
      <Annot x="14%" y="22%" tag="SF · 02" zh="旧金山" delay={0} />
      <Annot x="78%" y="34%" tag="TYO · 07" zh="东京" delay={0.4} />
      <Annot x="86%" y="64%" tag="SIN · 11" zh="新加坡" delay={0.8} />
      <Annot x="9%"  y="71%" tag="LDN · 04" zh="伦敦" delay={1.2} />
    </div>
  );
}

function Annot({ x, y, tag, zh, delay }) {
  return (
    <div className="annot" style={{ left: x, top: y, animationDelay: delay+"s" }}>
      <div className="annot-leader" />
      <div className="annot-dot"><span className="dot-live" /></div>
      <div className="annot-meta">
        <div className="cap s">{tag}</div>
        <div className="zh annot-zh">{zh}</div>
      </div>
    </div>
  );
}

const homeCss = `
.home { position: absolute; inset: 0; padding: 100px 36px 24px; overflow: hidden; display: flex; flex-direction: column; }

.h-edge {
  position: absolute;
  display: flex; flex-direction: column; gap: 10px;
  pointer-events: none;
  z-index: 3;
}
.h-edge.tl { top: 110px; left: 36px; }
.h-edge.tr { top: 110px; right: 36px; align-items: flex-end; text-align: right; }
.h-edge.bl { bottom: 170px; left: 36px; }
.h-edge.br { bottom: 170px; right: 36px; align-items: flex-end; }
@media (max-height: 760px) {
  .h-edge.bl, .h-edge.br { display: none; }
}

.chrono {
  display: flex; align-items: baseline; gap: 6px;
  margin-top: 6px;
}
.chrono-big {
  font-family: var(--f-sans);
  font-size: 36px; font-weight: 300;
  letter-spacing: 0.04em;
  line-height: 1;
}

.rec {
  display: flex; gap: 8px; align-items: center;
}

.ix-list { display: flex; flex-direction: column; gap: 4px; min-width: 220px; }
.ix-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 16px; align-items: baseline;
  padding: 4px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
}
.ix-row .zh { color: var(--ink-70); }
.ix-row.dim .zh { color: var(--ink-40); }

.signal { display: flex; gap: 3px; align-items: flex-end; height: 20px; margin-top: 4px; }
.sig-bar {
  width: 3px;
  background: var(--ink-70);
  animation: sigPulse 1.6s ease-in-out infinite alternate;
}
@keyframes sigPulse {
  0% { transform: scaleY(0.4); opacity: 0.4; }
  100% { transform: scaleY(1); opacity: 1; }
}

/* Center stage */
.h-stage {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px;
  width: 100%;
  text-align: center;
  min-height: 0;
  overflow: hidden;
}
.h-stage > * { flex-shrink: 0; }
@media (max-height: 760px) {
  .wire-sphere { width: 200px !important; height: 200px !important; }
  .h-zh { font-size: 56px !important; }
  .h-serif { font-size: 16px !important; }
  .h-sub { display: none; }
  .h-pre { display: none; }
}
@media (max-height: 620px) {
  .wire-sphere { width: 140px !important; height: 140px !important; }
  .h-zh { font-size: 40px !important; }
}

.h-pre {
  display: flex; gap: 14px; align-items: center;
  width: 100%;
  justify-content: center;
}
.hr-line { flex: 1; max-width: 120px; height: 1px; background: var(--line-strong); }

.wire-sphere {
  position: relative;
  width: 260px; height: 260px;
  margin: 0;
  flex-shrink: 0;
}
.ws-svg { width: 100%; height: 100%; display: block; }
.w-dot.live { filter: drop-shadow(0 0 4px var(--live)); }

.annot {
  position: absolute;
  display: flex; gap: 10px; align-items: center;
  opacity: 0;
  animation: annotIn 0.8s cubic-bezier(.4,0,.2,1) forwards;
}
.annot:nth-child(odd) { flex-direction: row-reverse; }
@keyframes annotIn { to { opacity: 1; } }
.annot-leader {
  width: 56px; height: 1px;
  background: var(--line-strong);
}
.annot-dot {
  width: 18px; height: 18px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  display: grid; place-items: center;
}
.annot-meta { display: flex; flex-direction: column; gap: 2px; }
.annot:nth-child(odd) .annot-meta { text-align: right; }
.annot-zh { font-size: 12px; color: var(--ink-70); }

/* Headline */
.h-headline {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  margin-top: 4px;
}
.h-zh {
  font-size: clamp(34px, 4.4vw, 60px);
  font-weight: 200;
  letter-spacing: 0.04em;
  padding-left: 0.04em;
  line-height: 1;
  color: var(--ink);
  white-space: nowrap;
}
.h-zh > span {
  display: inline-block;
  will-change: transform, opacity;
}
.hz-first {
  transform: translateY(-60vh);
  animation: hzDrop 0.6s cubic-bezier(.7,0,.3,1) forwards;
}
@keyframes hzDrop {
  to { transform: translateY(0); }
}
.hz-char {
  opacity: 0;
  transform: translateX(2px);
  animation: hzType 0.22s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes hzType {
  to { opacity: 1; transform: translateX(0); }
}
@keyframes hzReveal {
  to { opacity: 1; }
}
.h-serif {
  font-size: 18px;
  color: var(--ink-70);
  line-height: 1.2;
  opacity: 0;
  animation: hzReveal 0.7s 1.95s cubic-bezier(.4,0,.2,1) forwards;
}

.h-sub {
  font-size: 13px;
  color: var(--ink-70);
  line-height: 1.6;
  letter-spacing: 0.03em;
  max-width: 440px;
  margin-top: 4px;
  opacity: 0;
  animation: hzReveal 0.7s 2.30s cubic-bezier(.4,0,.2,1) forwards;
}

.h-cta-row {
  display: flex; gap: 12px;
  margin-top: 8px;
  opacity: 0;
  animation: hzReveal 0.7s 2.60s cubic-bezier(.4,0,.2,1) forwards;
}
.cta-primary {
  display: flex; gap: 14px; align-items: center;
  padding: 12px 20px;
  background: linear-gradient(95deg, #8B7FE8 0%, #E26B8C 55%, #E8946A 100%);
  color: #FFFFFF;
  font-size: 14px; font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 999px;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 8px 24px rgba(226,107,140,0.28), 0 0 0 1px rgba(255,255,255,0.10) inset;
}
.cta-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(226,107,140,0.40), 0 0 0 1px rgba(255,255,255,0.20) inset; }
.cta-primary kbd, .cta-primary .cap {
  padding: 3px 6px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 3px;
  background: rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.95);
}
.cta-ghost {
  display: flex; gap: 12px; align-items: center;
  padding: 11px 18px;
  border: 1px solid var(--line-strong);
  color: var(--ink-70);
  transition: all 0.3s;
}
.cta-ghost:hover { color: var(--ink); border-color: var(--ink); }
.cta-arrow { font-size: 14px; }

/* Ledger */
.h-ledger {
  flex-shrink: 0;
  display: flex; flex-direction: column; gap: 8px;
  margin-top: 14px;
}
.ledger-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.stat {
  padding: 0 22px;
  border-right: 1px solid var(--line);
  display: flex; align-items: baseline; gap: 12px;
}
.stat:first-child { padding-left: 0; }
.stat:last-child { border-right: none; }
.stat-head { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex-shrink: 0; }
.stat-val { display: flex; align-items: baseline; gap: 4px; flex: 1; }
.stat-num {
  font-family: var(--f-sans);
  font-size: 26px;
  font-weight: 300;
  letter-spacing: -0.01em;
  line-height: 1;
}
.stat-unit { font-size: 11px; color: var(--ink-40); }
.stat-foot { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
.stat-foot .zh { font-size: 11px; }
`;

window.Home = Home;
