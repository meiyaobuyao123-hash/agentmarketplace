/* App · root · tab routing + transition + tweaks */
const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "live",
  "headline_serif": true,
  "show_grid": true,
  "tab": "home"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = useStateA(TWEAK_DEFAULTS);
  const [tab, setTab] = useStateA(TWEAK_DEFAULTS.tab || "home");
  const [trans, setTrans] = useStateA({ active: false, target: null });

  useEffectA(() => {
    const onKey = (e) => {
      if (e.key === "1") doTransition("home");
      if (e.key === "2") doTransition("dashboard");
      if (e.key === "3") doTransition("library");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const doTransition = (target) => {
    if (target === tab) return;
    setTrans({ active: true, target });
    setTimeout(() => setTab(target), 450);
  };

  const setTweak = (k, v) => {
    const next = typeof k === "object" ? { ...tweaks, ...k } : { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({type:"__edit_mode_set_keys", edits: typeof k === "object" ? k : { [k]: v }}, "*");
  };

  // accent palette
  const accents = {
    live: "#6FE3F0",
    amber: "#E8C271",
    rose: "#E59FB6",
    violet: "#B8A6E8",
  };

  return (
    <div className="app" style={{
      "--live": accents[tweaks.accent] || accents.live,
      "--show-grid": tweaks.show_grid ? "block" : "none",
    }}>
      <Nav tab={tab} onTransition={doTransition} />

      <main className="stage">
        {tab === "home" && <Home />}
        {tab === "dashboard" && <Dashboard />}
        {tab === "library" && <Library />}
      </main>

      <Transition active={trans.active} target={trans.target}
                   onComplete={() => setTrans({ active: false, target: null })} />

      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Theme">
            <TweakColor label="Accent" value={tweaks.accent}
              options={[
                ["#6FE3F0"], ["#E8C271"], ["#E59FB6"], ["#B8A6E8"]
              ]}
              onChange={(_, idx) => setTweak("accent", ["live","amber","rose","violet"][idx])} />
          </TweakSection>
          <TweakSection title="Layout">
            <TweakToggle label="Background grid" value={tweaks.show_grid}
              onChange={v => setTweak("show_grid", v)} />
          </TweakSection>
          <TweakSection title="Jump">
            <TweakRadio label="Tab" value={tab}
              options={[["home","首页"], ["dashboard","看板"], ["library","万象集"]]}
              onChange={v => doTransition(v)} />
          </TweakSection>
        </TweaksPanel>
      )}

      <style>{`
        .stage { position: absolute; inset: 0; }
        .grid-bg {
          display: var(--show-grid);
          position: absolute; inset: 0;
          background-image:
            linear-gradient(to right, rgba(26,20,16,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,20,16,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(255,210,140,0.12) 100%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
