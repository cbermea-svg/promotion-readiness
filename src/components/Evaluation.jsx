import { BRAND } from '../constants/theme';
import { LEVELS } from '../constants/defaultSections';

export default function Evaluation({
    currentSection,
    sections,
    activeSectionId,
    setActiveSectionId,
    setScreen,
    getRating,
    setRating,
    sectionAvg,
    getLevelLabel,
    evaluatorName,
    setEvaluatorName,
    ratedCount,
    totalItems
}) {
    const currentIndex = sections.findIndex(s => s.id === activeSectionId);

    const S = {
        sectionCard: { background: BRAND.white, borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" },
        itemRow: (idx) => ({ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", background: idx % 2 === 0 ? BRAND.white : "#fafaf9", borderBottom: `1px solid ${BRAND.border}` }),
        levelBtn: (active, key) => ({
            padding: "5px 11px", borderRadius: 20,
            border: `1.5px solid ${active ? LEVELS[key].color : BRAND.border}`,
            background: active ? LEVELS[key].bg : BRAND.white,
            color: active ? LEVELS[key].accent : "#9ca3af",
            fontSize: 11, fontWeight: active ? "bold" : "normal",
            cursor: "pointer", fontFamily: "sans-serif", whiteSpace: "nowrap",
        }),
        btn: (primary) => ({
            padding: "10px 20px", borderRadius: 6, border: "none",
            background: primary ? BRAND.red : "#e5e7eb",
            color: primary ? BRAND.white : "#6b7280",
            fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", fontWeight: "bold",
        }),
    };

    if (!currentSection) return null;

    return (
        <>
            <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }} className="no-print">
                <input
                    style={{ padding: "8px 12px", border: `1.5px solid ${BRAND.border}`, borderRadius: 6, fontSize: 13, fontFamily: "'Georgia', serif", color: BRAND.black, outline: "none", minWidth: 180, background: BRAND.white }}
                    placeholder="Evaluator Name"
                    value={evaluatorName}
                    onChange={e => setEvaluatorName(e.target.value)}
                />
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", fontFamily: "sans-serif" }}>
                    {totalItems > 0 ? Math.round((ratedCount / totalItems) * 100) : 0}% complete
                </span>
            </div>

            <div style={S.sectionCard}>
                <div style={{ background: BRAND.black, padding: "16px 24px", borderBottom: `3px solid ${BRAND.red}` }}>
                    <div style={{ fontSize: 16, fontWeight: "bold", color: BRAND.white }}>
                        {currentIndex + 1}. {currentSection.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontFamily: "sans-serif" }}>
                        {(currentSection.items || []).filter((_, i) => getRating(currentSection.id, i)).length} of {(currentSection.items || []).length} rated
                        {sectionAvg(currentSection) > 0 && ` · Avg: ${Math.floor(sectionAvg(currentSection) * 100) / 100} — ${getLevelLabel(sectionAvg(currentSection))}`}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "7px 24px", background: "#f9fafb", borderBottom: `1px solid ${BRAND.border}` }}>
                    {Object.entries(LEVELS).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "sans-serif", color: v.accent }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.color }} />{v.label}
                        </div>
                    ))}
                </div>

                {(currentSection.items || []).map((item, i) => {
                    const rated = getRating(currentSection.id, i);
                    return (
                        <div key={i} style={S.itemRow(i)}>
                            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: "#374151" }}>{item}</div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                {Object.keys(LEVELS).map(k => (
                                    <button key={k} style={S.levelBtn(rated === k, k)} onClick={() => setRating(currentSection.id, i, k)}>
                                        {LEVELS[k].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }} className="no-print">
                <button
                    style={S.btn(false)}
                    disabled={currentIndex === 0}
                    onClick={() => { if (currentIndex > 0) setActiveSectionId(sections[currentIndex - 1].id); }}
                >
                    ← Previous
                </button>
                {currentIndex < sections.length - 1 ? (
                    <button style={S.btn(true)} onClick={() => { setActiveSectionId(sections[currentIndex + 1].id); }}>
                        Next Section →
                    </button>
                ) : (
                    <button style={S.btn(true)} onClick={() => setScreen("summary")}>
                        View Summary →
                    </button>
                )}
            </div>
        </>
    );
}
