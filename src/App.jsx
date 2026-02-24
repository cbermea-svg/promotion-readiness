import { useState } from 'react';
import { BRAND, LOGO_URI } from './constants/theme';
import { DEFAULT_SECTIONS, LEVELS } from './constants/defaultSections';
import { usePersistedState } from './hooks/usePersistedState';

import CoverPage from './components/CoverPage';
import SettingsPanel from './components/SettingsPanel';
import Evaluation from './components/Evaluation';
import Summary from './components/Summary';

function getReadiness(avg) {
  if (avg >= 2.6) return { label: "Strong Promotion Candidate", color: BRAND.red, bg: BRAND.lightRed, icon: "★" };
  if (avg >= 2.0) return { label: "Promotion Ready", color: "#1d6c3a", bg: "#dcfce7", icon: "✓" };
  if (avg >= 1.5) return { label: "Developing", color: "#92400e", bg: "#fef3c7", icon: "◑" };
  return { label: "Not Yet Ready", color: "#7f1d1d", bg: "#fee2e2", icon: "○" };
}

function getLevelLabel(avg) {
  if (avg >= 2.6) return "Master";
  if (avg >= 2.0) return "Intermediate";
  if (avg >= 1.0) return "Beginner";
  return "—";
}

export default function App() {
  const [screen, setScreen] = usePersistedState("pr_screen", "cover");

  const [sections, setSections] = usePersistedState("pr_sections", DEFAULT_SECTIONS);
  const [employeeName, setEmployeeName] = usePersistedState("pr_employeeName", "");
  const [jobTitle, setJobTitle] = usePersistedState("pr_jobTitle", "");
  const [evaluatorName, setEvaluatorName] = usePersistedState("pr_evaluatorName", "");
  const [ratings, setRatings] = usePersistedState("pr_ratings", {});
  const [activeSectionId, setActiveSectionId] = usePersistedState("pr_activeSectionId", sections[0]?.id || null);

  const [completedDate] = useState(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));

  const totalItems = sections.reduce((a, s) => a + (s.items?.length || 0), 0);
  const ratedCount = Object.keys(ratings).length;

  const setRating = (sectionId, itemIdx, level) =>
    setRatings(prev => ({ ...prev, [`${sectionId}-${itemIdx}`]: level }));
  const getRating = (sectionId, itemIdx) => ratings[`${sectionId}-${itemIdx}`] || null;

  const sectionAvg = (section) => {
    if (!section.items) return 0;
    const scores = section.items.map((_, i) => {
      const r = getRating(section.id, i);
      return r ? LEVELS[r].score : null;
    }).filter(Boolean);
    return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const sectionComplete = (section) => (section.items || []).every((_, i) => getRating(section.id, i));

  const overallAvg = () => {
    const all = Object.values(ratings).map(r => LEVELS[r].score);
    return all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  };

  const readiness = getReadiness(overallAvg());

  const handleStart = (name, title) => {
    setEmployeeName(name);
    setJobTitle(title);
    setActiveSectionId(sections[0]?.id || null);
    setRatings({}); // Reset ratings when a new eval starts
    setScreen("eval");
  };

  const handleSectionsChange = (updated) => {
    setSections(updated);
    const validKeys = new Set(updated.flatMap(s => (s.items || []).map((_, i) => `${s.id}-${i}`)));
    setRatings(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => validKeys.has(k))));
  };

  const handleEmailSummary = () => {
    const avg = overallAvg();
    const designation = avg > 0 ? getReadiness(avg).label : "Incomplete";
    let body = `PROMOTION READINESS SUMMARY\n${"=".repeat(50)}\n\n`;
    body += `Employee: ${employeeName}\nRole: ${jobTitle}\nEvaluator: ${evaluatorName || "Not specified"}\nDate Completed: ${completedDate}\n\n`;
    body += `OVERALL SCORE: ${avg.toFixed(2)} / 3.00\nREADINESS DESIGNATION: ${designation}\n\n`;
    body += `SECTION SCORES\n${"-".repeat(40)}\n`;
    sections.forEach(s => {
      const a = sectionAvg(s);
      body += `${s.id}. ${s.title}\n   Score: ${a > 0 ? a.toFixed(2) : "—"} / 3.00  (${a > 0 ? getLevelLabel(a) : "Not rated"})\n`;
    });
    body += `\nScoring: Beginner=1pt  Intermediate=2pts  Master=3pts`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Promotion Readiness – ${employeeName} – ${jobTitle}`)}&body=${encodeURIComponent(body)}`;
  };

  if (screen === "cover") return <CoverPage onStart={handleStart} onSettings={() => setScreen("settings")} />;
  if (screen === "settings") return <SettingsPanel sections={sections} onChange={handleSectionsChange} onBack={() => setScreen("cover")} />;

  const currentSection = sections.find(s => s.id === activeSectionId) || sections[0];

  const S = {
    app: { fontFamily: "'Georgia', serif", background: BRAND.offWhite, minHeight: "100vh", color: BRAND.black },
    topBar: { height: 4, background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.coral})` },
    header: { background: BRAND.black, color: BRAND.white, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { width: 34, height: 34, background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.coral})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 16, fontFamily: "serif", flexShrink: 0 },
    layout: { display: "flex", minHeight: "calc(100vh - 76px)" },
    sidebar: { width: 250, background: "#1a1c1b", padding: "18px 0", flexShrink: 0 },
    sidebarLabel: { fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", padding: "0 16px 10px" },
    navItem: (active, complete) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer",
      background: active ? "#2a1215" : "transparent",
      borderLeft: `3px solid ${active ? BRAND.red : "transparent"}`,
      color: active ? BRAND.white : complete ? "#6b7280" : "#4b5563",
    }),
    navDot: (active, complete) => ({
      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
      background: active ? BRAND.red : complete ? "#2d3530" : "#252827",
      color: active ? BRAND.white : complete ? BRAND.coral : "#4b5563",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: "bold", fontFamily: "monospace",
    }),
    navTitle: { fontSize: 11, fontFamily: "sans-serif", lineHeight: 1.3 },
    divider: { height: 1, background: "#252827", margin: "10px 16px" },
    main: { flex: 1, padding: "26px 32px", maxWidth: 820 },
  };

  return (
    <div style={S.app}>
      <div className="no-print" style={S.topBar} />
      <div className="no-print" style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LOGO_URI} alt="Soarion Credit Union" style={{ height: 32, width: "auto", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} onClick={() => setScreen("cover")} title="Return to Home" />
          <div>
            <div style={{ fontSize: 16, fontWeight: "bold" }}>Promotion Readiness Evaluator</div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "sans-serif", letterSpacing: "0.05em" }}>
              {employeeName && <><strong style={{ color: "#d1d5db" }}>{employeeName}</strong> · </>}
              {jobTitle && <span style={{ color: BRAND.coral }}>{jobTitle}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: "bold", fontFamily: "monospace" }}>{ratedCount}/{totalItems}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Rated</div>
          </div>
          <button
            className="no-print"
            onClick={() => {
              if (window.confirm("Start a new evaluation? Current progress will be lost.")) {
                setScreen("cover");
              }
            }}
            title="Start Over"
            style={{ background: "#252827", border: "none", color: "#9ca3af", cursor: "pointer", padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: "bold" }}
          >
            Start Over
          </button>
          <button
            className="no-print"
            onClick={() => setScreen("settings")}
            title="Settings"
            style={{ background: "#252827", border: "none", color: "#9ca3af", cursor: "pointer", padding: "8px 12px", borderRadius: 6, fontSize: 16 }}
          >
            ⚙
          </button>
        </div>
      </div>

      <div style={S.layout}>
        <div className="no-print" style={S.sidebar}>
          <div style={S.sidebarLabel}>Competency Areas</div>
          {sections.map((s, idx) => {
            const complete = sectionComplete(s);
            const active = s.id === activeSectionId && screen === "eval";
            return (
              <div key={s.id} style={S.navItem(active, complete)} onClick={() => { setActiveSectionId(s.id); setScreen("eval"); }}>
                <div style={S.navDot(active, complete)}>{complete ? "✓" : idx + 1}</div>
                <div style={S.navTitle}>{s.title}</div>
              </div>
            );
          })}
          <div style={S.divider} />
          <div style={S.navItem(screen === "summary", false)} onClick={() => setScreen("summary")}>
            <div style={S.navDot(screen === "summary", false)}>◎</div>
            <div style={S.navTitle}>Summary & Recommendation</div>
          </div>
        </div>

        <div style={S.main} className="print-full-width">
          {screen === "eval" && (
            <Evaluation
              currentSection={currentSection}
              sections={sections}
              activeSectionId={activeSectionId}
              setActiveSectionId={setActiveSectionId}
              setScreen={setScreen}
              getRating={getRating}
              setRating={setRating}
              sectionAvg={sectionAvg}
              getLevelLabel={getLevelLabel}
              evaluatorName={evaluatorName}
              setEvaluatorName={setEvaluatorName}
              ratedCount={ratedCount}
              totalItems={totalItems}
            />
          )}

          {screen === "summary" && (
            <Summary
              sections={sections}
              ratings={ratings}
              overallAvg={overallAvg}
              sectionAvg={sectionAvg}
              readiness={readiness}
              getLevelLabel={getLevelLabel}
              employeeName={employeeName}
              jobTitle={jobTitle}
              evaluatorName={evaluatorName}
              completedDate={completedDate}
              totalItems={totalItems}
              setScreen={setScreen}
              setActiveSectionId={setActiveSectionId}
              handleEmailSummary={handleEmailSummary}
            />
          )}
        </div>
      </div>
    </div>
  );
}
